import { IsString, IsNumber, IsISO8601, IsEnum, Min, Max } from 'class-validator';

export enum SensorType {
  TEMPERATURE_AIR = 'temperature_air',
  TEMPERATURE_SOIL = 'temperature_soil',
  HUMIDITY_AIR = 'humidity_air',
  HUMIDITY_SOIL = 'humidity_soil',
  LIGHT_INTENSITY = 'light_intensity',
  CO2_LEVEL = 'co2_level',
  SOIL_MOISTURE = 'soil_moisture',
  SOIL_PH = 'soil_ph',
  AIR_QUALITY = 'air_quality',
}

export class SensorReadingDto {
  @IsString()
  deviceId: string;

  @IsEnum(SensorType)
  sensorType: SensorType;

  @IsNumber()
  value: number;

  @IsString()
  unit: string;

  @IsISO8601()
  timestamp: string;
}

export class BatchSensorReadingDto {
  @IsString()
  deviceId: string;

  readings: Array<{
    sensorType: SensorType;
    value: number;
    unit: string;
  }>;

  @IsISO8601()
  timestamp: string;
}
