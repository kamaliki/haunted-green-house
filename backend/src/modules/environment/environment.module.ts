import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EnvironmentController } from './environment.controller';
import { EnvironmentService } from './environment.service';
import { EnvironmentMqttService } from './mqtt/environment-mqtt.service';
import { MqttModule } from '../../common/services/mqtt/mqtt.module';
import { InfluxDbModule } from '../../common/services/influxdb/influxdb.module';
import { AlertModule } from '../alerts/alert.module';

@Module({
  imports: [ConfigModule, MqttModule, InfluxDbModule, AlertModule],
  controllers: [EnvironmentController],
  providers: [EnvironmentService, EnvironmentMqttService],
  exports: [EnvironmentService],
})
export class EnvironmentModule {}
