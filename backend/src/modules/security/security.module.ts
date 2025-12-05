import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { SecurityService } from './security.service';
import { SecurityController } from './security.controller';
import { SecurityMqttService } from './mqtt/security-mqtt.service';
import { AccessPointMonitoringService } from './services/access-point-monitoring.service';
import { InfluxDbModule } from '../../common/services/influxdb/influxdb.module';
import { AlertModule } from '../alerts/alert.module';
import { MqttModule } from '../../common/services/mqtt/mqtt.module';
import { AccessPoint } from './entities/access-point.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AccessPoint]),
    ScheduleModule.forRoot(),
    InfluxDbModule,
    AlertModule,
    MqttModule,
  ],
  controllers: [SecurityController],
  providers: [SecurityService, SecurityMqttService, AccessPointMonitoringService],
  exports: [SecurityService, AccessPointMonitoringService],
})
export class SecurityModule {}
