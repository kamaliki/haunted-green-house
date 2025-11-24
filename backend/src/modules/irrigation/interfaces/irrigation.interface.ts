export interface IrrigationSession {
  sessionId: string;
  zone: string;
  startTime: Date;
  endTime?: Date;
  durationSeconds: number;
  flowRatePercent: number;
  totalVolume?: number;
  reason: 'automatic' | 'manual';
  initiatedBy: string;
  status: 'active' | 'completed' | 'stopped' | 'failed';
}

export interface IrrigationCommand {
  command: 'start' | 'stop' | 'adjust_flow';
  zone: string;
  durationSeconds?: number;
  flowRatePercent?: number;
  reason: string;
  initiatedBy: string;
  timestamp: Date;
}

export interface ZoneStatus {
  zone: string;
  status: 'active' | 'idle';
  startTime?: Date;
  estimatedEndTime?: Date;
  flowRate?: number;
  totalVolume?: number;
  lastIrrigation?: Date;
}
