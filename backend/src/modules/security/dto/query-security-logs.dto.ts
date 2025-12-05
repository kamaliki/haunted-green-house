import { IsOptional, IsString, IsDate, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class QuerySecurityLogsDto {
  @IsOptional()
  @IsEnum(['motion_detected', 'door_opened', 'door_closed', 'window_opened', 'window_closed'])
  eventType?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  @IsOptional()
  @IsString()
  location?: string;
}
