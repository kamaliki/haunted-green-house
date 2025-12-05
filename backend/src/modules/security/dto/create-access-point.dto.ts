import { IsString, IsEnum, IsBoolean, IsInt, IsOptional, Min, MaxLength } from 'class-validator';

export class CreateAccessPointDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsEnum(['door', 'window'])
  type: 'door' | 'window';

  @IsString()
  @MaxLength(255)
  location: string;

  @IsOptional()
  @IsEnum(['open', 'closed', 'locked', 'unlocked'])
  status?: 'open' | 'closed' | 'locked' | 'unlocked';

  @IsOptional()
  @IsBoolean()
  monitoringEnabled?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  alertThreshold?: number;
}
