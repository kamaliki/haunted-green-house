export interface Alert {
  id: string;
  type: 'environmental' | 'security' | 'predictive' | 'system';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  metadata?: Record<string, any>;
  acknowledged: boolean;
  zoneId?: string;
  zoneName?: string;
}

export interface DiseaseAlert extends Alert {
  type: 'environmental';
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
  type: 'predictive';
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
