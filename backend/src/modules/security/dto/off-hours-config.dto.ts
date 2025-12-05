import { IsBoolean, IsNumber, Min, Max } from 'class-validator';

export class OffHoursConfigDto {
  @IsBoolean()
  enabled: boolean;

  @IsNumber()
  @Min(0)
  @Max(23)
  startHour: number;

  @IsNumber()
  @Min(0)
  @Max(23)
  endHour: number;
}
