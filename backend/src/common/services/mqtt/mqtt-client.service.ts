import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as mqtt from 'mqtt';

@Injectable()
export class MqttClientService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MqttClientService.name);
  private client: mqtt.MqttClient;
  private messageHandlers: Map<string, Array<(topic: string, payload: Buffer) => void>> = new Map();

  constructor(private configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    await this.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.disconnect();
  }

  private async connect(): Promise<void> {
    const brokerUrl = this.configService.get<string>('MQTT_BROKER_URL', 'mqtt://localhost:1883');
    const username = this.configService.get<string>('MQTT_USERNAME');
    const password = this.configService.get<string>('MQTT_PASSWORD');
    const clientId = `${this.configService.get<string>('MQTT_CLIENT_ID_PREFIX', 'greenhouse')}-${Date.now()}`;

    this.logger.log(`Connecting to MQTT broker: ${brokerUrl}`);

    this.client = mqtt.connect(brokerUrl, {
      clientId,
      username,
      password,
      clean: true,
      reconnectPeriod: 5000,
      connectTimeout: 30000,
    });

    this.client.on('connect', () => {
      this.logger.log('Successfully connected to MQTT broker');
    });

    this.client.on('error', (error) => {
      this.logger.error(`MQTT connection error: ${error.message}`, error.stack);
    });

    this.client.on('reconnect', () => {
      this.logger.warn('Reconnecting to MQTT broker...');
    });

    this.client.on('close', () => {
      this.logger.warn('MQTT connection closed');
    });

    this.client.on('message', (topic, payload) => {
      this.handleMessage(topic, payload);
    });

    return new Promise((resolve, reject) => {
      this.client.once('connect', () => resolve());
      this.client.once('error', (error) => reject(error));
    });
  }

  private async disconnect(): Promise<void> {
    if (this.client) {
      this.logger.log('Disconnecting from MQTT broker');
      await this.client.endAsync();
    }
  }

  async subscribe(topic: string, handler: (topic: string, payload: Buffer) => void): Promise<void> {
    if (!this.messageHandlers.has(topic)) {
      this.messageHandlers.set(topic, []);
      
      await this.client.subscribeAsync(topic, { qos: 1 });
      this.logger.log(`Subscribed to topic: ${topic}`);
    }

    this.messageHandlers.get(topic).push(handler);
  }

  async unsubscribe(topic: string): Promise<void> {
    if (this.messageHandlers.has(topic)) {
      await this.client.unsubscribeAsync(topic);
      this.messageHandlers.delete(topic);
      this.logger.log(`Unsubscribed from topic: ${topic}`);
    }
  }

  async publish(topic: string, message: string | Buffer, options?: mqtt.IClientPublishOptions): Promise<void> {
    const publishOptions: mqtt.IClientPublishOptions = {
      qos: 1,
      retain: false,
      ...options,
    };

    await this.client.publishAsync(topic, message, publishOptions);
    this.logger.debug(`Published to topic ${topic}: ${message.toString().substring(0, 100)}`);
  }

  private handleMessage(topic: string, payload: Buffer): void {
    // Find matching handlers (including wildcard matches)
    for (const [pattern, handlers] of this.messageHandlers.entries()) {
      if (this.topicMatches(pattern, topic)) {
        handlers.forEach(handler => {
          try {
            handler(topic, payload);
          } catch (error) {
            this.logger.error(`Error in message handler for topic ${topic}: ${error.message}`, error.stack);
          }
        });
      }
    }
  }

  private topicMatches(pattern: string, topic: string): boolean {
    const patternParts = pattern.split('/');
    const topicParts = topic.split('/');

    if (patternParts.length > topicParts.length) {
      return false;
    }

    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i] === '#') {
        return true; // Multi-level wildcard matches everything after
      }
      if (patternParts[i] === '+') {
        continue; // Single-level wildcard matches any single level
      }
      if (patternParts[i] !== topicParts[i]) {
        return false;
      }
    }

    return patternParts.length === topicParts.length;
  }

  isConnected(): boolean {
    return this.client && this.client.connected;
  }
}
