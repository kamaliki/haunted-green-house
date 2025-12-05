import { IsString, IsOptional, IsIn } from 'class-validator';

export class UploadImageDto {
  @IsString()
  plantId: string;

  @IsString()
  @IsIn(['zone-a', 'zone-b', 'zone-c', 'zone-d'])
  location: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
