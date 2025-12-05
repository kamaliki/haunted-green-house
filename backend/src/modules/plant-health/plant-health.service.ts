import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { InfluxDbService } from '../../common/services/influxdb/influxdb.service';
import { ImageProcessingService } from './services/image-processing.service';
import { AlertService } from '../alerts/alert.service';
import { GrowthAnalysisService } from './services/growth-analysis.service';
import { TreatmentRecommendationService } from './services/treatment-recommendation.service';
import { AnalysisResult, UploadMetadata } from './interfaces/analysis.interface';

@Injectable()
export class PlantHealthService {
  private readonly logger = new Logger(PlantHealthService.name);
  private readonly analyses = new Map<string, AnalysisResult>();

  constructor(
    private readonly influxDbService: InfluxDbService,
    private readonly imageProcessingService: ImageProcessingService,
    private readonly alertService: AlertService,
    private readonly growthAnalysisService: GrowthAnalysisService,
    private readonly treatmentRecommendationService: TreatmentRecommendationService,
  ) {}

  async uploadImage(
    file: Express.Multer.File,
    metadata: UploadMetadata,
  ): Promise<{ analysisId: string; message: string; estimatedCompletionTime: Date }> {
    // Validate file
    const validation = this.imageProcessingService.validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Generate analysis ID
    const analysisId = uuidv4();
    const timestamp = metadata.timestamp || new Date();

    // Save image
    const imageUrl = await this.imageProcessingService.saveImage(
      file,
      metadata.plantId,
      timestamp,
    );

    // Create analysis record
    const analysis: AnalysisResult = {
      analysisId,
      plantId: metadata.plantId,
      timestamp,
      status: 'pending',
      imageUrl,
    };

    this.analyses.set(analysisId, analysis);

    // Store metadata to InfluxDB
    await this.storeAnalysisMetadata(analysis, metadata);

    this.logger.log(
      `Image uploaded for plant ${metadata.plantId}, analysis ID: ${analysisId}`,
    );

    // Estimate completion time (for now, just add 10 seconds)
    const estimatedCompletionTime = new Date(timestamp.getTime() + 10000);

    // Start async processing (placeholder for now)
    this.processImageAsync(analysisId).catch((error) => {
      this.logger.error(`Failed to process image ${analysisId}: ${error.message}`);
    });

    return {
      analysisId,
      message: 'Image uploaded successfully, analysis in progress',
      estimatedCompletionTime,
    };
  }

  async getAnalysis(analysisId: string): Promise<AnalysisResult> {
    const analysis = this.analyses.get(analysisId);
    if (!analysis) {
      throw new NotFoundException(`Analysis ${analysisId} not found`);
    }
    return analysis;
  }

  async getPlantHistory(plantId: string): Promise<{
    plantId: string;
    analyses: Array<{
      timestamp: Date;
      healthScore: number;
      diseaseDetected: boolean;
      diseases: string[];
      imageUrl: string;
    }>;
    growthMetrics?: {
      currentHeight: number;
      growthRate: number;
      averageHealthScore: number;
    };
  }> {
    const plantAnalyses = Array.from(this.analyses.values())
      .filter((a) => a.plantId === plantId && a.status === 'completed')
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .map((a) => ({
        timestamp: a.timestamp,
        healthScore: a.results?.healthScore || 0,
        diseaseDetected: a.results?.diseaseDetected || false,
        diseases: a.results?.diseases.map((d) => d.name) || [],
        imageUrl: a.imageUrl,
      }));

    // Get growth metrics
    const growthHistory = await this.growthAnalysisService.getGrowthHistory(plantId, 30);
    const averageGrowthRate = await this.growthAnalysisService.getAverageGrowthRate(plantId, 30);
    
    const growthMetrics = growthHistory.length > 0 ? {
      currentHeight: growthHistory[growthHistory.length - 1].heightCm,
      growthRate: averageGrowthRate,
      averageHealthScore: plantAnalyses.length > 0
        ? plantAnalyses.reduce((sum, a) => sum + a.healthScore, 0) / plantAnalyses.length
        : 0,
    } : undefined;

    return {
      plantId,
      analyses: plantAnalyses,
      growthMetrics,
    };
  }

  async getDashboard(): Promise<{
    summary: {
      totalPlants: number;
      healthyPlants: number;
      plantsWithIssues: number;
      criticalIssues: number;
      averageHealthScore: number;
    };
    recentAlerts: Array<{
      plantId: string;
      disease: string;
      severity: string;
      timestamp: Date;
    }>;
  }> {
    const completedAnalyses = Array.from(this.analyses.values()).filter(
      (a) => a.status === 'completed',
    );

    const plantIds = new Set(completedAnalyses.map((a) => a.plantId));
    const totalPlants = plantIds.size;

    const plantsWithIssues = new Set(
      completedAnalyses
        .filter((a) => a.results?.diseaseDetected)
        .map((a) => a.plantId),
    ).size;

    const healthyPlants = totalPlants - plantsWithIssues;

    const criticalIssues = completedAnalyses.filter(
      (a) =>
        a.results?.diseases.some((d) => d.severity === 'critical' || d.severity === 'high'),
    ).length;

    const totalHealthScore = completedAnalyses.reduce(
      (sum, a) => sum + (a.results?.healthScore || 0),
      0,
    );
    const averageHealthScore =
      completedAnalyses.length > 0 ? totalHealthScore / completedAnalyses.length : 0;

    const recentAlerts = completedAnalyses
      .filter((a) => a.results?.diseaseDetected)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10)
      .map((a) => ({
        plantId: a.plantId,
        disease: a.results?.diseases[0]?.name || 'Unknown',
        severity: a.results?.diseases[0]?.severity || 'unknown',
        timestamp: a.timestamp,
      }));

    return {
      summary: {
        totalPlants,
        healthyPlants,
        plantsWithIssues,
        criticalIssues,
        averageHealthScore: Math.round(averageHealthScore * 10) / 10,
      },
      recentAlerts,
    };
  }

  private async processImageAsync(analysisId: string): Promise<void> {
    const analysis = this.analyses.get(analysisId);
    if (!analysis) {
      return;
    }

    // Update status to processing
    analysis.status = 'processing';
    this.analyses.set(analysisId, analysis);

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Extract growth metrics from image
    const growthMetrics = await this.growthAnalysisService.extractGrowthMetrics(
      analysis.imageUrl,
    );

    // Compare with previous measurements
    const growthComparison = await this.growthAnalysisService.compareGrowth(
      analysis.plantId,
      growthMetrics,
      analysis.timestamp,
    );

    // Get environmental context for better recommendations
    const environmentalContext = await this.getEnvironmentalContext(analysis.plantId);

    // For now, return a mock result (Phase 2 will implement actual AI detection)
    analysis.status = 'completed';
    analysis.results = {
      diseaseDetected: false,
      diseases: [],
      healthScore: 95,
      recommendations: [
        {
          action: 'Continue regular monitoring',
          priority: 'low',
          timing: 'ongoing',
        },
      ],
      growthMetrics,
      growthComparison,
    };

    // Add environmental context to results
    if (environmentalContext) {
      analysis.environmentalContext = environmentalContext;
    }

    // Add growth-related recommendations if needed
    if (growthComparison.isAbnormal) {
      analysis.results.recommendations.unshift({
        action: `Address growth issue: ${growthComparison.abnormalityReason}`,
        priority: 'high',
        timing: 'immediate',
      });
    }

    this.analyses.set(analysisId, analysis);

    // Store results to InfluxDB
    await this.storeAnalysisResults(analysis);

    // Store growth metrics
    const metadata = await this.getAnalysisMetadata(analysisId);
    if (metadata) {
      await this.growthAnalysisService.storeGrowthMetrics(
        analysis.plantId,
        metadata.location,
        growthMetrics,
        analysis.timestamp,
      );
    }

    // Send alerts if diseases are detected
    if (analysis.results.diseaseDetected && analysis.results.diseases.length > 0) {
      await this.sendDiseaseAlerts(analysis);
    }

    // Send growth anomaly alerts
    if (growthComparison.isAbnormal && metadata) {
      await this.growthAnalysisService.sendGrowthAnomalyAlert(
        analysis.plantId,
        metadata.location,
        growthComparison,
      );
    }

    this.logger.log(`Analysis ${analysisId} completed`);
  }

  private async getAnalysisMetadata(analysisId: string): Promise<{ location: string } | null> {
    // Query InfluxDB for analysis metadata
    const query = `
      from(bucket: "${this.influxDbService.getBucket()}")
        |> range(start: -7d)
        |> filter(fn: (r) => r["_measurement"] == "plant_analysis_metadata")
        |> filter(fn: (r) => r["analysis_id"] == "${analysisId}")
        |> last()
    `;

    try {
      const results = await this.influxDbService.query(query);
      
      if (results.length > 0 && results[0].location) {
        return { location: results[0].location };
      }

      return null;
    } catch (error) {
      this.logger.error(`Failed to query analysis metadata: ${error.message}`);
      return null;
    }
  }

  private async storeAnalysisMetadata(
    analysis: AnalysisResult,
    metadata: UploadMetadata,
  ): Promise<void> {
    await this.influxDbService.writeSensorData(
      'plant_analysis_metadata',
      {
        plant_id: analysis.plantId,
        location: metadata.location,
        analysis_id: analysis.analysisId,
      },
      {
        image_url: analysis.imageUrl,
        notes: metadata.notes || '',
      },
      analysis.timestamp,
    );
  }

  private async storeAnalysisResults(analysis: AnalysisResult): Promise<void> {
    if (!analysis.results) {
      return;
    }

    const fields: Record<string, number | string | boolean> = {
      health_score: analysis.results.healthScore,
      status: analysis.status,
    };

    if (analysis.results.diseases.length > 0) {
      const disease = analysis.results.diseases[0];
      fields.disease_name = disease.name;
      fields.severity = disease.severity;
      fields.confidence = disease.confidence;
    }

    await this.influxDbService.writeSensorData(
      'plant_analyses',
      {
        plant_id: analysis.plantId,
        disease_detected: analysis.results.diseaseDetected.toString(),
      },
      fields,
      analysis.timestamp,
    );
  }

  private async sendDiseaseAlerts(analysis: AnalysisResult): Promise<void> {
    if (!analysis.results || !analysis.results.diseaseDetected) {
      return;
    }

    // Send an alert for each detected disease
    for (const disease of analysis.results.diseases) {
      try {
        await this.alertService.sendDiseaseAlert(
          analysis.plantId,
          analysis.analysisId,
          disease,
          analysis.results.recommendations,
        );
      } catch (error) {
        this.logger.error(
          `Failed to send disease alert for analysis ${analysis.analysisId}: ${error.message}`,
        );
      }
    }
  }

  async getGrowthData(plantId: string, days: number = 30): Promise<{
    plantId: string;
    period: string;
    dataPoints: Array<{
      timestamp: Date;
      heightCm: number;
      leafCount: number;
      colorHealth: number;
      growthRate: number;
    }>;
    summary: {
      currentHeight: number;
      totalGrowth: number;
      averageGrowthRate: number;
      averageHealthScore: number;
    };
  }> {
    const growthHistory = await this.growthAnalysisService.getGrowthHistory(plantId, days);
    const averageGrowthRate = await this.growthAnalysisService.getAverageGrowthRate(plantId, days);

    if (growthHistory.length === 0) {
      return {
        plantId,
        period: `${days} days`,
        dataPoints: [],
        summary: {
          currentHeight: 0,
          totalGrowth: 0,
          averageGrowthRate: 0,
          averageHealthScore: 0,
        },
      };
    }

    const firstHeight = growthHistory[0].heightCm;
    const currentHeight = growthHistory[growthHistory.length - 1].heightCm;
    const totalGrowth = currentHeight - firstHeight;
    
    const averageHealthScore = 
      growthHistory.reduce((sum, point) => sum + point.colorHealth, 0) / growthHistory.length;

    return {
      plantId,
      period: `${days} days`,
      dataPoints: growthHistory,
      summary: {
        currentHeight: Math.round(currentHeight * 10) / 10,
        totalGrowth: Math.round(totalGrowth * 10) / 10,
        averageGrowthRate,
        averageHealthScore: Math.round(averageHealthScore),
      },
    };
  }

  /**
   * Get current environmental conditions for a plant's location
   */
  private async getEnvironmentalContext(plantId: string): Promise<{
    temperature?: number;
    humidity?: number;
    note?: string;
  } | null> {
    try {
      // Query recent environmental data from InfluxDB
      const query = `
        from(bucket: "${this.influxDbService.getBucket()}")
          |> range(start: -1h)
          |> filter(fn: (r) => r["_measurement"] == "environment_data")
          |> filter(fn: (r) => r["_field"] == "temperature_air" or r["_field"] == "humidity_air")
          |> last()
      `;

      const results = await this.influxDbService.query(query);
      
      if (results.length === 0) {
        return null;
      }

      const context: { temperature?: number; humidity?: number; note?: string } = {};
      
      for (const record of results) {
        if (record._field === 'temperature_air') {
          context.temperature = record._value;
        } else if (record._field === 'humidity_air') {
          context.humidity = record._value;
        }
      }

      // Add contextual notes based on conditions
      const notes: string[] = [];
      if (context.humidity && context.humidity > 80) {
        notes.push('High humidity may contribute to fungal growth');
      }
      if (context.temperature && context.temperature > 30) {
        notes.push('High temperature may stress plants');
      }
      if (context.temperature && context.temperature < 15) {
        notes.push('Low temperature may slow growth');
      }

      if (notes.length > 0) {
        context.note = notes.join('. ');
      }

      return context;
    } catch (error) {
      this.logger.error(`Failed to get environmental context: ${error.message}`);
      return null;
    }
  }

  /**
   * Simulate disease detection with proper treatment recommendations
   * This is a mock implementation - Phase 2 will integrate actual AI model
   */
  async simulateDiseaseDetection(
    analysisId: string,
    diseaseName: string,
  ): Promise<AnalysisResult> {
    const analysis = this.analyses.get(analysisId);
    if (!analysis) {
      throw new NotFoundException(`Analysis ${analysisId} not found`);
    }

    // Get environmental context
    const environmentalContext = await this.getEnvironmentalContext(analysis.plantId);

    // Create mock disease
    const disease = {
      name: diseaseName,
      confidence: 0.92,
      severity: 'moderate' as const,
      affectedArea: 'lower leaves',
      description: this.getDiseaseDescription(diseaseName),
    };

    // Generate comprehensive treatment recommendations
    const recommendations = this.treatmentRecommendationService.generateRecommendations(
      disease,
      environmentalContext || undefined,
    );

    // Update analysis with disease detection
    analysis.status = 'completed';
    analysis.results = {
      diseaseDetected: true,
      diseases: [disease],
      healthScore: 65,
      recommendations,
      growthMetrics: analysis.results?.growthMetrics,
      growthComparison: analysis.results?.growthComparison,
    };

    if (environmentalContext) {
      analysis.environmentalContext = environmentalContext;
    }

    this.analyses.set(analysisId, analysis);

    // Store updated results
    await this.storeAnalysisResults(analysis);

    // Send disease alerts
    await this.sendDiseaseAlerts(analysis);

    this.logger.log(`Disease detection simulated for analysis ${analysisId}: ${diseaseName}`);

    return analysis;
  }

  /**
   * Get disease description
   */
  private getDiseaseDescription(diseaseName: string): string {
    const descriptions: Record<string, string> = {
      'Early Blight': 'Fungal disease causing dark spots with concentric rings on leaves',
      'Late Blight': 'Severe fungal disease causing water-soaked lesions and rapid plant death',
      'Powdery Mildew': 'Fungal disease causing white powdery coating on leaves',
      'Septoria Leaf Spot': 'Fungal disease causing small circular spots with gray centers',
      'Nutrient Deficiency': 'Lack of essential nutrients affecting plant health and growth',
    };
    return descriptions[diseaseName] || 'Plant health issue detected';
  }
}
