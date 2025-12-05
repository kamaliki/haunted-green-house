export class AnalysisResultDto {
  analysisId: string;
  plantId: string;
  timestamp: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  results?: {
    diseaseDetected: boolean;
    diseases: Array<{
      name: string;
      confidence: number;
      severity: string;
      affectedArea: string;
      description: string;
    }>;
    healthScore: number;
    recommendations: Array<{
      action: string;
      priority: string;
      timing: string;
    }>;
  };
  environmentalContext?: {
    temperature?: number;
    humidity?: number;
    note?: string;
  };
  imageUrl: string;
}
