import { SensorType } from '../dto/sensor-reading.dto';

export interface SensorReading {
  deviceId: string;
  sensorType: SensorType;
  value: number;
  unit: string;
  timestamp: Date;
}

export interface Alert {
  alertType: string;
  sensorType: SensorType;
  deviceId: string;
  value: number;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  targetModule?: string;
  location?: string;
}

export interface AlertThreshold {
  sensorType: SensorType;
  minValue?: number;
  maxValue?: number;
  cooldownMinutes: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  notificationChannels: ('email' | 'websocket' | 'mqtt')[];
}
