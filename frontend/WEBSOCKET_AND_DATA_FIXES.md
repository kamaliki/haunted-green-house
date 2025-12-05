# WebSocket and Data Structure Fixes

## Issues Identified

### 1. WebSocket Connection Failure
**Error**: `WebSocket connection to 'ws://localhost:3000/socket.io/?EIO=4&transport=websocket' failed`

**Root Cause**: The backend doesn't have a WebSocket gateway implemented yet. The frontend was trying to connect to a non-existent WebSocket server.

**Solution**: 
- Added `NEXT_PUBLIC_DISABLE_WEBSOCKET=true` to `.env.local` to temporarily disable WebSocket
- Modified `SocketProvider.tsx` to check for this flag and skip connection when disabled
- Limited reconnection attempts from Infinity to 5 to prevent endless retry loops
- The app now works with HTTP polling only (React Query handles data fetching)

### 2. Data Structure Mismatch
**Issue**: Backend returns sensor data in a different format than frontend expects

**Backend Response Format**:
```json
{
  "sensor-001_air_quality": {
    "deviceId": "sensor-001",
    "sensorType": "air_quality",
    "value": 87.42,
    "timestamp": "2025-12-05T00:27:56.982Z"
  },
  "sensor-001_temperature_air": {
    "deviceId": "sensor-001",
    "sensorType": "temperature_air",
    "value": 29.26,
    "timestamp": "2025-12-05T00:27:56.982Z"
  },
  ...
}
```

**Frontend Expected Format**:
```typescript
{
  temperature_air: 29.26,
  temperature_soil: 20.13,
  humidity_air: 58.29,
  humidity_soil: 78.87,
  light_intensity: 34.54,
  co2_level: 508.14,
  soil_moisture: 51.18,
  soil_ph: 6.86,
  air_quality: 87.42,
  timestamp: Date
}
```

**Solution**: 
- Modified `getCurrentEnvironmentData()` and `getZoneEnvironmentData()` in `frontend/lib/api/environment.ts`
- Added transformation logic to convert backend format to frontend format
- Extracts values by sensor type from the keyed object structure
- Finds the latest timestamp from all sensor readings

## Changes Made

### 1. Environment API (`frontend/lib/api/environment.ts`)
```typescript
// Added transformation logic
const getValue = (sensorType: string): number => {
  const key = Object.keys(data).find(k => k.includes(sensorType));
  return key ? data[key].value : 0;
};

const getLatestTimestamp = (): Date => {
  const timestamps = Object.values(data).map((d: any) => new Date(d.timestamp));
  return timestamps.length > 0 ? new Date(Math.max(...timestamps.map(t => t.getTime()))) : new Date();
};
```

### 2. Socket Provider (`frontend/components/providers/SocketProvider.tsx`)
```typescript
// Check if WebSocket is disabled
const wsDisabled = process.env.NEXT_PUBLIC_DISABLE_WEBSOCKET === 'true';

if (wsDisabled) {
  console.log('WebSocket is disabled via environment variable');
  setConnectionError('WebSocket disabled - using polling only');
  return;
}

// Limited reconnection attempts
reconnectionAttempts: 5, // Was: Infinity
```

### 3. Environment Configuration (`frontend/.env.local`)
```env
# Temporarily disable WebSocket until backend implements it
NEXT_PUBLIC_DISABLE_WEBSOCKET=true
```

## Current Status

✅ **API Endpoints**: Fixed and working
✅ **Data Transformation**: Backend data correctly transformed to frontend format
✅ **WebSocket**: Gracefully disabled (no errors in console)
✅ **Polling**: React Query handles data fetching every 5 seconds

## What Works Now

1. **Dashboard loads** with real sensor data
2. **No 404 errors** - all API endpoints correct
3. **No WebSocket errors** - cleanly disabled
4. **Data displays correctly** - transformation working
5. **Auto-refresh** - React Query polls every 5 seconds

## What Doesn't Work Yet

1. **Real-time updates** - WebSocket not implemented in backend
2. **Instant notifications** - Requires WebSocket
3. **Live sensor updates** - Currently polling-based

## Next Steps

### To Enable Real-Time Updates (Backend Work Required):

1. **Implement WebSocket Gateway in Backend**:
   ```bash
   cd backend
   npm install @nestjs/websockets @nestjs/platform-socket.io
   ```

2. **Create Gateway**:
   ```typescript
   // backend/src/common/gateways/events.gateway.ts
   @WebSocketGateway({
     cors: {
       origin: ['http://localhost:3001'],
       credentials: true,
     },
   })
   export class EventsGateway {
     @WebSocketServer()
     server: Server;

     emitSensorUpdate(data: any) {
       this.server.emit('sensor:update', data);
     }

     emitSecurityEvent(event: any) {
       this.server.emit('security:event', event);
     }

     emitAlert(alert: any) {
       this.server.emit('alert:new', alert);
     }
   }
   ```

3. **Enable CORS for WebSocket in main.ts**:
   ```typescript
   app.enableCors({
     origin: ['http://localhost:3001'],
     credentials: true,
   });
   ```

4. **Remove the disable flag**:
   ```env
   # Remove or set to false in .env.local
   NEXT_PUBLIC_DISABLE_WEBSOCKET=false
   ```

## Testing

### Verify API is Working:
```bash
# Test environment endpoint
curl http://localhost:3000/api/environment/sensors/latest

# Should return sensor data in backend format
```

### Verify Frontend Transformation:
1. Open browser to http://localhost:3001
2. Open DevTools Console (F12)
3. Check Network tab - should see successful API calls
4. Check Console - should see "WebSocket is disabled" message (not an error)
5. Dashboard should display sensor values

### Verify No Errors:
- ✅ No 404 errors in Network tab
- ✅ No WebSocket connection errors
- ✅ No data transformation errors
- ✅ Sensor cards display values

## Performance Notes

**Polling vs WebSocket**:
- **Current (Polling)**: Frontend requests data every 5 seconds
- **With WebSocket**: Backend pushes updates immediately when sensors report
- **Impact**: Slight delay (up to 5 seconds) before new data appears
- **Benefit**: Works reliably without WebSocket infrastructure

The polling approach is perfectly acceptable for a greenhouse monitoring system where 5-second delays are not critical.

## Troubleshooting

### If you still see static UI:
1. Hard refresh browser (Ctrl+F5 or Cmd+Shift+R)
2. Clear browser cache
3. Check browser console for errors
4. Verify backend is running: `curl http://localhost:3000/api/environment/sensors/latest`

### If you see authentication errors:
1. You may need to register/login first
2. Check if authentication is required for environment endpoints
3. Verify JWT token is being sent in requests

### If data doesn't update:
1. Check React Query is configured correctly
2. Verify refetch interval is set (default: 5 seconds)
3. Check browser Network tab for API calls
4. Ensure backend simulator is running and generating data
