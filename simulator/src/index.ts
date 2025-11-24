import * as mqtt from 'mqtt';
import * as dotenv from 'dotenv';
import { Command } from 'commander';

dotenv.config({ path: '../.env' });

const program = new Command();

program
  .option('--scenario <name>', 'Scenario to run', 'normal')
  .option('--verbose', 'Enable verbose logging', false)
  .option('--duration <minutes>', 'Run duration in minutes', '0')
  .parse(process.argv);

const options = program.opts();

interface SensorReading {
  deviceId: string;
  sensorType: string;
  value: number;
  unit: string;
  timestamp: string;
}

class DeviceSimulator {
  private client!: mqtt.MqttClient;
  private devices: Map<string, NodeJS.Timeout> = new Map();
  private scenarioTimer?: NodeJS.Timeout;

  constructor(
    private brokerUrl: string,
    private verbose: boolean = false,
  ) {}

  async connect(): Promise<void> {
    console.log(`[Simulator] Connecting to MQTT broker: ${this.brokerUrl}`);

    this.client = mqtt.connect(this.brokerUrl, {
      clientId: `device-simulator-${Date.now()}`,
      clean: true,
    });

    return new Promise((resolve, reject) => {
      this.client.on('connect', () => {
        console.log('[Simulator] Connected successfully');
        resolve();
      });

      this.client.on('error', (error) => {
        console.error(`[Simulator] Connection error: ${error.message}`);
        reject(error);
      });
    });
  }

  async startDevices(): Promise<void> {
    console.log('[Simulator] Starting 4 devices...\n');

    // Device 1: Main Environmental Sensor
    this.startDevice('sensor-001', 30000, () => [
      { sensorType: 'temperature_air', value: this.randomValue(20, 30), unit: 'celsius' },
      { sensorType: 'humidity_air', value: this.randomValue(50, 70), unit: 'percent' },
      { sensorType: 'co2_level', value: this.randomValue(400, 800), unit: 'ppm' },
      { sensorType: 'light_intensity', value: this.getLightIntensity(), unit: 'lux' },
      { sensorType: 'air_quality', value: this.randomValue(70, 100), unit: 'index' },
    ]);

    // Device 2: Soil Sensor Zone A
    this.startDevice('soil-sensor-01', 60000, () => [
      { sensorType: 'temperature_soil', value: this.randomValue(18, 25), unit: 'celsius' },
      { sensorType: 'humidity_soil', value: this.randomValue(60, 80), unit: 'percent' },
      { sensorType: 'soil_moisture', value: this.randomValue(40, 70), unit: 'percent' },
      { sensorType: 'soil_ph', value: this.randomValue(6.0, 7.0), unit: 'ph' },
    ]);

    // Device 3: Soil Sensor Zone B
    this.startDevice('soil-sensor-02', 60000, () => [
      { sensorType: 'temperature_soil', value: this.randomValue(16, 22), unit: 'celsius' },
      { sensorType: 'humidity_soil', value: this.randomValue(70, 90), unit: 'percent' },
      { sensorType: 'soil_moisture', value: this.randomValue(45, 75), unit: 'percent' },
      { sensorType: 'soil_ph', value: this.randomValue(6.5, 7.5), unit: 'ph' },
    ]);

    // Device 4: Secondary Environmental Sensor
    this.startDevice('sensor-002', 45000, () => [
      { sensorType: 'temperature_air', value: this.randomValue(18, 28), unit: 'celsius' },
      { sensorType: 'humidity_air', value: this.randomValue(45, 75), unit: 'percent' },
      { sensorType: 'co2_level', value: this.randomValue(350, 900), unit: 'ppm' },
    ]);
  }

  private startDevice(
    deviceId: string,
    interval: number,
    readingsGenerator: () => Array<{ sensorType: string; value: number; unit: string }>,
  ): void {
    console.log(`[${deviceId}] Publishing every ${interval / 1000}s`);

    const publishReadings = () => {
      const readings = readingsGenerator();
      
      readings.forEach(reading => {
        const payload: SensorReading = {
          deviceId,
          sensorType: reading.sensorType,
          value: reading.value,
          unit: reading.unit,
          timestamp: new Date().toISOString(),
        };

        const topic = `greenhouse/sensors/${deviceId}/${reading.sensorType}`;
        this.client.publish(topic, JSON.stringify(payload), { qos: 1 });

        if (this.verbose) {
          console.log(`[${deviceId}] Published ${reading.sensorType}: ${reading.value.toFixed(2)}`);
        }
      });
    };

    // Publish immediately
    publishReadings();

    // Then publish at intervals
    const timer = setInterval(publishReadings, interval);
    this.devices.set(deviceId, timer);
  }

  private randomValue(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }

  private getLightIntensity(): number {
    const hour = new Date().getHours();
    
    // Night time (0-6, 20-24)
    if (hour < 6 || hour >= 20) {
      return this.randomValue(0, 100);
    }
    
    // Morning (6-12)
    if (hour < 12) {
      return this.randomValue(5000, 30000);
    }
    
    // Afternoon (12-16)
    if (hour < 16) {
      return this.randomValue(30000, 50000);
    }
    
    // Evening (16-20)
    return this.randomValue(10000, 25000);
  }

  async runScenario(scenario: string): Promise<void> {
    switch (scenario) {
      case 'temp-spike':
        await this.temperatureSpikeScenario();
        break;
      case 'low-moisture':
        await this.lowMoistureScenario();
        break;
      case 'normal':
      default:
        console.log('[Scenario] Running normal operation\n');
        break;
    }
  }

  private async temperatureSpikeScenario(): Promise<void> {
    console.log('[Scenario] Temperature spike will occur in 2 minutes...\n');

    this.scenarioTimer = setTimeout(() => {
      console.log('\n[Scenario] TRIGGERING TEMPERATURE SPIKE!\n');

      // Override sensor-001 to publish high temperature
      const deviceId = 'sensor-001';
      const timer = this.devices.get(deviceId);
      if (timer) {
        clearInterval(timer);
      }

      let temperature = 30;
      const spikeInterval = setInterval(() => {
        temperature += 2;

        const payload: SensorReading = {
          deviceId,
          sensorType: 'temperature_air',
          value: temperature,
          unit: 'celsius',
          timestamp: new Date().toISOString(),
        };

        this.client.publish(`greenhouse/sensors/${deviceId}/temperature_air`, JSON.stringify(payload), { qos: 1 });
        console.log(`[${deviceId}] Temperature spike: ${temperature}°C`);

        if (temperature >= 36) {
          clearInterval(spikeInterval);
          console.log('\n[Scenario] Temperature spike complete. Returning to normal...\n');

          // Resume normal operation
          this.startDevice(deviceId, 30000, () => [
            { sensorType: 'temperature_air', value: this.randomValue(20, 30), unit: 'celsius' },
            { sensorType: 'humidity_air', value: this.randomValue(50, 70), unit: 'percent' },
            { sensorType: 'co2_level', value: this.randomValue(400, 800), unit: 'ppm' },
            { sensorType: 'light_intensity', value: this.getLightIntensity(), unit: 'lux' },
            { sensorType: 'air_quality', value: this.randomValue(70, 100), unit: 'index' },
          ]);
        }
      }, 10000); // Increase every 10 seconds
    }, 120000); // 2 minutes
  }

  private async lowMoistureScenario(): Promise<void> {
    console.log('[Scenario] Low soil moisture will occur in 1 minute...\n');

    this.scenarioTimer = setTimeout(() => {
      console.log('\n[Scenario] TRIGGERING LOW SOIL MOISTURE!\n');

      const deviceId = 'soil-sensor-01';
      const timer = this.devices.get(deviceId);
      if (timer) {
        clearInterval(timer);
      }

      let moisture = 40;
      const moistureInterval = setInterval(() => {
        moisture -= 5;

        const payload: SensorReading = {
          deviceId,
          sensorType: 'soil_moisture',
          value: moisture,
          unit: 'percent',
          timestamp: new Date().toISOString(),
        };

        this.client.publish(`greenhouse/sensors/${deviceId}/soil_moisture`, JSON.stringify(payload), { qos: 1 });
        console.log(`[${deviceId}] Soil moisture dropping: ${moisture}%`);

        if (moisture <= 15) {
          clearInterval(moistureInterval);
          console.log('\n[Scenario] Low moisture alert should trigger! Waiting for irrigation...\n');
        }
      }, 15000); // Decrease every 15 seconds
    }, 60000); // 1 minute
  }

  stop(): void {
    console.log('\n[Simulator] Stopping all devices...');
    
    this.devices.forEach((timer, deviceId) => {
      clearInterval(timer);
      console.log(`[${deviceId}] Stopped`);
    });

    if (this.scenarioTimer) {
      clearTimeout(this.scenarioTimer);
    }

    this.client.end();
    console.log('[Simulator] Disconnected from MQTT broker');
  }
}

async function main() {
  const brokerUrl = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';
  const simulator = new DeviceSimulator(brokerUrl, options.verbose);

  try {
    await simulator.connect();
    await simulator.startDevices();
    await simulator.runScenario(options.scenario);

    // Handle duration
    if (parseInt(options.duration) > 0) {
      const durationMs = parseInt(options.duration) * 60 * 1000;
      console.log(`[Simulator] Will run for ${options.duration} minutes\n`);
      
      setTimeout(() => {
        simulator.stop();
        process.exit(0);
      }, durationMs);
    }

    // Handle Ctrl+C
    process.on('SIGINT', () => {
      simulator.stop();
      process.exit(0);
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[Simulator] Error: ${message}`);
    process.exit(1);
  }
}

main();
