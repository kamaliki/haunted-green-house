# Security Module Testing Guide

This guide provides instructions for testing the Security Module functionality.

## Prerequisites

1. Backend server running: `npm run start:dev`
2. MQTT broker running (mosquitto)
3. InfluxDB running

## Test Scenarios

### 1. Motion Detection Alert (Off-Hours Disabled)

**Scenario:** Motion is detected and an alert is triggered immediately.

**Steps:**

1. Ensure off-hours monitoring is disabled:
```bash
curl -X POST http://localhost:3000/security/off-hours-config \
  -H "Content-Type: application/json" \
  -d '{
    "enabled": false,
    "startHour": 0,
    "endHour": 0
  }'
```

2. Simulate motion detection:
```bash
mosquitto_pub -h localhost -t greenhouse/security/motion/entrance -m '{
  "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
  "location": "entrance",
  "confidence": 95,
  "sensorId": "motion_001"
}'
```

3. Check the backend logs for:
   - Motion detection log message
   - Security event logged to InfluxDB
   - Security alert sent

4. Query security logs:
```bash
curl "http://localhost:3000/security/logs?eventType=motion_detected"
```

**Expected Result:**
- Alert is triggered immediately
- Event is logged in InfluxDB
- Alert appears in logs with confidence score

---

### 2. Motion Detection with Off-Hours Monitoring

**Scenario:** Motion detection only triggers alerts during configured off-hours.

**Steps:**

1. Configure off-hours monitoring (6 PM to 6 AM):
```bash
curl -X POST http://localhost:3000/security/off-hours-config \
  -H "Content-Type: application/json" \
  -d '{
    "enabled": true,
    "startHour": 18,
    "endHour": 6
  }'
```

2. Verify configuration:
```bash
curl http://localhost:3000/security/off-hours-config
```

3. Test during off-hours (e.g., 10 PM):
```bash
mosquitto_pub -h localhost -t greenhouse/security/motion/greenhouse_main -m '{
  "timestamp": "'$(date -u +%Y-%m-%dT22:00:00Z)'",
  "location": "greenhouse_main",
  "confidence": 90,
  "sensorId": "motion_002"
}'
```

4. Test during business hours (e.g., 2 PM):
```bash
mosquitto_pub -h localhost -t greenhouse/security/motion/greenhouse_main -m '{
  "timestamp": "'$(date -u +%Y-%m-%dT14:00:00Z)'",
  "location": "greenhouse_main",
  "confidence": 90,
  "sensorId": "motion_002"
}'
```

**Expected Result:**
- Alert triggered for 10 PM motion (off-hours)
- No alert for 2 PM motion (business hours)
- Both events logged in InfluxDB

---

### 3. Door Status Monitoring

**Scenario:** Track door open/close events.

**Steps:**

1. Simulate door opening:
```bash
mosquitto_pub -h localhost -t greenhouse/security/door/main -m '{
  "id": "door_001",
  "location": "main_entrance",
  "status": "open",
  "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
}'
```

2. Check current door status:
```bash
curl http://localhost:3000/security/access-points
```

3. Simulate door closing:
```bash
mosquitto_pub -h localhost -t greenhouse/security/door/main -m '{
  "id": "door_001",
  "location": "main_entrance",
  "status": "closed",
  "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
}'
```

4. Verify status update:
```bash
curl http://localhost:3000/security/access-points
```

5. Query door events:
```bash
curl "http://localhost:3000/security/logs?eventType=door_opened"
curl "http://localhost:3000/security/logs?eventType=door_closed"
```

**Expected Result:**
- Door status updates in real-time
- Both open and close events logged
- Status reflects most recent update

---

### 4. Window Status Monitoring

**Scenario:** Track window open/close events.

**Steps:**

1. Simulate window opening:
```bash
mosquitto_pub -h localhost -t greenhouse/security/window/north -m '{
  "id": "window_001",
  "location": "north_wall",
  "status": "open",
  "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
}'
```

2. Check window status:
```bash
curl http://localhost:3000/security/access-points
```

3. Simulate window closing:
```bash
mosquitto_pub -h localhost -t greenhouse/security/window/north -m '{
  "id": "window_001",
  "location": "north_wall",
  "status": "closed",
  "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
}'
```

**Expected Result:**
- Window status updates correctly
- Events logged with proper timestamps

---

### 5. Security Log Queries with Filters

**Scenario:** Query security logs with various filters.

**Steps:**

1. Query all events:
```bash
curl "http://localhost:3000/security/logs"
```

2. Query by event type:
```bash
curl "http://localhost:3000/security/logs?eventType=motion_detected"
```

3. Query by location:
```bash
curl "http://localhost:3000/security/logs?location=entrance"
```

4. Query by date range:
```bash
curl "http://localhost:3000/security/logs?startDate=2024-01-01T00:00:00Z&endDate=2024-12-31T23:59:59Z"
```

5. Query with multiple filters:
```bash
curl "http://localhost:3000/security/logs?eventType=motion_detected&location=entrance&startDate=2024-01-01T00:00:00Z"
```

**Expected Result:**
- Results match filter criteria
- Events returned in reverse chronological order
- Empty array if no matches

---

### 6. Multiple Sensors Simultaneously

**Scenario:** Test system handling multiple security events at once.

**Steps:**

1. Trigger multiple motion sensors:
```bash
mosquitto_pub -h localhost -t greenhouse/security/motion/entrance -m '{"timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'", "location": "entrance", "confidence": 95, "sensorId": "motion_001"}'

mosquitto_pub -h localhost -t greenhouse/security/motion/back_door -m '{"timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'", "location": "back_door", "confidence": 88, "sensorId": "motion_002"}'

mosquitto_pub -h localhost -t greenhouse/security/motion/greenhouse_main -m '{"timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'", "location": "greenhouse_main", "confidence": 92, "sensorId": "motion_003"}'
```

2. Open multiple access points:
```bash
mosquitto_pub -h localhost -t greenhouse/security/door/main -m '{"id": "door_001", "location": "main_entrance", "status": "open", "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}'

mosquitto_pub -h localhost -t greenhouse/security/window/north -m '{"id": "window_001", "location": "north_wall", "status": "open", "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}'

mosquitto_pub -h localhost -t greenhouse/security/window/south -m '{"id": "window_002", "location": "south_wall", "status": "open", "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}'
```

3. Query all access points:
```bash
curl http://localhost:3000/security/access-points
```

4. Query recent events:
```bash
curl "http://localhost:3000/security/logs"
```

**Expected Result:**
- All events processed correctly
- No data loss or corruption
- All access points show correct status

---

## Verification Checklist

- [ ] Motion detection triggers alerts
- [ ] Off-hours configuration works correctly
- [ ] Door status updates in real-time
- [ ] Window status updates in real-time
- [ ] Security events logged to InfluxDB
- [ ] Log queries return correct results
- [ ] Filters work as expected
- [ ] Events sorted in reverse chronological order
- [ ] Multiple simultaneous events handled correctly
- [ ] Alerts sent through configured channels

## Troubleshooting

### No alerts received
- Check AlertService configuration
- Verify email recipients configured
- Check backend logs for errors

### MQTT messages not received
- Verify MQTT broker is running
- Check MQTT connection in backend logs
- Verify topic names match expected format

### Events not appearing in logs
- Check InfluxDB connection
- Verify bucket and org configuration
- Check for write errors in backend logs

### Off-hours monitoring not working
- Verify configuration is set correctly
- Check system time matches expected timezone
- Review shouldTriggerMotionAlert logic

## Windows PowerShell Commands

For Windows users, use these PowerShell equivalents:

**Configure off-hours:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/security/off-hours-config" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"enabled": true, "startHour": 18, "endHour": 6}'
```

**Query logs:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/security/logs?eventType=motion_detected"
```

**Get access points:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/security/access-points"
```
