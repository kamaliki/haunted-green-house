import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { MqttClientService } from '../../../common/services/mqtt/mqtt-client.service';
import { IrrigationService } from '../irrigation.service';

@Injectable()
export class IrrigationMqttService implements OnModuleInit {
  private readonly logger = new Logger(IrrigationMqttService.name);

  constructor(
    private mqttClientService: MqttClientService,
    private irrigationService: IrrigationService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.subscribeToAlerts();
  }

  private async subscribeToAlerts(): Promise<void> {
    // Subscribe to low soil moisture alerts from EnvironmentModule
    await this.mqttClientService.subscribe(
      'greenhouse/alerts/low_soil_moisture',
      this.handleLowMoistureAlert.bind(this),
    );

    this.logger.log('Subscribed to irrigation alert topics');
  }

  private async handleLowMoistureAlert(topic: string, payload: Buffer): Promise<void> {
    try {
      const alert = JSON.parse(payload.toString());
      this.logger.log(`Low moisture alert received: ${alert.deviceId} - ${alert.value}%`);

      await this.irrigationService.handleLowMoistureAlert(alert);
    } catch (error) {
      this.logger.error(`Error handling low moisture alert: ${error.message}`, error.stack);
    }
  }
}
