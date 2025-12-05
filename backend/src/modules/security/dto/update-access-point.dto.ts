import { PartialType } from '@nestjs/mapped-types';
import { CreateAccessPointDto } from './create-access-point.dto';

export class UpdateAccessPointDto extends PartialType(CreateAccessPointDto) {}
