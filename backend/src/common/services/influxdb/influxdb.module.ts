import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { InfluxDbService } from './influxdb.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [InfluxDbService],
  exports: [InfluxDbService],
})
export class InfluxDbModule {}
