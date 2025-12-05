export interface Disease {
  name: string;
  confidence: number;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  affectedArea: string;
  description: string;
}

export interface Recommendation {
  action: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timing: string;
}

export interface GrowthMetrics {
  heightCm: number;
  leafCount: number;
  colorHealth: number; // 0-100 scale
  growthRate?: number; // cm/day
  isStunted?: boolean;
}

export interface GrowthComparison {
  currentMetrics: GrowthMetrics;
  previousMetrics?: GrowthMetrics;
  daysSinceLast?: number;
  heightChange?: number;
  leafCountChange?: number;
  growthRate?: number;
  isAbnormal?: boolean;
  abnormalityReason?: string;
}

export interface AnalysisResult {
  analysisId: string;
  plantId: string;
  timestamp: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  results?: {
    diseaseDetected: boolean;
    diseases: Disease[];
    healthScore: number;
    recommendations: Recommendation[];
    growthMetrics?: GrowthMetrics;
    growthComparison?: GrowthComparison;
  };
  environmentalContext?: {
    temperature?: number;
    humidity?: number;
    note?: string;
  };
  imageUrl: string;
}

export interface UploadMetadata {
  plantId: string;
  location: string;
  notes?: string;
  timestamp: Date;
}
