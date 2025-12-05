import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { PredictionEngine } from './services/prediction-engine.service';
import { OptimizationEngine } from './services/optimization-engine.service';
import { WeatherIntegrationService } from './services/weather-integration.service';
import { CacheService } from './services/cache.service';
import { InfluxDbModule } from '../../common/services/influxdb/influxdb.module';
import { AlertModule } from '../alerts/alert.module';
import { CircuitBreakerModule } from '../../common/services/circuit-breaker/circuit-breaker.module';

@Module({
  imports: [
    ConfigModule,
    ScheduleModule.forRoot(),
    InfluxDbModule,
    AlertModule,
    CircuitBreakerModule,
  ],
  controllers: [AnalyticsController],
  providers: [
    AnalyticsService,
    PredictionEngine,
    OptimizationEngine,
    WeatherIntegrationService,
    CacheService,
  ],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
