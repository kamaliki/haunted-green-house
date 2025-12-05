import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MqttModule } from './common/services/mqtt/mqtt.module';
import { InfluxDbModule } from './common/services/influxdb/influxdb.module';
import { AlertModule } from './common/services/alerts/alert.module';
import { CircuitBreakerModule } from './common/services/circuit-breaker/circuit-breaker.module';
import { EnvironmentModule } from './modules/environment/environment.module';
import { IrrigationModule } from './modules/irrigation/irrigation.module';
import { PlantHealthModule } from './modules/plant-health/plant-health.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { SecurityModule } from './modules/security/security.module';
import { AuthModule } from './modules/auth/auth.module';
import { GreenhouseModule } from './modules/greenhouse/greenhouse.module';
import { getDatabaseConfig } from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
        getDatabaseConfig(configService),
      inject: [ConfigService],
    }),
    MqttModule,
    InfluxDbModule,
    AlertModule,
    CircuitBreakerModule,
    EnvironmentModule,
    IrrigationModule,
    PlantHealthModule,
    AnalyticsModule,
    SecurityModule,
    AuthModule,
    GreenhouseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
