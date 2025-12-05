import { ApiProperty } from '@nestjs/swagger';

export class OptimizationRecommendationDto {
  @ApiProperty({ example: 'rec-123e4567-e89b-12d3-a456-426614174000', description: 'Unique recommendation ID' })
  id: string;

  @ApiProperty({
    example: 'temperature',
    description: 'Category of recommendation',
    enum: ['temperature', 'humidity', 'light', 'irrigation', 'general'],
  })
  category: 'temperature' | 'humidity' | 'light' | 'irrigation' | 'general';

  @ApiProperty({ example: 'Optimize temperature control', description: 'Recommendation title' })
  title: string;

  @ApiProperty({
    example: 'Temperature fluctuations detected during night hours. Consider adjusting heating schedule.',
    description: 'Detailed description of recommendation',
  })
  description: string;

  @ApiProperty({
    example: 'Reduce temperature variance by 15%, improve plant growth rate by 5-10%',
    description: 'Expected impact of implementing recommendation',
  })
  expectedImpact: string;

  @ApiProperty({
    example: 'high',
    description: 'Priority level',
    enum: ['low', 'medium', 'high'],
  })
  priority: 'low' | 'medium' | 'high';

  @ApiProperty({
    example: ['Adjust heating schedule to start 1 hour earlier', 'Monitor temperature variance over next 3 days'],
    description: 'Specific action items to implement',
    type: [String],
  })
  actionItems: string[];

  @ApiProperty({ example: '2024-01-15T12:00:00.000Z', description: 'When recommendation was generated' })
  generatedAt: Date;
}
