import { IsString, IsEnum, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class AccessPointStatusDto {
  @IsString()
  id: string;

  @IsEnum(['door', 'window'])
  type: 'door' | 'window';

  @IsString()
  location: string;

  @IsEnum(['open', 'closed'])
  status: 'open' | 'closed';

  @IsDate()
  @Type(() => Date)
  lastChanged: Date;
}
