# Testing Security Events

This guide explains how to test the security event logging system.

## Prerequisites

- Docker containers running (MQTT broker, InfluxDB, backend)
- Node.js installed
- MQTT npm package installed

## Install MQTT Package

```bash
cd backend
npm install mqtt
```

## Generate Test Events

Run the test script to generate sample security events:

```bash
node test-security-events.js
```

This will publish the following events via MQTT:

1. **Motion Detection** - Zone A - North Wing (85% confidence)
2. **Door Opened** - Main Entrance
3. **Window Opened** - North Wing - Window 1
4. **Door Closed** - Main Entrance
5. **Motion Detection** - Zone B - South Wing (92% confidence)
6. **Window Closed** - North Wing - Window 1

## View Events in UI

1. Navigate to the Security page: `http://localhost:3000/security`
2. Scroll down to the "Security Event Log" section
3. You should see all the generated events in the table
4. Use the filters to filter by:
   - Event Type (Motion, Door Opened, Door Closed, etc.)
   - Date Range (Today, Last 7 Days, Last 30 Days, All Time)
   - Location
   - Zone

## Off-Hours Motion Detection

To test off-hours motion detection:

1. Go to Security Settings: `http://localhost:3000/security/settings`
2. Enable off-hours monitoring
3. Set the hours (e.g., 6 PM to 6 AM)
4. Run the test script during off-hours
5. Motion events during off-hours will be highlighted in red with an "OFF-HOURS" badge

## Manual MQTT Testing

You can also manually publish events using an MQTT client:

### Motion Event
```bash
mosquitto_pub -h localhost -t "greenhouse/security/motion/test_zone" -m '{"timestamp":"2024-01-01T20:00:00Z","location":"Test Zone","confidence":90,"sensorId":"test_sensor"}'
```

### Door Event
```bash
mosquitto_pub -h localhost -t "greenhouse/security/door/test_door" -m '{"id":"test_door","timestamp":"2024-01-01T20:00:00Z","location":"Test Door","status":"open"}'
```

### Window Event
```bash
mosquitto_pub -h localhost -t "greenhouse/security/window/test_window" -m '{"id":"test_window","timestamp":"2024-01-01T20:00:00Z","location":"Test Window","status":"open"}'
```

## Troubleshooting

### Events not showing up

1. **Check MQTT broker is running:**
   ```bash
   docker ps | grep mqtt
   ```

2. **Check backend logs:**
   ```bash
   docker logs haunted-greenhouse-backend-1
   ```

3. **Check InfluxDB is running:**
   ```bash
   docker ps | grep influxdb
   ```

4. **Verify MQTT connection:**
   - The test script should print "Connected to MQTT broker"
   - Backend logs should show "Subscribed to security MQTT topics"

### Events not persisting

1. **Check InfluxDB connection:**
   - Backend logs should not show InfluxDB connection errors
   - Verify InfluxDB credentials in `.env` file

2. **Check bucket exists:**
   - Log into InfluxDB UI: `http://localhost:8086`
   - Verify the `greenhouse` bucket exists
   - Check for `security_events` measurement

### API endpoint issues

1. **Test the API directly:**
   ```bash
   curl http://localhost:3001/api/security/logs
   ```

2. **Check with filters:**
   ```bash
   curl "http://localhost:3001/api/security/logs?eventType=motion_detected"
   ```

## Expected Behavior

- Events should appear in the UI within 1-2 seconds of being published
- Events are stored in InfluxDB with a 180-day retention policy
- The UI auto-refreshes the event log every 10 seconds
- Filters update the display immediately
- Off-hours events are highlighted with a red badge
