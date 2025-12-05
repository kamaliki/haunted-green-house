import { ApiProperty } from '@nestjs/swagger';

class ConfidenceIntervalDto {
  @ApiProperty({ example: 22.5, description: 'Lower bound of confidence interval' })
  lower: number;

  @ApiProperty({ example: 27.5, description: 'Upper bound of confidence interval' })
  upper: number;
}

class PredictionPointDto {
  @ApiProperty({ example: '2024-01-15T14:00:00.000Z', description: 'Timestamp of prediction' })
  timestamp: Date;

  @ApiProperty({ example: 25.0, description: 'Predicted value' })
  value: number;

  @ApiProperty({ description: 'Confidence interval for prediction' })
  confidenceInterval: ConfidenceIntervalDto;
}

export class PredictionResultDto {
  @ApiProperty({ example: 'temperature_air', description: 'Metric name' })
  metric: string;

  @ApiProperty({ type: [PredictionPointDto], description: 'Array of predictions' })
  predictions: PredictionPointDto[];

  @ApiProperty({ example: '2024-01-15T12:00:00.000Z', description: 'When predictions were generated' })
  generatedAt: Date;

  @ApiProperty({ example: 720, description: 'Number of historical data points used' })
  dataPointsUsed: number;
}
