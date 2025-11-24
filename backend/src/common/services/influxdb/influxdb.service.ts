import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InfluxDB, Point, WriteApi } from '@influxdata/influxdb-client';

@Injectable()
export class InfluxDbService implements OnModuleInit {
  private readonly logger = new Logger(InfluxDbService.name);
  private influxDB: InfluxDB;
  private writeApi: WriteApi;
  private bucket: string;
  private org: string;

  constructor(private configService: ConfigService) {}

  onModuleInit(): void {
    const url = this.configService.get<string>('INFLUXDB_URL', 'http://localhost:8086');
    const token = this.configService.get<string>('INFLUXDB_TOKEN');
    this.org = this.configService.get<string>('INFLUXDB_ORG', 'haunted-greenhouse');
    this.bucket = this.configService.get<string>('INFLUXDB_BUCKET', 'sensor-data');

    this.logger.log(`Connecting to InfluxDB: ${url}`);

    this.influxDB = new InfluxDB({ url, token });
    this.writeApi = this.influxDB.getWriteApi(this.org, this.bucket, 'ms');
    
    // Set default tags
    this.writeApi.useDefaultTags({ source: 'haunted-greenhouse-backend' });

    this.logger.log('InfluxDB client initialized');
  }

  async writeSensorData(
    measurement: string,
    tags: Record<string, string>,
    fields: Record<string, number | string | boolean>,
    timestamp?: Date,
  ): Promise<void> {
    const point = new Point(measurement);

    // Add tags
    Object.entries(tags).forEach(([key, value]) => {
      point.tag(key, value);
    });

    // Add fields
    Object.entries(fields).forEach(([key, value]) => {
      if (typeof value === 'number') {
        point.floatField(key, value);
      } else if (typeof value === 'boolean') {
        point.booleanField(key, value);
      } else {
        point.stringField(key, value);
      }
    });

    // Set timestamp if provided
    if (timestamp) {
      point.timestamp(timestamp);
    }

    this.writeApi.writePoint(point);
    this.logger.debug(`Wrote point to InfluxDB: ${measurement}`);
  }

  async flush(): Promise<void> {
    await this.writeApi.flush();
  }

  async close(): Promise<void> {
    await this.writeApi.close();
    this.logger.log('InfluxDB connection closed');
  }

  getQueryApi() {
    return this.influxDB.getQueryApi(this.org);
  }

  async query(fluxQuery: string): Promise<any[]> {
    const queryApi = this.getQueryApi();
    const results: any[] = [];

    return new Promise((resolve, reject) => {
      queryApi.queryRows(fluxQuery, {
        next: (row, tableMeta) => {
          const record = tableMeta.toObject(row);
          results.push(record);
        },
        error: (error) => {
          this.logger.error(`Query error: ${error.message}`, error.stack);
          reject(error);
        },
        complete: () => {
          resolve(results);
        },
      });
    });
  }

  getBucket(): string {
    return this.bucket;
  }

  getOrg(): string {
    return this.org;
  }
}
