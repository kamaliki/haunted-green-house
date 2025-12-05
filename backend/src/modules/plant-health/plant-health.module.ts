import { Module } from '@nestjs/common';
import { PlantHealthController } from './plant-health.controller';
import { PlantHealthService } from './plant-health.service';
import { ImageProcessingService } from './services/image-processing.service';
import { GrowthAnalysisService } from './services/growth-analysis.service';
import { TreatmentRecommendationService } from './services/treatment-recommendation.service';
import { InfluxDbModule } from '../../common/services/influxdb/influxdb.module';
import { MqttModule } from '../../common/services/mqtt/mqtt.module';
import { AlertModule } from '../alerts/alert.module';

@Module({
  imports: [InfluxDbModule, MqttModule, AlertModule],
  controllers: [PlantHealthController],
  providers: [
    PlantHealthService,
    ImageProcessingService,
    GrowthAnalysisService,
    TreatmentRecommendationService,
  ],
  exports: [PlantHealthService],
})
export class PlantHealthModule {}
