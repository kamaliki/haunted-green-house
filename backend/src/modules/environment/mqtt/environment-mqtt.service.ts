import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { MqttClientService } from '../../../common/services/mqtt/mqtt-client.service';
import { EnvironmentService } from '../environment.service';
import { SensorReading } from '../interfaces/sensor-reading.interface';
import { SensorType } from '../dto/sensor-reading.dto';

@Injectable()
export class EnvironmentMqttService implements OnModuleInit {
  private readonly logger = new Logger(EnvironmentMqttService.name);

  constructor(
    private mqttClientService: MqttClientService,
    private environmentService: EnvironmentService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.subscribeToSensorTopics();
  }

  private async subscribeToSensorTopics(): Promise<void> {
    // Subscribe to individual sensor readings
    await this.mqttClientService.subscribe(
      'greenhouse/sensors/+/+',
      this.handleSensorReading.bind(this),
    );

    // Subscribe to batch readings
    await this.mqttClientService.subscribe(
      'greenhouse/sensors/+/batch',
      this.handleBatchReading.bind(this),
    );

    this.logger.log('Subscribed to sensor MQTT topics');
  }

  private async handleSensorReading(topic: string, payload: Buffer): Promise<void> {
    try {
      const data = JSON.parse(payload.toString());
      
      const reading: SensorReading = {
        deviceId: data.deviceId,
        sensorType: data.sensorType as SensorType,
        value: parseFloat(data.value),
        unit: data.unit,
        timestamp: new Date(data.timestamp),
      };

      await this.environmentService.processSensorReading(reading);
    } catch (error) {
      this.logger.error(`Error processing sensor reading from ${topic}: ${error.message}`, error.stack);
    }
  }

  private async handleBatchReading(topic: string, payload: Buffer): Promise<void> {
    try {
      const data = JSON.parse(payload.toString());
      const timestamp = new Date(data.timestamp);

      for (const reading of data.readings) {
        const sensorReading: SensorReading = {
          deviceId: data.deviceId,
          sensorType: reading.sensorType as SensorType,
          value: parseFloat(reading.value),
          unit: reading.unit,
          timestamp,
        };

        await this.environmentService.processSensorReading(sensorReading);
      }
    } catch (error) {
      this.logger.error(`Error processing batch reading from ${topic}: ${error.message}`, error.stack);
    }
  }
}
