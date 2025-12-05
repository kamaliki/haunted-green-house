# API Endpoint Fixes

## Issue
The frontend was calling incorrect API endpoints that didn't match the backend controller routes, resulting in 404 errors and static UI.

## Backend API Structure

Based on the backend controllers, the correct API structure is:

### With `/api` prefix:
- `/api/environment/*` - Environment/sensor data
- `/api/irrigation/*` - Irrigation control
- `/api/plant-health/*` - Plant health analysis
- `/api/alerts/*` - Alert management

### Without `/api` prefix:
- `/auth/*` - Authentication
- `/greenhouse/*` - Greenhouse setup
- `/security/*` - Security monitoring
- `/analytics/*` - Analytics and predictions
- `/weather/*` - Weather data (if implemented)

## Fixed Endpoints

### Environment API (`frontend/lib/api/environment.ts`)
- ❌ `/environment/current` → ✅ `/api/environment/sensors/latest`
- ❌ `/environment/historical` → ✅ `/api/environment/sensors/history`
- ❌ `/environment/sensor/{metric}` → ✅ `/api/environment/sensors/latest?sensorType={metric}`
- ✅ `/api/environment/sensors/latest` (zone-specific) - Already correct

### Irrigation API (`frontend/lib/api/irrigation.ts`)
- ❌ `/irrigation/status` → ✅ `/api/irrigation/status`
- ❌ `/irrigation/start` → ✅ `/api/irrigation/start`
- ❌ `/irrigation/stop` → ✅ `/api/irrigation/stop`
- Fixed parameter names: `zoneId` → `zone`

### Alerts API (`frontend/lib/api/alerts.ts`)
- ❌ `/alerts` → ✅ `/api/alerts`
- ❌ `/alerts/{id}` → ✅ `/api/alerts/{id}`
- ❌ `/alerts/{id}/acknowledge` → ✅ `/api/alerts/{id}/acknowledge`
- ❌ `/alerts/acknowledge-all` → ✅ `/api/alerts/acknowledge-all`

### Already Correct
- ✅ `/auth/*` - Authentication endpoints
- ✅ `/greenhouse/*` - Greenhouse endpoints
- ✅ `/security/*` - Security endpoints
- ✅ `/analytics/*` - Analytics endpoints
- ✅ `/api/plant-health/*` - Plant health endpoints

## Parameter Name Fixes

### Irrigation
- Changed `zoneId` to `zone` in request bodies
- Changed `durationSeconds` parameter name

### Environment
- Changed `metrics` to `sensorType` for history queries
- Changed `zoneId` to `deviceId` for zone-specific queries

## Testing

After these fixes, the frontend should now:
1. Successfully fetch sensor data from `/api/environment/sensors/latest`
2. Load historical data from `/api/environment/sensors/history`
3. Control irrigation via `/api/irrigation/start` and `/api/irrigation/stop`
4. Display alerts from `/api/alerts`
5. Show proper error messages instead of 404s

## Next Steps

1. Refresh the browser (Ctrl+F5 or Cmd+Shift+R)
2. Check browser console for any remaining 404 errors
3. Verify WebSocket connection is working
4. Test each feature to ensure data loads correctly

## Verification Commands

```bash
# Test environment endpoint
curl http://localhost:3000/api/environment/sensors/latest

# Test irrigation status
curl http://localhost:3000/api/irrigation/status?zone=zone-1

# Test alerts
curl http://localhost:3000/api/alerts

# Test authentication
curl http://localhost:3000/auth/profile -H "Authorization: Bearer YOUR_TOKEN"
```
