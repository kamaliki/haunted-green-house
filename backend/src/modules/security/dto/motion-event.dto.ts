import { IsString, IsNumber, IsDate, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class MotionEventDto {
  @IsDate()
  @Type(() => Date)
  timestamp: Date;

  @IsString()
  location: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  confidence: number;

  @IsString()
  sensorId: string;
}
