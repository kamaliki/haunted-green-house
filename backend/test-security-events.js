/**
 * Test script to generate security events via MQTT
 * Run with: node test-security-events.js
 */

const mqtt = require('mqtt');

// Connect to MQTT broker
const client = mqtt.connect('mqtt://localhost:1883');

client.on('connect', () => {
  console.log('Connected to MQTT broker');
  
  // Generate some test events
  generateTestEvents();
});

client.on('error', (error) => {
  console.error('MQTT connection error:', error);
  process.exit(1);
});

function generateTestEvents() {
  console.log('Generating test security events...\n');
  
  // Motion detection event
  console.log('1. Publishing motion detection event...');
  client.publish('greenhouse/security/motion/zone_a', JSON.stringify({
    timestamp: new Date().toISOString(),
    location: 'Zone A - North Wing',
    confidence: 85,
    sensorId: 'motion_sensor_001'
  }));
  
  setTimeout(() => {
    // Door opened event
    console.log('2. Publishing door opened event...');
    client.publish('greenhouse/security/door/main_entrance', JSON.stringify({
      id: 'door_main_entrance',
      timestamp: new Date().toISOString(),
      location: 'Main Entrance',
      status: 'open'
    }));
  }, 1000);
  
  setTimeout(() => {
    // Window opened event
    console.log('3. Publishing window opened event...');
    client.publish('greenhouse/security/window/north_window_1', JSON.stringify({
      id: 'window_north_1',
      timestamp: new Date().toISOString(),
      location: 'North Wing - Window 1',
      status: 'open'
    }));
  }, 2000);
  
  setTimeout(() => {
    // Door closed event
    console.log('4. Publishing door closed event...');
    client.publish('greenhouse/security/door/main_entrance', JSON.stringify({
      id: 'door_main_entrance',
      timestamp: new Date().toISOString(),
      location: 'Main Entrance',
      status: 'closed'
    }));
  }, 3000);
  
  setTimeout(() => {
    // Another motion event (off-hours simulation)
    console.log('5. Publishing another motion detection event...');
    client.publish('greenhouse/security/motion/zone_b', JSON.stringify({
      timestamp: new Date().toISOString(),
      location: 'Zone B - South Wing',
      confidence: 92,
      sensorId: 'motion_sensor_002'
    }));
  }, 4000);
  
  setTimeout(() => {
    // Window closed event
    console.log('6. Publishing window closed event...');
    client.publish('greenhouse/security/window/north_window_1', JSON.stringify({
      id: 'window_north_1',
      timestamp: new Date().toISOString(),
      location: 'North Wing - Window 1',
      status: 'closed'
    }));
  }, 5000);
  
  setTimeout(() => {
    console.log('\n✅ All test events published successfully!');
    console.log('Check the Security page in the UI to see the events.');
    client.end();
    process.exit(0);
  }, 6000);
}
