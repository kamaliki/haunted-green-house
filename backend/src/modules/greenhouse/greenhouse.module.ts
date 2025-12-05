import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GreenhouseController } from './greenhouse.controller';
import { GreenhouseService } from './greenhouse.service';
import { Greenhouse } from './entities/greenhouse.entity';
import { Zone } from './entities/zone.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Greenhouse, Zone])],
  controllers: [GreenhouseController],
  providers: [GreenhouseService],
  exports: [GreenhouseService],
})
export class GreenhouseModule {}
