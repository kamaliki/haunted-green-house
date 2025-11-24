import { IsString, IsNumber, Min, Max, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StartIrrigationDto {
  @ApiProperty({ example: 'zone-a', description: 'Irrigation zone identifier' })
  @IsString()
  zone: string;

  @ApiProperty({ example: 600, description: 'Duration in seconds', minimum: 60, maximum: 1800 })
  @IsNumber()
  @Min(60)
  @Max(1800)
  durationSeconds: number;

  @ApiProperty({ example: 80, description: 'Flow rate percentage', minimum: 0, maximum: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  flowRatePercent: number;

  @ApiProperty({ example: 'user-123', description: 'Operator ID', required: false })
  @IsOptional()
  @IsString()
  operatorId?: string;
}

export class StopIrrigationDto {
  @ApiProperty({ example: 'zone-a', description: 'Irrigation zone identifier' })
  @IsString()
  zone: string;

  @ApiProperty({ example: 'user-123', description: 'Operator ID', required: false })
  @IsOptional()
  @IsString()
  operatorId?: string;
}

export class AdjustFlowRateDto {
  @ApiProperty({ example: 'zone-a', description: 'Irrigation zone identifier' })
  @IsString()
  zone: string;

  @ApiProperty({ example: 60, description: 'New flow rate percentage', minimum: 0, maximum: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  flowRatePercent: number;

  @ApiProperty({ example: 'user-123', description: 'Operator ID', required: false })
  @IsOptional()
  @IsString()
  operatorId?: string;
}
