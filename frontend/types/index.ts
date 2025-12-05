// Sensor Data
export interface SensorReading {
  metric: string;
  value: number;
  unit: string;
  timestamp: Date;
  location?: string;
}

export interface SensorThreshold {
  min: number;
  max: number;
  unit: string;
}

// Environment Data
export interface EnvironmentData {
  temperature_air: number;
  temperature_soil: number;
  humidity_air: number;
  humidity_soil: number;
  light_intensity: number;
  co2_level: number;
  soil_moisture: number;
  soil_ph: number;
  air_quality: number;
  timestamp: Date;
}

// Historical Data Query
export interface HistoricalDataQuery {
  metrics: string[];
  timeRange: '1h' | '6h' | '24h' | '7d' | '30d';
  startTime?: Date;
  endTime?: Date;
}

export interface TimeSeriesDataPoint {
  timestamp: Date;
  value: number;
}

export interface TimeSeriesData {
  metric: string;
  data: TimeSeriesDataPoint[];
}

// Irrigation Status
export interface IrrigationStatus {
  zoneId: string;
  active: boolean;
  waterFlow: number;
  reservoirLevel: number;
  lastStarted?: Date;
  duration?: number;
}

export interface StartIrrigationRequest {
  duration?: number;
  zoneId?: string;
}

// Plant Health Analysis
export interface AnalysisResult {
  imageId: string;
  diseases: Disease[];
  healthScore: number;
  recommendations: string[];
  timestamp: Date;
}

export interface Disease {
  name: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high';
  treatment: string;
}

// Growth Metrics
export interface GrowthMetrics {
  plantId: string;
  zoneId: string;
  height: number;
  leafCount: number;
  healthScore: number;
  timestamp: Date;
}

export interface Plant {
  id: string;
  zoneId: string;
  name: string;
  species: string;
  plantedDate: Date;
  thumbnailUrl?: string;
  expectedGrowthRate?: {
    height: number; // cm per week
    leafCount: number; // leaves per week
  };
}

// Predictions
export interface Prediction {
  zoneId?: string;
  metric: string;
  predictions: PredictionPoint[];
  confidenceInterval: { lower: number; upper: number }[];
  generatedAt: Date;
}

export interface PredictionPoint {
  timestamp: Date;
  value: number;
}

export interface GetPredictionsQuery {
  metrics?: string[];
  hours?: number;
}

// Optimization Recommendation
export interface Recommendation {
  id: string;
  zoneId: string;
  category: 'environment' | 'irrigation' | 'energy';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  expectedImpact: string;
  actionItems: string[];
  timestamp: Date;
}

// Security Event
export interface SecurityEvent {
  id: string;
  type: 'motion_detected' | 'door_opened' | 'door_closed' | 'window_opened' | 'window_closed';
  timestamp: Date;
  location: string;
  zoneId?: string;
  zoneName?: string;
  details: Record<string, any>;
  confidence?: number; // For motion events
  isOffHours?: boolean; // Flag for off-hours motion events
}

export interface SecurityLogQuery {
  eventType?: string;
  startDate?: Date;
  endDate?: Date;
  location?: string;
  zoneId?: string;
}

// Access Point (Configuration)
export interface AccessPoint {
  id: string;
  name: string;
  type: 'door' | 'window';
  location: string;
  status: 'open' | 'closed' | 'locked' | 'unlocked';
  monitoringEnabled: boolean;
  alertThreshold: number; // seconds
  lastStatusChange: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAccessPointDto {
  name: string;
  type: 'door' | 'window';
  location: string;
  status?: 'open' | 'closed' | 'locked' | 'unlocked';
  monitoringEnabled?: boolean;
  alertThreshold?: number;
}

export interface UpdateAccessPointDto {
  name?: string;
  type?: 'door' | 'window';
  location?: string;
  status?: 'open' | 'closed' | 'locked' | 'unlocked';
  monitoringEnabled?: boolean;
  alertThreshold?: number;
}

// Access Point Status
export interface AccessPointStatus {
  id: string;
  type: 'door' | 'window';
  location: string;
  zoneId?: string;
  zoneName?: string;
  status: 'open' | 'closed';
  lastChanged: Date;
}

// Alert
export interface Alert {
  id: string;
  zoneId?: string;
  zoneName?: string;
  type: 'environmental' | 'security' | 'predictive' | 'system';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  metadata?: Record<string, any>;
}

// Off-Hours Config
export interface OffHoursConfig {
  enabled: boolean;
  startHour: number;
  endHour: number;
}

// Weather Data
export interface WeatherData {
  temperature: number;
  humidity: number;
  conditions: string;
  forecast: ForecastDay[];
  lastUpdate: Date;
}

export interface ForecastDay {
  date: Date;
  tempHigh: number;
  tempLow: number;
  conditions: string;
  precipitation: number;
}

// API Error Response
export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
  details?: any;
}

// Authentication
export interface User {
  id: string;
  name: string;
  email?: string;
  username?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

// Registration
export interface RegisterUserDto {
  username: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  user: User;
  accessToken: string;
}

// Greenhouse Setup
export interface ZoneDto {
  name: string;
  description?: string;
}

export interface CreateGreenhouseDto {
  name: string;
  location: string;
  description?: string;
  zones: ZoneDto[];
}

export interface Greenhouse {
  id: string;
  userId: string;
  name: string;
  location: string;
  description?: string;
  zones: Zone[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Zone {
  id: string;
  greenhouseId: string;
  name: string;
  description?: string;
  orderIndex: number;
  createdAt: Date;
}

// Zone Summary (for zone management interface)
export interface ZoneSummary {
  id: string;
  name: string;
  temperature: number;
  humidity: number;
  healthStatus: 'optimal' | 'warning' | 'critical';
  activeAlerts: number;
  lastUpdate: Date;
}
