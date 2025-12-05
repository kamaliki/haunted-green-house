export interface MotionEvent {
  timestamp: Date;
  location: string;
  confidence: number;
  sensorId: string;
}

export interface AccessPointStatus {
  id: string;
  type: 'door' | 'window';
  location: string;
  status: 'open' | 'closed';
  lastChanged: Date;
}

export interface SecurityEvent {
  id: string;
  type: 'motion_detected' | 'door_opened' | 'door_closed' | 'window_opened' | 'window_closed';
  timestamp: Date;
  location: string;
  details: Record<string, any>;
  confidence?: number; // For motion events
  isOffHours?: boolean; // Flag for off-hours motion events
  zoneId?: string;
  zoneName?: string;
}

export interface OffHoursConfig {
  enabled: boolean;
  startHour: number; // 0-23
  endHour: number; // 0-23
}

export interface SecurityAlert {
  id: string;
  type: 'motion' | 'access_point';
  timestamp: Date;
  location: string;
  confidence?: number;
  details: string;
}
