import { IsString, IsNumber, Min, Max, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class GetPredictionsDto {
  @ApiProperty({
    example: 'temperature_air,humidity_air,light_intensity',
    description: 'Comma-separated list of metrics to predict',
    required: false,
  })
  @IsOptional()
  @IsString()
  metrics?: string;

  @ApiProperty({
    example: 24,
    description: 'Number of hours to forecast ahead',
    minimum: 1,
    maximum: 168,
    required: false,
    default: 24,
  })
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value, 10) : undefined))
  @IsNumber()
  @Min(1)
  @Max(168)
  hours?: number;
}
