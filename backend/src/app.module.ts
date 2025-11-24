import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MqttModule } from './common/services/mqtt/mqtt.module';
import { InfluxDbModule } from './common/services/influxdb/influxdb.module';
import { EnvironmentModule } from './modules/environment/environment.module';
import { IrrigationModule } from './modules/irrigation/irrigation.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
    }),
    MqttModule,
    InfluxDbModule,
    EnvironmentModule,
    IrrigationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
