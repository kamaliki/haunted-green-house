import { Injectable, Logger } from '@nestjs/common';
import { InfluxDbService } from '../../common/services/influxdb/influxdb.service';
import { MqttClientService } from '../../common/services/mqtt/mqtt-client.service';
import { SensorReading, Alert, AlertThreshold } from './interfaces/sensor-reading.interface';
import { SensorType } from './dto/sensor-reading.dto';

@Injectable()
export class EnvironmentService {
  private readonly logger = new Logger(EnvironmentService.name);
  private lastAlertTimes: Map<string, Date> = new Map();

  private readonly alertThresholds: AlertThreshold[] = [
    {
      sensorType: SensorType.TEMPERATURE_AIR,
      minValue: 10,
      maxValue: 35,
      cooldownMinutes: 5,
      severity: 'critical',
      notificationChannels: ['email', 'websocket', 'mqtt'],
    },
    {
      sensorType: SensorType.HUMIDITY_AIR,
      minValue: 30,
      maxValue: 85,
      cooldownMinutes: 10,
      severity: 'medium',
      notificationChannels: ['websocket', 'mqtt'],
    },
    {
      sensorType: SensorType.CO2_LEVEL,
      maxValue: 1500,
      cooldownMinutes: 15,
      severity: 'high',
      notificationChannels: ['websocket', 'mqtt'],
    },
    {
      sensorType: SensorType.SOIL_MOISTURE,
      minValue: 20,
      maxValue: 80,
      cooldownMinutes: 30,
      severity: 'high',
      notificationChannels: ['websocket', 'mqtt'],
    },
    {
      sensorType: SensorType.SOIL_PH,
      minValue: 5.5,
      maxValue: 7.5,
      cooldownMinutes: 60,
      severity: 'medium',
      notificationChannels: ['websocket', 'mqtt'],
    },
  ];

  constructor(
    private influxDbService: InfluxDbService,
    private mqttClientService: MqttClientService,
  ) {}

  async processSensorReading(reading: SensorReading): Promise<void> {
    this.logger.log(`Processing sensor reading: ${reading.deviceId} - ${reading.sensorType}: ${reading.value}`);

    // Validate sensor reading
    if (!this.validateSensorReading(reading)) {
      this.logger.warn(`Invalid sensor reading discarded: ${JSON.stringify(reading)}`);
      return;
    }

    // Store to InfluxDB
    await this.storeSensorData(reading);

    // Check for alerts
    await this.checkAlerts(reading);
  }

  private validateSensorReading(reading: SensorReading): boolean {
    const { sensorType, value } = reading;

    const validationRules: Record<SensorType, { min: number; max: number }> = {
      [SensorType.TEMPERATURE_AIR]: { min: -10, max: 50 },
      [SensorType.TEMPERATURE_SOIL]: { min: 0, max: 40 },
      [SensorType.HUMIDITY_AIR]: { min: 0, max: 100 },
      [SensorType.HUMIDITY_SOIL]: { min: 0, max: 100 },
      [SensorType.LIGHT_INTENSITY]: { min: 0, max: 100000 },
      [SensorType.CO2_LEVEL]: { min: 300, max: 5000 },
      [SensorType.SOIL_MOISTURE]: { min: 0, max: 100 },
      [SensorType.SOIL_PH]: { min: 0, max: 14 },
      [SensorType.AIR_QUALITY]: { min: 0, max: 500 },
    };

    const rule = validationRules[sensorType];
    if (!rule) {
      return false;
    }

    return value >= rule.min && value <= rule.max;
  }

  private async storeSensorData(reading: SensorReading): Promise<void> {
    await this.influxDbService.writeSensorData(
      'sensor_readings',
      {
        device_id: reading.deviceId,
        sensor_type: reading.sensorType,
      },
      {
        value: reading.value,
        unit: reading.unit,
      },
      reading.timestamp,
    );

    await this.influxDbService.flush();
  }

  private async checkAlerts(reading: SensorReading): Promise<void> {
    const threshold = this.alertThresholds.find(t => t.sensorType === reading.sensorType);
    if (!threshold) {
      return;
    }

    let alertType: string | null = null;
    let thresholdValue: number | null = null;

    if (threshold.maxValue !== undefined && reading.value > threshold.maxValue) {
      alertType = `${reading.sensorType}_high`;
      thresholdValue = threshold.maxValue;
    } else if (threshold.minValue !== undefined && reading.value < threshold.minValue) {
      alertType = `${reading.sensorType}_low`;
      thresholdValue = threshold.minValue;
    }

    if (alertType && thresholdValue !== null) {
      // Check cooldown
      const alertKey = `${reading.deviceId}-${alertType}`;
      const lastAlertTime = this.lastAlertTimes.get(alertKey);
      const now = new Date();

      if (lastAlertTime) {
        const minutesSinceLastAlert = (now.getTime() - lastAlertTime.getTime()) / (1000 * 60);
        if (minutesSinceLastAlert < threshold.cooldownMinutes) {
          this.logger.debug(`Alert ${alertType} in cooldown period`);
          return;
        }
      }

      // Trigger alert
      await this.triggerAlert({
        alertType,
        sensorType: reading.sensorType,
        deviceId: reading.deviceId,
        value: reading.value,
        threshold: thresholdValue,
        severity: threshold.severity,
        message: this.generateAlertMessage(alertType, reading.value, thresholdValue),
        timestamp: now,
        targetModule: alertType.includes('soil_moisture_low') ? 'irrigation' : undefined,
      });

      this.lastAlertTimes.set(alertKey, now);
    }
  }

  private generateAlertMessage(alertType: string, value: number, threshold: number): string {
    const messages: Record<string, string> = {
      temperature_air_high: `Air temperature ${value}°C exceeds safe limit of ${threshold}°C`,
      temperature_air_low: `Air temperature ${value}°C below safe limit of ${threshold}°C`,
      soil_moisture_low: `Soil moisture ${value}% below threshold of ${threshold}% - irrigation recommended`,
      humidity_air_high: `Air humidity ${value}% exceeds recommended limit of ${threshold}%`,
      co2_level_high: `CO2 level ${value} ppm exceeds safe limit of ${threshold} ppm`,
    };

    return messages[alertType] || `Alert: ${alertType} - value: ${value}, threshold: ${threshold}`;
  }

  private async triggerAlert(alert: Alert): Promise<void> {
    this.logger.warn(`ALERT: ${alert.alertType} - ${alert.message}`);

    // Publish to MQTT
    const topic = `greenhouse/alerts/${alert.alertType}`;
    await this.mqttClientService.publish(topic, JSON.stringify(alert));

    // TODO: Send email notification
    // TODO: Broadcast via WebSocket
  }

  async getLatestReadings(): Promise<Record<string, any>> {
    try {
      const query = `
        from(bucket: "sensor-data")
          |> range(start: -1h)
          |> filter(fn: (r) => r._measurement == "sensor_readings")
          |> filter(fn: (r) => r._field == "value")
          |> group(columns: ["device_id", "sensor_type"])
          |> last()
      `;

      const results = await this.influxDbService.query(query);
      const readings: Record<string, any> = {};

      for (const row of results) {
        const key = `${row.device_id}_${row.sensor_type}`;
        readings[key] = {
          deviceId: row.device_id,
          sensorType: row.sensor_type,
          value: row._value,
          timestamp: row._time,
        };
      }

      return readings;
    } catch (error) {
      this.logger.error(`Failed to get latest readings: ${error.message}`);
      return {};
    }
  }

  async getSensorStatus(): Promise<any[]> {
    try {
      const query = `
        from(bucket: "sensor-data")
          |> range(start: -10m)
          |> filter(fn: (r) => r._measurement == "sensor_readings")
          |> filter(fn: (r) => r._field == "value")
          |> group(columns: ["device_id", "sensor_type"])
          |> last()
      `;

      const results = await this.influxDbService.query(query);
      const sensorStatuses: any[] = [];

      for (const row of results) {
        const now = Date.now();
        const lastSeen = new Date(row._time).getTime();
        const minutesSinceLastReading = (now - lastSeen) / (1000 * 60);

        sensorStatuses.push({
          deviceId: row.device_id,
          sensorType: row.sensor_type,
          status: minutesSinceLastReading < 5 ? 'active' : 'inactive',
          lastSeen: row._time,
          lastValue: row._value,
        });
      }

      return sensorStatuses;
    } catch (error) {
      this.logger.error(`Failed to get sensor status: ${error.message}`);
      return [];
    }
  }
}
