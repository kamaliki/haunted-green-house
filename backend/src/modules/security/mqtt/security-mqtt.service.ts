import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { MqttClientService } from '../../../common/services/mqtt/mqtt-client.service';
import { SecurityService } from '../security.service';
import { MotionEvent, AccessPointStatus } from '../interfaces/security.interface';

@Injectable()
export class SecurityMqttService implements OnModuleInit {
  private readonly logger = new Logger(SecurityMqttService.name);

  constructor(
    private readonly mqttClient: MqttClientService,
    private readonly securityService: SecurityService,
  ) {}

  async onModuleInit() {
    await this.subscribeToSecurityTopics();
  }

  private async subscribeToSecurityTopics() {
    // Subscribe to motion detection topics
    await this.mqttClient.subscribe(
      'greenhouse/security/motion/+',
      this.handleMotionMessage.bind(this),
    );

    // Subscribe to door status topics
    await this.mqttClient.subscribe(
      'greenhouse/security/door/+',
      this.handleDoorMessage.bind(this),
    );

    // Subscribe to window status topics
    await this.mqttClient.subscribe(
      'greenhouse/security/window/+',
      this.handleWindowMessage.bind(this),
    );

    this.logger.log('Subscribed to security MQTT topics');
  }

  private async handleMotionMessage(topic: string, payload: Buffer) {
    try {
      const data = JSON.parse(payload.toString());
      const location = topic.split('/').pop() || 'unknown';

      const motionEvent: MotionEvent = {
        timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
        location: data.location || location,
        confidence: data.confidence || 100,
        sensorId: data.sensorId || `motion_${location}`,
      };

      await this.securityService.handleMotionDetection(motionEvent);
    } catch (error) {
      this.logger.error(`Failed to handle motion message: ${error.message}`);
    }
  }

  private async handleDoorMessage(topic: string, payload: Buffer) {
    try {
      const data = JSON.parse(payload.toString());
      const doorId = topic.split('/').pop() || 'unknown';

      const accessPoint: AccessPointStatus = {
        id: data.id || `door_${doorId}`,
        type: 'door',
        location: data.location || doorId,
        status: data.status === 'open' ? 'open' : 'closed',
        lastChanged: data.timestamp ? new Date(data.timestamp) : new Date(),
      };

      await this.securityService.updateAccessPointStatus(accessPoint);
    } catch (error) {
      this.logger.error(`Failed to handle door message: ${error.message}`);
    }
  }

  private async handleWindowMessage(topic: string, payload: Buffer) {
    try {
      const data = JSON.parse(payload.toString());
      const windowId = topic.split('/').pop() || 'unknown';

      const accessPoint: AccessPointStatus = {
        id: data.id || `window_${windowId}`,
        type: 'window',
        location: data.location || windowId,
        status: data.status === 'open' ? 'open' : 'closed',
        lastChanged: data.timestamp ? new Date(data.timestamp) : new Date(),
      };

      await this.securityService.updateAccessPointStatus(accessPoint);
    } catch (error) {
      this.logger.error(`Failed to handle window message: ${error.message}`);
    }
  }
}
