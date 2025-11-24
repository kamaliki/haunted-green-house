import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MqttClientService } from './mqtt-client.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [MqttClientService],
  exports: [MqttClientService],
})
export class MqttModule {}
