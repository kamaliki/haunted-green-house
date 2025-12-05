import { Injectable, Logger } from '@nestjs/common';
import { InfluxDbService } from '../../../common/services/influxdb/influxdb.service';
import { MqttClientService } from '../../../common/services/mqtt/mqtt-client.service';
import { GrowthMetrics, GrowthComparison } from '../interfaces/analysis.interface';

@Injectable()
export class GrowthAnalysisService {
  private readonly logger = new Logger(GrowthAnalysisService.name);
  
  // Growth rate thresholds (cm/day)
  private readonly NORMAL_GROWTH_RATE_MIN = 0.5;
  private readonly NORMAL_GROWTH_RATE_MAX = 3.0;
  private readonly STUNTED_GROWTH_THRESHOLD = 0.3;

  constructor(
    private readonly influxDbService: InfluxDbService,
    private readonly mqttClientService: MqttClientService,
  ) {}

  /**
   * Extract growth metrics from image analysis
   * In a real implementation, this would use computer vision
   * For now, we'll simulate with reasonable values
   */
  async extractGrowthMetrics(imageUrl: string): Promise<GrowthMetrics> {
    // TODO: Implement actual computer vision analysis
    // This is a placeholder that simulates growth metrics
    
    // Simulate realistic growth metrics
    const heightCm = Math.random() * 50 + 20; // 20-70 cm
    const leafCount = Math.floor(Math.random() * 20 + 5); // 5-25 leaves
    const colorHealth = Math.random() * 30 + 70; // 70-100 health score

    return {
      heightCm: Math.round(heightCm * 10) / 10,
      leafCount,
      colorHealth: Math.round(colorHealth),
    };
  }

  /**
   * Get previous growth metrics for a plant
   */
  async getPreviousGrowthMetrics(plantId: string): Promise<GrowthMetrics | null> {
    const query = `
      from(bucket: "${this.influxDbService.getBucket()}")
        |> range(start: -90d)
        |> filter(fn: (r) => r["_measurement"] == "plant_growth")
        |> filter(fn: (r) => r["plant_id"] == "${plantId}")
        |> filter(fn: (r) => r["_field"] == "height_cm" or r["_field"] == "leaf_count" or r["_field"] == "color_health")
        |> last()
    `;

    try {
      const results = await this.influxDbService.query(query);
      
      if (results.length === 0) {
        return null;
      }

      // Parse results into GrowthMetrics
      const metrics: Partial<GrowthMetrics> = {};
      
      for (const record of results) {
        if (record._field === 'height_cm') {
          metrics.heightCm = record._value;
        } else if (record._field === 'leaf_count') {
          metrics.leafCount = record._value;
        } else if (record._field === 'color_health') {
          metrics.colorHealth = record._value;
        }
      }

      if (metrics.heightCm && metrics.leafCount && metrics.colorHealth) {
        return metrics as GrowthMetrics;
      }

      return null;
    } catch (error) {
      this.logger.error(`Failed to query previous growth metrics: ${error.message}`);
      return null;
    }
  }

  /**
   * Get the timestamp of the last growth measurement
   */
  async getLastMeasurementTime(plantId: string): Promise<Date | null> {
    const query = `
      from(bucket: "${this.influxDbService.getBucket()}")
        |> range(start: -90d)
        |> filter(fn: (r) => r["_measurement"] == "plant_growth")
        |> filter(fn: (r) => r["plant_id"] == "${plantId}")
        |> last()
    `;

    try {
      const results = await this.influxDbService.query(query);
      
      if (results.length > 0 && results[0]._time) {
        return new Date(results[0]._time);
      }

      return null;
    } catch (error) {
      this.logger.error(`Failed to query last measurement time: ${error.message}`);
      return null;
    }
  }

  /**
   * Compare current growth metrics with previous measurements
   */
  async compareGrowth(
    plantId: string,
    currentMetrics: GrowthMetrics,
    currentTimestamp: Date,
  ): Promise<GrowthComparison> {
    const previousMetrics = await this.getPreviousGrowthMetrics(plantId);
    const lastMeasurementTime = await this.getLastMeasurementTime(plantId);

    const comparison: GrowthComparison = {
      currentMetrics,
      previousMetrics: previousMetrics || undefined,
    };

    if (!previousMetrics || !lastMeasurementTime) {
      // First measurement for this plant
      this.logger.log(`First growth measurement for plant ${plantId}`);
      return comparison;
    }

    // Calculate time difference in days
    const daysSinceLast = 
      (currentTimestamp.getTime() - lastMeasurementTime.getTime()) / (1000 * 60 * 60 * 24);
    
    comparison.daysSinceLast = Math.round(daysSinceLast * 10) / 10;

    // Calculate changes
    comparison.heightChange = 
      Math.round((currentMetrics.heightCm - previousMetrics.heightCm) * 10) / 10;
    comparison.leafCountChange = currentMetrics.leafCount - previousMetrics.leafCount;

    // Calculate growth rate (cm/day)
    if (daysSinceLast > 0) {
      comparison.growthRate = 
        Math.round((comparison.heightChange / daysSinceLast) * 100) / 100;
      currentMetrics.growthRate = comparison.growthRate;
    }

    // Check for abnormal growth
    const abnormality = this.detectAbnormalGrowth(comparison);
    comparison.isAbnormal = abnormality.isAbnormal;
    comparison.abnormalityReason = abnormality.reason;

    // Check for stunted growth
    if (comparison.growthRate !== undefined) {
      currentMetrics.isStunted = comparison.growthRate < this.STUNTED_GROWTH_THRESHOLD;
    }

    return comparison;
  }

  /**
   * Detect abnormal growth patterns
   */
  private detectAbnormalGrowth(comparison: GrowthComparison): {
    isAbnormal: boolean;
    reason?: string;
  } {
    if (!comparison.growthRate || !comparison.previousMetrics) {
      return { isAbnormal: false };
    }

    // Check for stunted growth
    if (comparison.growthRate < this.STUNTED_GROWTH_THRESHOLD) {
      return {
        isAbnormal: true,
        reason: `Stunted growth detected: ${comparison.growthRate} cm/day (expected > ${this.STUNTED_GROWTH_THRESHOLD})`,
      };
    }

    // Check for excessive growth (might indicate measurement error or unusual conditions)
    if (comparison.growthRate > this.NORMAL_GROWTH_RATE_MAX) {
      return {
        isAbnormal: true,
        reason: `Excessive growth rate: ${comparison.growthRate} cm/day (expected < ${this.NORMAL_GROWTH_RATE_MAX})`,
      };
    }

    // Check for negative growth (shrinking)
    if (comparison.heightChange && comparison.heightChange < -1) {
      return {
        isAbnormal: true,
        reason: `Plant height decreased by ${Math.abs(comparison.heightChange)} cm`,
      };
    }

    // Check for significant leaf loss
    if (comparison.leafCountChange && comparison.leafCountChange < -5) {
      return {
        isAbnormal: true,
        reason: `Significant leaf loss: ${Math.abs(comparison.leafCountChange)} leaves`,
      };
    }

    return { isAbnormal: false };
  }

  /**
   * Store growth metrics to InfluxDB
   */
  async storeGrowthMetrics(
    plantId: string,
    location: string,
    metrics: GrowthMetrics,
    timestamp: Date,
  ): Promise<void> {
    await this.influxDbService.writeSensorData(
      'plant_growth',
      {
        plant_id: plantId,
        location,
      },
      {
        height_cm: metrics.heightCm,
        leaf_count: metrics.leafCount,
        color_health: metrics.colorHealth,
        growth_rate: metrics.growthRate || 0,
        is_stunted: metrics.isStunted || false,
      },
      timestamp,
    );

    this.logger.log(`Stored growth metrics for plant ${plantId}`);
  }

  /**
   * Send growth anomaly alert
   */
  async sendGrowthAnomalyAlert(
    plantId: string,
    location: string,
    comparison: GrowthComparison,
  ): Promise<void> {
    if (!comparison.isAbnormal || !comparison.previousMetrics) {
      return;
    }

    const payload = {
      alertType: 'growth_anomaly',
      plantId,
      location,
      issue: comparison.abnormalityReason || 'Unknown growth anomaly',
      currentHeight: comparison.currentMetrics.heightCm,
      previousHeight: comparison.previousMetrics.heightCm,
      growthRate: comparison.growthRate || 0,
      expectedGrowthRate: this.NORMAL_GROWTH_RATE_MIN,
      daysSinceLast: comparison.daysSinceLast || 0,
      timestamp: new Date().toISOString(),
    };

    try {
      await this.mqttClientService.publish(
        'greenhouse/alerts/growth_anomaly',
        JSON.stringify(payload),
      );
      this.logger.log(`Sent growth anomaly alert for plant ${plantId}`);
    } catch (error) {
      this.logger.error(`Failed to send growth anomaly alert: ${error.message}`);
    }
  }

  /**
   * Get growth history for a plant
   */
  async getGrowthHistory(plantId: string, days: number = 30): Promise<Array<{
    timestamp: Date;
    heightCm: number;
    leafCount: number;
    colorHealth: number;
    growthRate: number;
  }>> {
    const query = `
      from(bucket: "${this.influxDbService.getBucket()}")
        |> range(start: -${days}d)
        |> filter(fn: (r) => r["_measurement"] == "plant_growth")
        |> filter(fn: (r) => r["plant_id"] == "${plantId}")
        |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
        |> sort(columns: ["_time"], desc: false)
    `;

    try {
      const results = await this.influxDbService.query(query);
      
      return results.map(record => ({
        timestamp: new Date(record._time),
        heightCm: record.height_cm || 0,
        leafCount: record.leaf_count || 0,
        colorHealth: record.color_health || 0,
        growthRate: record.growth_rate || 0,
      }));
    } catch (error) {
      this.logger.error(`Failed to query growth history: ${error.message}`);
      return [];
    }
  }

  /**
   * Calculate average growth rate over a period
   */
  async getAverageGrowthRate(plantId: string, days: number = 30): Promise<number> {
    const history = await this.getGrowthHistory(plantId, days);
    
    if (history.length < 2) {
      return 0;
    }

    const totalGrowth = history[history.length - 1].heightCm - history[0].heightCm;
    const totalDays = 
      (history[history.length - 1].timestamp.getTime() - history[0].timestamp.getTime()) 
      / (1000 * 60 * 60 * 24);

    if (totalDays === 0) {
      return 0;
    }

    return Math.round((totalGrowth / totalDays) * 100) / 100;
  }
}
