import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class CreateZoneDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  description?: string;
}
