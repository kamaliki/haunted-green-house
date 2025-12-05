import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  Alert,
  DiseaseAlert,
  PredictiveAlert,
  AlertChannel,
  AlertConfig,
} from './alert.interface';

@Injectable()
export class AlertService {
  private readonly logger = new Logger(AlertService.name);
  private readonly alerts = new Map<string, Alert>();
  private readonly config: AlertConfig = {
    channels: [AlertChannel.IN_APP],
    emailRecipients: [],
  };

  async sendDiseaseAlert(
    plantId: string,
    analysisId: string,
    disease: {
      name: string;
      confidence: number;
      severity: 'low' | 'moderate' | 'high' | 'critical';
      affectedArea: string;
      description: string;
    },
    recommendations: Array<{ action: string; priority: string; timing: string }>,
  ): Promise<DiseaseAlert> {
    const alert: DiseaseAlert = {
      id: uuidv4(),
      type: 'disease_detected',
      severity: disease.severity,
      title: `Disease Detected: ${disease.name}`,
      message: `Plant ${plantId} has been diagnosed with ${disease.name} (${Math.round(disease.confidence * 100)}% confidence). ${disease.description}`,
      timestamp: new Date(),
      acknowledged: false,
      metadata: {
        plantId,
        analysisId,
        diseaseName: disease.name,
        confidence: disease.confidence,
        affectedArea: disease.affectedArea,
        recommendations: recommendations.map((r) => r.action),
      },
    };

    this.alerts.set(alert.id, alert);

    // Send through configured channels
    await this.sendThroughChannels(alert);

    this.logger.log(
      `Disease alert sent for plant ${plantId}: ${disease.name} (severity: ${disease.severity})`,
    );

    return alert;
  }

  async createEnvironmentAlert(
    alertType: string,
    sensorType: string,
    deviceId: string,
    value: number,
    threshold: number,
    severity: 'low' | 'moderate' | 'high' | 'critical',
    message: string,
    targetModule?: string,
  ): Promise<Alert> {
    const alert: Alert = {
      id: uuidv4(),
      type: this.mapAlertType(alertType),
      severity,
      title: this.formatAlertTitle(alertType),
      message,
      timestamp: new Date(),
      acknowledged: false,
      metadata: {
        alertType,
        sensorType,
        deviceId,
        value,
        threshold,
        targetModule,
      },
    };

    this.alerts.set(alert.id, alert);

    // Send through configured channels
    await this.sendThroughChannels(alert);

    this.logger.log(
      `Environment alert created: ${alertType} for device ${deviceId} (severity: ${severity})`,
    );

    return alert;
  }

  async sendSecurityAlert(
    alertType: 'motion' | 'access_point',
    location: string,
    details: string,
    metadata?: Record<string, any>,
  ): Promise<Alert> {
    const alert: Alert = {
      id: uuidv4(),
      type: 'security',
      severity: 'high',
      title: `Security Alert: ${alertType === 'motion' ? 'Motion Detected' : 'Access Point Change'}`,
      message: details,
      timestamp: new Date(),
      acknowledged: false,
      metadata: {
        alertType,
        location,
        ...metadata,
      },
    };

    this.alerts.set(alert.id, alert);

    // Send through configured channels
    await this.sendThroughChannels(alert);

    this.logger.log(
      `Security alert sent: ${alertType} at ${location}`,
    );

    return alert;
  }

  private mapAlertType(alertType: string): Alert['type'] {
    if (alertType.includes('temperature')) return 'temperature';
    if (alertType.includes('moisture') || alertType.includes('irrigation')) return 'irrigation';
    return 'temperature'; // default
  }

  private formatAlertTitle(alertType: string): string {
    return alertType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  async sendPredictiveAlert(
    metric: string,
    predictedValue: number,
    predictedTime: Date,
    threshold: number,
    currentValue?: number,
  ): Promise<PredictiveAlert> {
    // Determine severity based on how much the predicted value exceeds the threshold
    const exceedancePercent = Math.abs((predictedValue - threshold) / threshold) * 100;
    let severity: 'low' | 'moderate' | 'high' | 'critical';
    
    if (exceedancePercent > 50) {
      severity = 'critical';
    } else if (exceedancePercent > 25) {
      severity = 'high';
    } else if (exceedancePercent > 10) {
      severity = 'moderate';
    } else {
      severity = 'low';
    }

    const alert: PredictiveAlert = {
      id: uuidv4(),
      type: 'predictive_threshold_breach',
      severity,
      title: `Predicted Threshold Breach: ${metric}`,
      message: `The system predicts that ${metric} will reach ${predictedValue.toFixed(2)} at ${predictedTime.toISOString()}, exceeding the threshold of ${threshold}. ${currentValue !== undefined ? `Current value: ${currentValue.toFixed(2)}.` : ''} Take proactive action to prevent this condition.`,
      timestamp: new Date(),
      acknowledged: false,
      metadata: {
        metric,
        predictedValue,
        predictedTime,
        threshold,
        currentValue,
      },
    };

    this.alerts.set(alert.id, alert);

    // Send through configured channels
    await this.sendThroughChannels(alert);

    this.logger.log(
      `Predictive alert sent for ${metric}: predicted ${predictedValue} at ${predictedTime.toISOString()} (threshold: ${threshold}, severity: ${severity})`,
    );

    return alert;
  }

  async getAlerts(filters?: {
    type?: string;
    severity?: string;
    acknowledged?: boolean;
    limit?: number;
  }): Promise<Alert[]> {
    let alerts = Array.from(this.alerts.values());

    if (filters?.type) {
      alerts = alerts.filter((a) => a.type === filters.type);
    }

    if (filters?.severity) {
      alerts = alerts.filter((a) => a.severity === filters.severity);
    }

    if (filters?.acknowledged !== undefined) {
      alerts = alerts.filter((a) => a.acknowledged === filters.acknowledged);
    }

    // Sort by timestamp descending (newest first)
    alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    if (filters?.limit) {
      alerts = alerts.slice(0, filters.limit);
    }

    return alerts;
  }

  async getAlert(alertId: string): Promise<Alert | undefined> {
    return this.alerts.get(alertId);
  }

  async acknowledgeAlert(alertId: string): Promise<Alert | undefined> {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.acknowledged = true;
      this.alerts.set(alertId, alert);
      this.logger.log(`Alert ${alertId} acknowledged`);
    }
    return alert;
  }

  async getUnacknowledgedCount(): Promise<number> {
    return Array.from(this.alerts.values()).filter((a) => !a.acknowledged).length;
  }

  private async sendThroughChannels(alert: Alert): Promise<void> {
    const promises: Promise<void>[] = [];

    for (const channel of this.config.channels) {
      switch (channel) {
        case AlertChannel.IN_APP:
          promises.push(this.sendInAppAlert(alert));
          break;
        case AlertChannel.EMAIL:
          promises.push(this.sendEmailAlert(alert));
          break;
        case AlertChannel.PUSH:
          promises.push(this.sendPushNotification(alert));
          break;
        case AlertChannel.WEBHOOK:
          promises.push(this.sendWebhookAlert(alert));
          break;
      }
    }

    await Promise.allSettled(promises);
  }

  private async sendInAppAlert(alert: Alert): Promise<void> {
    // In-app alerts are already stored in the alerts Map
    // This could trigger WebSocket notifications in the future
    this.logger.debug(`In-app alert stored: ${alert.id}`);
  }

  private async sendEmailAlert(alert: Alert): Promise<void> {
    // Placeholder for email integration
    // In production, this would use a service like SendGrid, AWS SES, or nodemailer
    this.logger.log(
      `[EMAIL] Would send to ${this.config.emailRecipients?.join(', ')}: ${alert.title}`,
    );
  }

  private async sendPushNotification(alert: Alert): Promise<void> {
    // Placeholder for push notification integration
    // In production, this would use FCM (Firebase Cloud Messaging)
    this.logger.log(`[PUSH] Would send notification: ${alert.title}`);
  }

  private async sendWebhookAlert(alert: Alert): Promise<void> {
    // Placeholder for webhook integration
    if (this.config.webhookUrl) {
      this.logger.log(
        `[WEBHOOK] Would POST to ${this.config.webhookUrl}: ${alert.title}`,
      );
    }
  }

  // Configuration methods
  setConfig(config: Partial<AlertConfig>): void {
    Object.assign(this.config, config);
    this.logger.log(`Alert configuration updated: ${JSON.stringify(this.config)}`);
  }

  getConfig(): AlertConfig {
    return { ...this.config };
  }
}
