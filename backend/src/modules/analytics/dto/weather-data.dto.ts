import { ApiProperty } from '@nestjs/swagger';

export class WeatherDataDto {
  @ApiProperty({ example: '2024-01-15T14:00:00.000Z', description: 'Forecast timestamp' })
  timestamp: Date;

  @ApiProperty({ example: 22.5, description: 'Temperature in Celsius' })
  temperature: number;

  @ApiProperty({ example: 65.0, description: 'Humidity percentage' })
  humidity: number;

  @ApiProperty({ example: 0.0, description: 'Precipitation in mm' })
  precipitation: number;

  @ApiProperty({ example: 850.0, description: 'Solar radiation in W/m²' })
  solarRadiation: number;

  @ApiProperty({ example: 'OpenWeatherMap', description: 'Weather data source' })
  source: string;
}
