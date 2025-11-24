import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { IrrigationController } from './irrigation.controller';
import { IrrigationService } from './irrigation.service';
import { IrrigationMqttService } from './mqtt/irrigation-mqtt.service';
import { MqttModule } from '../../common/services/mqtt/mqtt.module';
import { InfluxDbModule } from '../../common/services/influxdb/influxdb.module';

@Module({
  imports: [ConfigModule, MqttModule, InfluxDbModule],
  controllers: [IrrigationController],
  providers: [IrrigationService, IrrigationMqttService],
  exports: [IrrigationService],
})
export class IrrigationModule {}
