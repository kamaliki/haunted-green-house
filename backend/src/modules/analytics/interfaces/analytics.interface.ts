export interface PredictionResult {
  metric: string;
  predictions: Array<{
    timestamp: Date;
    value: number;
    confidenceInterval: {
      lower: number;
      upper: number;
    };
  }>;
  generatedAt: Date;
  dataPointsUsed: number;
}

export interface OptimizationRecommendation {
  id: string;
  category: 'temperature' | 'humidity' | 'light' | 'irrigation' | 'general';
  title: string;
  description: string;
  expectedImpact: string;
  priority: 'low' | 'medium' | 'high';
  actionItems: string[];
  generatedAt: Date;
}

export interface WeatherData {
  timestamp: Date;
  temperature: number;
  humidity: number;
  precipitation: number;
  solarRadiation: number;
  source: string;
}

export interface TimeSeriesPoint {
  timestamp: Date;
  value: number;
}

export interface ForecastConfig {
  method: 'moving_average' | 'exponential_smoothing' | 'linear_regression';
  confidenceLevel: number; // 0.0 to 1.0
}

export interface AnalysisContext {
  environmentalData: TimeSeriesPoint[];
  plantHealthData: any[];
  growthMetrics: any[];
  weatherForecast: WeatherData[];
}

export interface WeatherApiConfig {
  apiUrl: string;
  apiKey: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

export interface ThresholdConfig {
  metric: string;
  upperThreshold?: number;
  lowerThreshold?: number;
}
