export interface Alert {
  id: string;
  type: 'disease_detected' | 'temperature' | 'security' | 'irrigation' | 'predictive_threshold_breach';
  severity: 'low' | 'moderate' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  metadata?: Record<string, any>;
  acknowledged?: boolean;
}

export interface DiseaseAlert extends Alert {
  type: 'disease_detected';
  metadata: {
    plantId: string;
    analysisId: string;
    diseaseName: string;
    confidence: number;
    affectedArea: string;
    recommendations: string[];
  };
}

export interface PredictiveAlert extends Alert {
  type: 'predictive_threshold_breach';
  metadata: {
    metric: string;
    predictedValue: number;
    predictedTime: Date;
    threshold: number;
    currentValue?: number;
  };
}

export enum AlertChannel {
  EMAIL = 'email',
  IN_APP = 'in_app',
  PUSH = 'push',
  WEBHOOK = 'webhook',
}

export interface AlertConfig {
  channels: AlertChannel[];
  emailRecipients?: string[];
  webhookUrl?: string;
}
