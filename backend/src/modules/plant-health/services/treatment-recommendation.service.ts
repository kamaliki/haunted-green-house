import { Injectable, Logger } from '@nestjs/common';
import { Disease, Recommendation } from '../interfaces/analysis.interface';

export interface DetailedRecommendation extends Recommendation {
  treatmentMethod?: string;
  products?: string[];
  preventiveMeasures?: string[];
  guideUrl?: string;
  environmentalFactors?: string[];
}

export interface TreatmentPlan {
  disease: string;
  severity: string;
  immediateActions: DetailedRecommendation[];
  shortTermActions: DetailedRecommendation[];
  longTermActions: DetailedRecommendation[];
  preventiveMeasures: string[];
  estimatedRecoveryTime?: string;
}

@Injectable()
export class TreatmentRecommendationService {
  private readonly logger = new Logger(TreatmentRecommendationService.name);

  // Disease treatment knowledge base
  private readonly treatmentDatabase: Record<string, TreatmentPlan> = {
    'Early Blight': {
      disease: 'Early Blight',
      severity: 'moderate',
      immediateActions: [
        {
          action: 'Remove and destroy affected leaves',
          priority: 'high',
          timing: 'immediately',
          treatmentMethod: 'Physical removal',
          products: [],
          preventiveMeasures: [],
          guideUrl: 'https://extension.umn.edu/diseases/early-blight',
        },
        {
          action: 'Isolate affected plants if possible',
          priority: 'high',
          timing: 'immediately',
          treatmentMethod: 'Quarantine',
          products: [],
          preventiveMeasures: [],
        },
      ],
      shortTermActions: [
        {
          action: 'Apply copper-based fungicide',
          priority: 'high',
          timing: 'within 24 hours',
          treatmentMethod: 'Chemical treatment',
          products: ['Copper sulfate', 'Bordeaux mixture', 'Copper hydroxide'],
          guideUrl: 'https://extension.umn.edu/diseases/early-blight',
        },
        {
          action: 'Improve air circulation around plants',
          priority: 'medium',
          timing: 'within 48 hours',
          treatmentMethod: 'Environmental modification',
          products: ['Fans', 'Pruning shears'],
        },
      ],
      longTermActions: [
        {
          action: 'Implement crop rotation schedule',
          priority: 'medium',
          timing: 'next growing season',
          treatmentMethod: 'Cultural practice',
          preventiveMeasures: ['Rotate crops every 2-3 years', 'Avoid planting in same location'],
        },
        {
          action: 'Apply preventive fungicide spray schedule',
          priority: 'medium',
          timing: 'ongoing',
          treatmentMethod: 'Preventive treatment',
          products: ['Chlorothalonil', 'Mancozeb'],
        },
      ],
      preventiveMeasures: [
        'Water at soil level to keep foliage dry',
        'Space plants adequately for air circulation',
        'Remove plant debris regularly',
        'Use disease-resistant varieties',
        'Mulch to prevent soil splash',
      ],
      estimatedRecoveryTime: '2-3 weeks with proper treatment',
    },
    'Late Blight': {
      disease: 'Late Blight',
      severity: 'critical',
      immediateActions: [
        {
          action: 'Remove and destroy all affected plant parts immediately',
          priority: 'critical',
          timing: 'immediately',
          treatmentMethod: 'Physical removal',
          products: [],
          guideUrl: 'https://extension.umn.edu/diseases/late-blight',
        },
        {
          action: 'Apply systemic fungicide',
          priority: 'critical',
          timing: 'within 6 hours',
          treatmentMethod: 'Chemical treatment',
          products: ['Metalaxyl', 'Dimethomorph', 'Cyazofamid'],
        },
      ],
      shortTermActions: [
        {
          action: 'Reduce humidity levels below 80%',
          priority: 'high',
          timing: 'within 24 hours',
          treatmentMethod: 'Environmental control',
          products: ['Dehumidifier', 'Ventilation fans'],
        },
        {
          action: 'Monitor neighboring plants daily',
          priority: 'high',
          timing: 'daily for 2 weeks',
          treatmentMethod: 'Monitoring',
        },
      ],
      longTermActions: [
        {
          action: 'Sanitize all tools and equipment',
          priority: 'high',
          timing: 'after each use',
          treatmentMethod: 'Sanitation',
          products: ['Bleach solution (10%)', 'Alcohol wipes'],
        },
      ],
      preventiveMeasures: [
        'Maintain humidity below 80%',
        'Ensure excellent air circulation',
        'Avoid overhead watering',
        'Use resistant varieties',
        'Remove volunteer plants',
      ],
      estimatedRecoveryTime: '3-4 weeks if caught early, may require plant removal',
    },
    'Powdery Mildew': {
      disease: 'Powdery Mildew',
      severity: 'moderate',
      immediateActions: [
        {
          action: 'Remove heavily infected leaves',
          priority: 'medium',
          timing: 'within 24 hours',
          treatmentMethod: 'Physical removal',
        },
      ],
      shortTermActions: [
        {
          action: 'Apply sulfur-based fungicide or neem oil',
          priority: 'medium',
          timing: 'within 48 hours',
          treatmentMethod: 'Organic treatment',
          products: ['Sulfur dust', 'Neem oil', 'Potassium bicarbonate'],
          guideUrl: 'https://extension.umn.edu/diseases/powdery-mildew',
        },
        {
          action: 'Reduce humidity and improve air flow',
          priority: 'high',
          timing: 'immediately',
          treatmentMethod: 'Environmental control',
        },
      ],
      longTermActions: [
        {
          action: 'Apply weekly preventive treatments',
          priority: 'low',
          timing: 'weekly',
          treatmentMethod: 'Preventive treatment',
          products: ['Baking soda solution', 'Milk spray (1:9 ratio)'],
        },
      ],
      preventiveMeasures: [
        'Maintain good air circulation',
        'Avoid overhead watering',
        'Prune for better light penetration',
        'Keep humidity below 70%',
      ],
      estimatedRecoveryTime: '1-2 weeks',
    },
    'Septoria Leaf Spot': {
      disease: 'Septoria Leaf Spot',
      severity: 'moderate',
      immediateActions: [
        {
          action: 'Remove infected lower leaves',
          priority: 'high',
          timing: 'immediately',
          treatmentMethod: 'Physical removal',
        },
      ],
      shortTermActions: [
        {
          action: 'Apply copper or chlorothalonil fungicide',
          priority: 'high',
          timing: 'within 24 hours',
          treatmentMethod: 'Chemical treatment',
          products: ['Copper fungicide', 'Chlorothalonil', 'Mancozeb'],
        },
        {
          action: 'Mulch around plants to prevent soil splash',
          priority: 'medium',
          timing: 'within 48 hours',
          treatmentMethod: 'Cultural practice',
          products: ['Organic mulch', 'Straw'],
        },
      ],
      longTermActions: [
        {
          action: 'Maintain regular fungicide spray schedule',
          priority: 'medium',
          timing: 'every 7-10 days',
          treatmentMethod: 'Preventive treatment',
        },
      ],
      preventiveMeasures: [
        'Water at soil level only',
        'Space plants for air circulation',
        'Remove plant debris',
        'Stake plants to keep foliage off ground',
      ],
      estimatedRecoveryTime: '2-3 weeks',
    },
    'Nutrient Deficiency': {
      disease: 'Nutrient Deficiency',
      severity: 'low',
      immediateActions: [],
      shortTermActions: [
        {
          action: 'Test soil pH and nutrient levels',
          priority: 'high',
          timing: 'within 48 hours',
          treatmentMethod: 'Diagnosis',
          products: ['Soil test kit'],
        },
        {
          action: 'Apply balanced fertilizer',
          priority: 'medium',
          timing: 'after soil test',
          treatmentMethod: 'Fertilization',
          products: ['NPK fertilizer (10-10-10)', 'Compost', 'Liquid fertilizer'],
        },
      ],
      longTermActions: [
        {
          action: 'Establish regular fertilization schedule',
          priority: 'medium',
          timing: 'ongoing',
          treatmentMethod: 'Maintenance',
        },
      ],
      preventiveMeasures: [
        'Regular soil testing',
        'Maintain proper pH (6.0-6.8)',
        'Use quality potting mix',
        'Follow fertilization schedule',
      ],
      estimatedRecoveryTime: '1-2 weeks after correction',
    },
  };

  /**
   * Generate comprehensive treatment recommendations for a detected disease
   */
  generateRecommendations(
    disease: Disease,
    environmentalContext?: {
      temperature?: number;
      humidity?: number;
      note?: string;
    },
  ): DetailedRecommendation[] {
    const treatmentPlan = this.treatmentDatabase[disease.name];
    
    if (!treatmentPlan) {
      // Return generic recommendations for unknown diseases
      return this.getGenericRecommendations(disease);
    }

    const recommendations: DetailedRecommendation[] = [];

    // Add immediate actions
    recommendations.push(...treatmentPlan.immediateActions);

    // Add short-term actions
    recommendations.push(...treatmentPlan.shortTermActions);

    // Add environmental recommendations based on context
    if (environmentalContext) {
      const envRecommendations = this.getEnvironmentalRecommendations(
        disease,
        environmentalContext,
      );
      recommendations.push(...envRecommendations);
    }

    // Add long-term actions for moderate to critical severity
    if (disease.severity !== 'low') {
      recommendations.push(...treatmentPlan.longTermActions);
    }

    // Sort by priority
    return this.sortByPriority(recommendations);
  }

  /**
   * Get a complete treatment plan for a disease
   */
  getTreatmentPlan(diseaseName: string): TreatmentPlan | null {
    return this.treatmentDatabase[diseaseName] || null;
  }

  /**
   * Generate environmental-specific recommendations
   */
  private getEnvironmentalRecommendations(
    disease: Disease,
    context: { temperature?: number; humidity?: number; note?: string },
  ): DetailedRecommendation[] {
    const recommendations: DetailedRecommendation[] = [];

    // High humidity recommendations
    if (context.humidity && context.humidity > 80) {
      recommendations.push({
        action: 'Reduce greenhouse humidity to below 70%',
        priority: 'high',
        timing: 'within 24 hours',
        treatmentMethod: 'Environmental control',
        products: ['Dehumidifier', 'Ventilation fans'],
        environmentalFactors: [`Current humidity: ${context.humidity}%`],
      });
    }

    // Temperature-related recommendations
    if (context.temperature) {
      if (context.temperature > 30) {
        recommendations.push({
          action: 'Lower temperature to optimal range (20-25°C)',
          priority: 'medium',
          timing: 'within 48 hours',
          treatmentMethod: 'Environmental control',
          products: ['Shade cloth', 'Cooling system'],
          environmentalFactors: [`Current temperature: ${context.temperature}°C`],
        });
      } else if (context.temperature < 15) {
        recommendations.push({
          action: 'Increase temperature to optimal range (20-25°C)',
          priority: 'medium',
          timing: 'within 48 hours',
          treatmentMethod: 'Environmental control',
          products: ['Heating system'],
          environmentalFactors: [`Current temperature: ${context.temperature}°C`],
        });
      }
    }

    return recommendations;
  }

  /**
   * Get generic recommendations for unknown diseases
   */
  private getGenericRecommendations(disease: Disease): DetailedRecommendation[] {
    return [
      {
        action: 'Isolate affected plant to prevent spread',
        priority: 'high',
        timing: 'immediately',
        treatmentMethod: 'Quarantine',
      },
      {
        action: 'Document symptoms with photos',
        priority: 'medium',
        timing: 'within 24 hours',
        treatmentMethod: 'Monitoring',
      },
      {
        action: 'Consult with plant pathologist or extension service',
        priority: 'high',
        timing: 'within 48 hours',
        treatmentMethod: 'Professional consultation',
        guideUrl: 'https://extension.umn.edu/plant-diseases',
      },
      {
        action: 'Remove severely affected plant parts',
        priority: 'medium',
        timing: 'within 24 hours',
        treatmentMethod: 'Physical removal',
      },
    ];
  }

  /**
   * Sort recommendations by priority
   */
  private sortByPriority(recommendations: DetailedRecommendation[]): DetailedRecommendation[] {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return recommendations.sort(
      (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority],
    );
  }

  /**
   * Get preventive measures for a disease
   */
  getPreventiveMeasures(diseaseName: string): string[] {
    const treatmentPlan = this.treatmentDatabase[diseaseName];
    return treatmentPlan?.preventiveMeasures || [];
  }

  /**
   * Get estimated recovery time
   */
  getEstimatedRecoveryTime(diseaseName: string): string | undefined {
    const treatmentPlan = this.treatmentDatabase[diseaseName];
    return treatmentPlan?.estimatedRecoveryTime;
  }
}
