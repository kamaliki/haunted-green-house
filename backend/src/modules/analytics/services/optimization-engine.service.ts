import { Injectable, Logger } from '@nestjs/common';
import {
  OptimizationRecommendation,
  AnalysisContext,
  TimeSeriesPoint,
} from '../interfaces/analytics.interface';

@Injectable()
export class OptimizationEngine {
  private readonly logger = new Logger(OptimizationEngine.name);

  /**
   * Analyze environmental conditions and generate recommendations
   * @param context Analysis context with environmental, plant health, and growth data
   * @returns Array of optimization recommendations
   */
  analyzeEnvironmentalConditions(
    context: AnalysisContext,
  ): OptimizationRecommendation[] {
    this.logger.debug('Analyzing environmental conditions for optimization');

    const recommendations: OptimizationRecommendation[] = [];

    if (!context.environmentalData || context.environmentalData.length === 0) {
      this.logger.warn('No environmental data available for analysis');
      return recommendations;
    }

    // Analyze temperature patterns
    const temperatureData = context.environmentalData.filter(
      (point) => point.value !== undefined,
    );

    if (temperatureData.length > 0) {
      const avgTemp =
        temperatureData.reduce((sum, point) => sum + point.value, 0) /
        temperatureData.length;
      const maxTemp = Math.max(...temperatureData.map((p) => p.value));
      const minTemp = Math.min(...temperatureData.map((p) => p.value));
      const tempVariance = maxTemp - minTemp;

      // High temperature variance recommendation
      if (tempVariance > 15) {
        recommendations.push({
          id: this.generateId(),
          category: 'temperature',
          title: 'Reduce Temperature Fluctuations',
          description: `Temperature variance of ${tempVariance.toFixed(1)}°C detected. Large fluctuations can stress plants and reduce growth efficiency.`,
          expectedImpact:
            'Improved plant health and 10-15% increase in growth consistency',
          priority: 'high',
          actionItems: [
            'Install thermal mass (water barrels) to stabilize temperature',
            'Improve insulation on north-facing walls',
            'Consider automated shade cloth deployment during peak heat',
            'Review ventilation timing and adjust for smoother transitions',
          ],
          generatedAt: new Date(),
        });
      }

      // Suboptimal average temperature
      if (avgTemp < 18 || avgTemp > 28) {
        const priority = avgTemp < 15 || avgTemp > 32 ? 'high' : 'medium';
        recommendations.push({
          id: this.generateId(),
          category: 'temperature',
          title: 'Adjust Average Temperature Range',
          description: `Average temperature of ${avgTemp.toFixed(1)}°C is outside optimal range (18-28°C). This may slow plant growth and development.`,
          expectedImpact:
            'Optimized growth rate and improved nutrient uptake efficiency',
          priority,
          actionItems: [
            avgTemp < 18
              ? 'Increase heating during night hours'
              : 'Enhance cooling through ventilation or evaporative cooling',
            'Monitor energy costs and adjust gradually',
            'Consider heat-tolerant or cold-tolerant varieties if adjustments are not feasible',
          ],
          generatedAt: new Date(),
        });
      }
    }

    // Analyze humidity patterns if weather forecast is available
    if (context.weatherForecast && context.weatherForecast.length > 0) {
      const avgHumidity =
        context.weatherForecast.reduce((sum, w) => sum + w.humidity, 0) /
        context.weatherForecast.length;

      if (avgHumidity > 80) {
        recommendations.push({
          id: this.generateId(),
          category: 'humidity',
          title: 'Improve Air Circulation to Reduce Humidity',
          description: `High humidity levels (${avgHumidity.toFixed(0)}%) increase disease risk, particularly fungal infections.`,
          expectedImpact:
            'Reduced disease incidence by 20-30% and improved plant respiration',
          priority: 'high',
          actionItems: [
            'Increase ventilation fan runtime during humid periods',
            'Space plants further apart to improve airflow',
            'Consider dehumidification system for persistent high humidity',
            'Monitor for early signs of fungal diseases',
          ],
          generatedAt: new Date(),
        });
      }
    }

    // Analyze plant health data if available
    if (context.plantHealthData && context.plantHealthData.length > 0) {
      const diseaseCount = context.plantHealthData.filter(
        (data) => data.diseaseDetected === true,
      ).length;

      if (diseaseCount > context.plantHealthData.length * 0.1) {
        recommendations.push({
          id: this.generateId(),
          category: 'general',
          title: 'Address Elevated Disease Incidence',
          description: `${diseaseCount} of ${context.plantHealthData.length} plants showing disease symptoms. This indicates environmental or cultural issues.`,
          expectedImpact:
            'Reduced disease spread and improved overall crop health',
          priority: 'high',
          actionItems: [
            'Review and implement recommended treatments for detected diseases',
            'Improve sanitation practices (clean tools, remove infected material)',
            'Adjust watering schedule to avoid leaf wetness',
            'Ensure adequate spacing and airflow between plants',
          ],
          generatedAt: new Date(),
        });
      }
    }

    // Analyze growth metrics if available
    if (context.growthMetrics && context.growthMetrics.length > 0) {
      const avgGrowthRate =
        context.growthMetrics.reduce((sum, m) => sum + (m.growthRate || 0), 0) /
        context.growthMetrics.length;

      if (avgGrowthRate < 0.5) {
        recommendations.push({
          id: this.generateId(),
          category: 'general',
          title: 'Optimize Conditions for Improved Growth Rate',
          description: `Average growth rate of ${avgGrowthRate.toFixed(2)} is below expected levels. Multiple factors may be limiting growth.`,
          expectedImpact:
            'Increased growth rate by 15-25% and earlier harvest timing',
          priority: 'medium',
          actionItems: [
            'Review and adjust fertilization schedule',
            'Verify light intensity meets crop requirements',
            'Check root zone conditions (temperature, moisture, aeration)',
            'Consider supplemental CO2 if other factors are optimized',
          ],
          generatedAt: new Date(),
        });
      }
    }

    this.logger.log(
      `Generated ${recommendations.length} environmental recommendations`,
    );
    return recommendations;
  }

  /**
   * Identify irrigation optimization opportunities
   * @param soilMoistureData Historical soil moisture data
   * @param waterUsage Water usage statistics
   * @returns Array of irrigation-specific recommendations
   */
  identifyIrrigationOptimizations(
    soilMoistureData: TimeSeriesPoint[],
    waterUsage: number[],
  ): OptimizationRecommendation[] {
    this.logger.debug('Identifying irrigation optimization opportunities');

    const recommendations: OptimizationRecommendation[] = [];

    if (!soilMoistureData || soilMoistureData.length === 0) {
      this.logger.warn('No soil moisture data available for irrigation analysis');
      return recommendations;
    }

    // Calculate soil moisture statistics
    const moistureValues = soilMoistureData.map((point) => point.value);
    const avgMoisture =
      moistureValues.reduce((sum, val) => sum + val, 0) / moistureValues.length;
    const maxMoisture = Math.max(...moistureValues);
    const minMoisture = Math.min(...moistureValues);
    const moistureVariance = maxMoisture - minMoisture;

    // High moisture variance indicates inefficient irrigation scheduling
    if (moistureVariance > 30) {
      recommendations.push({
        id: this.generateId(),
        category: 'irrigation',
        title: 'Optimize Irrigation Scheduling for Consistency',
        description: `Soil moisture varies by ${moistureVariance.toFixed(1)}% between readings. More consistent moisture levels improve water use efficiency and plant health.`,
        expectedImpact:
          'Reduced water usage by 15-20% and improved nutrient availability',
        priority: 'high',
        actionItems: [
          'Implement more frequent, shorter irrigation cycles',
          'Install soil moisture sensors for automated control',
          'Adjust irrigation timing to match plant water uptake patterns',
          'Consider drip irrigation for more precise water delivery',
        ],
        generatedAt: new Date(),
      });
    }

    // Low average moisture indicates potential under-watering
    if (avgMoisture < 40) {
      recommendations.push({
        id: this.generateId(),
        category: 'irrigation',
        title: 'Increase Irrigation to Prevent Water Stress',
        description: `Average soil moisture of ${avgMoisture.toFixed(1)}% is below optimal range (40-60%). Plants may be experiencing water stress.`,
        expectedImpact:
          'Improved plant vigor and 10-15% increase in yield potential',
        priority: 'high',
        actionItems: [
          'Increase irrigation duration or frequency',
          'Check for system leaks or clogged emitters',
          'Verify soil type and adjust watering accordingly',
          'Monitor plant stress indicators (wilting, leaf curl)',
        ],
        generatedAt: new Date(),
      });
    }

    // High average moisture indicates potential over-watering
    if (avgMoisture > 70) {
      recommendations.push({
        id: this.generateId(),
        category: 'irrigation',
        title: 'Reduce Irrigation to Prevent Root Issues',
        description: `Average soil moisture of ${avgMoisture.toFixed(1)}% exceeds optimal range (40-60%). Over-watering can lead to root diseases and nutrient leaching.`,
        expectedImpact:
          'Reduced water costs by 20-30% and decreased disease risk',
        priority: 'medium',
        actionItems: [
          'Decrease irrigation duration or frequency',
          'Improve drainage if water is pooling',
          'Check for irrigation system malfunctions',
          'Monitor for signs of root rot or fungal issues',
        ],
        generatedAt: new Date(),
      });
    }

    // Analyze water usage patterns if data is available
    if (waterUsage && waterUsage.length > 0) {
      const totalUsage = waterUsage.reduce((sum, val) => sum + val, 0);
      const avgDailyUsage = totalUsage / waterUsage.length;

      // Calculate usage efficiency (moisture achieved per unit water)
      if (avgDailyUsage > 0) {
        const efficiency = avgMoisture / avgDailyUsage;

        if (efficiency < 5) {
          recommendations.push({
            id: this.generateId(),
            category: 'irrigation',
            title: 'Improve Water Use Efficiency',
            description: `Current water use efficiency is low. You may be losing water to evaporation, runoff, or system inefficiencies.`,
            expectedImpact:
              'Reduced water consumption by 25-35% with maintained plant health',
            priority: 'medium',
            actionItems: [
              'Irrigate during cooler hours (early morning or evening)',
              'Add mulch to reduce evaporation',
              'Inspect system for leaks and repair promptly',
              'Consider upgrading to more efficient irrigation technology',
            ],
            generatedAt: new Date(),
          });
        }
      }

      // Detect irregular usage patterns
      const usageVariance =
        waterUsage.length > 1
          ? Math.max(...waterUsage) - Math.min(...waterUsage)
          : 0;

      if (usageVariance > avgDailyUsage * 2) {
        recommendations.push({
          id: this.generateId(),
          category: 'irrigation',
          title: 'Standardize Irrigation Practices',
          description: `Water usage varies significantly day-to-day. Consistent irrigation practices lead to better plant performance and easier management.`,
          expectedImpact:
            'More predictable plant growth and simplified water management',
          priority: 'low',
          actionItems: [
            'Establish a regular irrigation schedule',
            'Use automation to ensure consistency',
            'Document and follow standard operating procedures',
            'Train all operators on irrigation protocols',
          ],
          generatedAt: new Date(),
        });
      }
    }

    this.logger.log(
      `Generated ${recommendations.length} irrigation recommendations`,
    );
    return recommendations;
  }

  /**
   * Assess energy efficiency and generate recommendations
   * @param lightingData Historical lighting data
   * @param temperatureData Historical temperature data
   * @returns Array of energy efficiency recommendations
   */
  assessEnergyEfficiency(
    lightingData: TimeSeriesPoint[],
    temperatureData: TimeSeriesPoint[],
  ): OptimizationRecommendation[] {
    this.logger.debug('Assessing energy efficiency');

    const recommendations: OptimizationRecommendation[] = [];

    // Analyze lighting data
    if (lightingData && lightingData.length > 0) {
      const lightValues = lightingData.map((point) => point.value);
      const avgLight =
        lightValues.reduce((sum, val) => sum + val, 0) / lightValues.length;
      const maxLight = Math.max(...lightValues);

      // Excessive lighting recommendation
      if (avgLight > 80000) {
        recommendations.push({
          id: this.generateId(),
          category: 'light',
          title: 'Reduce Lighting Intensity to Save Energy',
          description: `Average light intensity of ${avgLight.toFixed(0)} lux exceeds typical requirements for most crops (40,000-60,000 lux). Reducing intensity can save energy without impacting growth.`,
          expectedImpact:
            'Energy cost reduction of 20-30% with maintained plant productivity',
          priority: 'medium',
          actionItems: [
            'Reduce supplemental lighting duration or intensity',
            'Verify crop-specific light requirements',
            'Install dimming controls for flexible light management',
            'Consider light-efficient LED fixtures if using older technology',
          ],
          generatedAt: new Date(),
        });
      }

      // Insufficient lighting recommendation
      if (avgLight < 20000) {
        recommendations.push({
          id: this.generateId(),
          category: 'light',
          title: 'Increase Light Levels for Optimal Growth',
          description: `Average light intensity of ${avgLight.toFixed(0)} lux is below optimal range for most crops. Insufficient light limits photosynthesis and growth.`,
          expectedImpact:
            'Improved growth rate by 15-25% and better crop quality',
          priority: 'high',
          actionItems: [
            'Increase supplemental lighting duration or intensity',
            'Clean greenhouse glazing to maximize natural light transmission',
            'Consider reflective materials to improve light distribution',
            'Evaluate plant spacing to reduce shading',
          ],
          generatedAt: new Date(),
        });
      }

      // Analyze lighting patterns for optimization opportunities
      const nighttimeReadings = lightingData.filter((point) => {
        const hour = point.timestamp.getHours();
        return hour >= 22 || hour <= 5;
      });

      if (nighttimeReadings.length > 0) {
        const avgNightLight =
          nighttimeReadings.reduce((sum, point) => sum + point.value, 0) /
          nighttimeReadings.length;

        if (avgNightLight > 10000) {
          recommendations.push({
            id: this.generateId(),
            category: 'light',
            title: 'Optimize Lighting Schedule for Energy Savings',
            description: `Significant lighting detected during nighttime hours (${avgNightLight.toFixed(0)} lux average). Most plants benefit from dark periods for proper development.`,
            expectedImpact:
              'Energy savings of 15-25% and improved plant flowering/fruiting',
            priority: 'medium',
            actionItems: [
              'Implement photoperiod control (12-16 hours light, 8-12 hours dark)',
              'Use timers or automation for consistent light scheduling',
              'Verify crop-specific photoperiod requirements',
              'Consider energy rate schedules and shift lighting to off-peak hours if possible',
            ],
            generatedAt: new Date(),
          });
        }
      }
    }

    // Analyze temperature data for heating/cooling efficiency
    if (temperatureData && temperatureData.length > 0) {
      const tempValues = temperatureData.map((point) => point.value);
      const avgTemp =
        tempValues.reduce((sum, val) => sum + val, 0) / tempValues.length;
      const maxTemp = Math.max(...tempValues);
      const minTemp = Math.min(...tempValues);
      const tempRange = maxTemp - minTemp;

      // Large temperature swings indicate inefficient climate control
      if (tempRange > 20) {
        recommendations.push({
          id: this.generateId(),
          category: 'temperature',
          title: 'Improve Climate Control Efficiency',
          description: `Temperature range of ${tempRange.toFixed(1)}°C indicates inefficient heating/cooling. Large swings waste energy and stress plants.`,
          expectedImpact:
            'Energy cost reduction of 15-20% and improved plant health',
          priority: 'high',
          actionItems: [
            'Improve greenhouse insulation (seal gaps, add thermal curtains)',
            'Optimize ventilation controls for gradual temperature changes',
            'Install thermal mass to buffer temperature fluctuations',
            'Review and tune HVAC system controls',
          ],
          generatedAt: new Date(),
        });
      }

      // Analyze nighttime temperature management
      const nighttimeTemps = temperatureData.filter((point) => {
        const hour = point.timestamp.getHours();
        return hour >= 20 || hour <= 6;
      });

      if (nighttimeTemps.length > 0) {
        const avgNightTemp =
          nighttimeTemps.reduce((sum, point) => sum + point.value, 0) /
          nighttimeTemps.length;

        // Excessive nighttime heating
        if (avgNightTemp > 22) {
          recommendations.push({
            id: this.generateId(),
            category: 'temperature',
            title: 'Reduce Nighttime Temperature Setpoint',
            description: `Average nighttime temperature of ${avgNightTemp.toFixed(1)}°C is higher than necessary. Most crops tolerate and benefit from cooler nights (15-18°C).`,
            expectedImpact:
              'Heating cost reduction of 25-35% with improved plant development',
            priority: 'medium',
            actionItems: [
              'Lower nighttime temperature setpoint to 15-18°C',
              'Implement temperature setback schedule',
              'Verify crop-specific temperature requirements',
              'Monitor plant response and adjust gradually',
            ],
            generatedAt: new Date(),
          });
        }
      }

      // Combined lighting and temperature analysis
      if (lightingData && lightingData.length > 0 && avgTemp > 26) {
        const avgLight =
          lightingData.reduce((sum, point) => sum + point.value, 0) /
          lightingData.length;

        if (avgLight > 60000) {
          recommendations.push({
            id: this.generateId(),
            category: 'general',
            title: 'Balance Lighting and Cooling for Efficiency',
            description: `High light levels combined with elevated temperatures increase cooling costs. Optimizing both can improve energy efficiency.`,
            expectedImpact:
              'Overall energy cost reduction of 20-30% through integrated management',
            priority: 'medium',
            actionItems: [
              'Reduce lighting intensity during hottest part of day',
              'Improve shading or ventilation to reduce cooling load',
              'Consider evaporative cooling as energy-efficient alternative',
              'Schedule high-intensity lighting during cooler hours',
            ],
            generatedAt: new Date(),
          });
        }
      }
    }

    this.logger.log(
      `Generated ${recommendations.length} energy efficiency recommendations`,
    );
    return recommendations;
  }

  /**
   * Generate a unique ID for recommendations
   * @returns Unique identifier string
   */
  private generateId(): string {
    return `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
