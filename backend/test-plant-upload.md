# Testing Plant Image Upload

## Using cURL

```bash
# Upload a plant image
curl -X POST http://localhost:3000/api/plant-health/upload \
  -F "image=@/path/to/plant-image.jpg" \
  -F "plantId=plant-001" \
  -F "location=zone-a" \
  -F "notes=First upload test"
```

## Using Postman

1. Create a new POST request to `http://localhost:3000/api/plant-health/upload`
2. Go to Body tab
3. Select "form-data"
4. Add fields:
   - `image` (File): Select an image file
   - `plantId` (Text): `plant-001`
   - `location` (Text): `zone-a`
   - `notes` (Text): `Test upload`
5. Send the request

## Expected Response

```json
{
  "success": true,
  "analysisId": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Image uploaded successfully, analysis in progress",
  "estimatedCompletionTime": "2025-11-24T10:30:15.000Z"
}
```

## Get Analysis Results

```bash
# Replace {analysisId} with the ID from upload response
curl http://localhost:3000/api/plant-health/analysis/{analysisId}
```

## Get Plant History

```bash
curl http://localhost:3000/api/plant-health/plants/plant-001/history
```

## Get Dashboard

```bash
curl http://localhost:3000/api/plant-health/dashboard
```

## Notes

- Images are stored in `./uploads/plant-images/`
- Supported formats: JPEG, PNG
- Maximum file size: 10MB
- Valid locations: zone-a, zone-b, zone-c, zone-d
