import { Module } from '@nestjs/common';
import { SecurityService } from './security.service';
import { SecurityController } from './security.controller';
import { SecurityMqttService } from './mqtt/security-mqtt.service';
import { InfluxDbModule } from '../../common/services/influxdb/influxdb.module';
import { AlertModule } from '../alerts/alert.module';
import { MqttModule } from '../../common/services/mqtt/mqtt.module';

@Module({
  imports: [InfluxDbModule, AlertModule, MqttModule],
  controllers: [SecurityController],
  providers: [SecurityService, SecurityMqttService],
  exports: [SecurityService],
})
export class SecurityModule {}
