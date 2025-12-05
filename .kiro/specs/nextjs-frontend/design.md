# Design Document

## Overview

The Haunted Greenhouse Web Frontend is a Next.js 14+ application using the App Router, React Server Components, and TypeScript. The application features a retro game aesthetic with pixel art elements, vibrant colors, and smooth modern animations. It connects to the existing NestJS backend via REST API and WebSocket for real-time updates. The design emphasizes responsive layouts, optimistic UI updates, and excellent user experience across all device sizes.

## Architecture

### Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + CSS Modules for retro effects
- **State Management**: React Context + Zustand for global state
- **Data Fetching**: React Query (TanStack Query) for server state
- **Real-time**: Socket.io client for WebSocket connections
- **Charts**: Recharts with custom retro styling
- **Forms**: React Hook Form + Zod validation
- **Authentication**: NextAuth.js
- **Icons**: Custom pixel art icons + Lucide React as fallback
- **Animations**: Framer Motion

### Application Structure

```
frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                 # Zone management (main landing)
│   │   ├── zones/
│   │   │   └── [zoneId]/
│   │   │       ├── page.tsx         # Zone dashboard
│   │   │       ├── environment/
│   │   │       │   └── page.tsx     # Historical charts
│   │   │       ├── irrigation/
│   │   │       │   └── page.tsx     # Irrigation control
│   │   │       ├── plant-health/
│   │   │       │   ├── page.tsx     # Image upload
│   │   │       │   └── growth/
│   │   │       │       └── page.tsx # Growth tracking
│   │   │       └── analytics/
│   │   │           ├── page.tsx     # Predictions
│   │   │           └── recommendations/
│   │   │               └── page.tsx # Optimization
│   │   ├── security/
│   │   │   ├── page.tsx             # Security monitoring (all zones)
│   │   │   └── settings/
│   │   │       └── page.tsx         # Off-hours config
│   │   └── alerts/
│   │       └── page.tsx             # Alert management (all zones)
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                          # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── PixelBorder.tsx
│   │   └── RetroChart.tsx
│   ├── zones/
│   │   ├── ZoneCard.tsx             # Zone summary card
│   │   ├── ZoneGrid.tsx             # Grid of zone cards
│   │   └── ZoneSelector.tsx         # Zone navigation
│   ├── dashboard/
│   │   ├── SensorCard.tsx
│   │   ├── StatusIndicator.tsx
│   │   └── WeatherWidget.tsx
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx              # Zone-aware navigation
│   │   └── Footer.tsx
│   └── providers/
│       ├── QueryProvider.tsx
│       ├── SocketProvider.tsx
│       ├── ZoneProvider.tsx         # Zone context
│       └── ThemeProvider.tsx
├── lib/
│   ├── api/
│   │   ├── client.ts                # Axios instance
│   │   ├── zones.ts                 # Zone management API
│   │   ├── environment.ts           # Zone-specific environment
│   │   ├── irrigation.ts            # Zone-specific irrigation
│   │   ├── plant-health.ts          # Zone-specific plant health
│   │   ├── analytics.ts             # Zone-specific analytics
│   │   └── security.ts              # Cross-zone security
│   ├── hooks/
│   │   ├── useRealtime.ts
│   │   ├── useSensorData.ts         # Zone-aware sensor data
│   │   ├── useZone.ts               # Current zone context
│   │   ├── useZones.ts              # All zones list
│   │   └── useAuth.ts
│   ├── store/
│   │   ├── alertStore.ts
│   │   ├── zoneStore.ts             # Zone state management
│   │   └── uiStore.ts
│   ├── utils/
│   │   ├── formatters.ts
│   │   └── validators.ts
│   └── constants.ts
├── types/
│   ├── api.ts
│   ├── sensor.ts
│   ├── zone.ts                      # Zone types
│   └── index.ts
└── public/
    ├── sounds/                      # Optional retro sound effects
    └── images/
        └── pixel-art/
```

## Components and Interfaces

### Core Components

#### 1. Zone Management Interface
- **Zone Grid**: Grid of zone cards showing summary status
- **Zone Card**: Displays zone name, key metrics (temp, humidity), health status, alert indicators
- **Quick Actions**: Navigate to zone dashboard, view alerts
- **Top Bar**: User info, global notifications, connection status

#### 2. Zone Dashboard Layout (Zone-Specific)
- **Sidebar Navigation**: Zone-aware navigation with zone selector, pixel art icons
- **Top Bar**: Current zone name, back to zones button, zone-specific notifications
- **Main Content Area**: Grid layout for sensor cards for the selected zone
- **Footer**: Last update timestamp for zone, zone status

#### 3. Zone Card Component
```typescript
interface ZoneCardProps {
  zone: Zone;
  onSelect: (zoneId: string) => void;
}

interface Zone {
  id: string;
  name: string;
  temperature: number;
  humidity: number;
  healthStatus: 'optimal' | 'warning' | 'critical';
  activeAlerts: number;
  lastUpdate: Date;
}
```

Features:
- Pixel border with glow based on health status
- Animated hover effects
- Alert badge indicator
- Click to navigate to zone dashboard

#### 4. Sensor Card Component (Zone-Specific)
```typescript
interface SensorCardProps {
  zoneId: string;
  metric: string;
  value: number;
  unit: string;
  threshold?: { min: number; max: number };
  trend?: 'up' | 'down' | 'stable';
  lastUpdate: Date;
}
```

Features:
- Pixel border with glow effect when threshold exceeded
- Animated value transitions
- Color-coded status (green/yellow/red)
- Retro-style gauge or bar visualization

#### 5. Historical Chart Component (Zone-Specific)
```typescript
interface ChartProps {
  zoneId: string;
  data: TimeSeriesData[];
  metrics: string[];
  timeRange: '1h' | '6h' | '24h' | '7d' | '30d';
  onRangeChange: (range: string) => void;
}
```

Features:
- Recharts with custom retro styling
- Pixelated line/area charts
- Interactive tooltips with pixel borders
- Time range selector with retro buttons
- Zone identifier in chart title

#### 6. Irrigation Control Panel (Zone-Specific)
```typescript
interface IrrigationControlProps {
  zoneId: string;
  status: 'active' | 'inactive';
  reservoirLevel: number;
  waterFlow: number;
  onStart: () => Promise<void>;
  onStop: () => Promise<void>;
}
```

Features:
- Large pixel art start/stop buttons
- Animated water flow indicator
- Reservoir level with retro progress bar
- Confirmation modal for actions
- Zone name displayed prominently

#### 7. Image Upload Component (Zone-Specific)
```typescript
interface ImageUploadProps {
  zoneId: string;
  onUpload: (file: File, zoneId: string) => Promise<AnalysisResult>;
  maxSize: number;
  acceptedFormats: string[];
}
```

Features:
- Drag-and-drop zone with pixel border
- Image preview with retro frame
- Upload progress with pixel art animation
- Results display with confidence bars
- Zone identifier included in upload

## Data Models

### TypeScript Interfaces

```typescript
// Zone
interface Zone {
  id: string;
  name: string;
  description?: string;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Zone Summary (for zone management interface)
interface ZoneSummary {
  id: string;
  name: string;
  temperature: number;
  humidity: number;
  healthStatus: 'optimal' | 'warning' | 'critical';
  activeAlerts: number;
  lastUpdate: Date;
}

// Sensor Data (Zone-Specific)
interface SensorReading {
  zoneId: string;
  metric: string;
  value: number;
  unit: string;
  timestamp: Date;
  location?: string;
}

// Environment Data (Zone-Specific)
interface EnvironmentData {
  zoneId: string;
  temperature_air: number;
  temperature_soil: number;
  humidity_air: number;
  humidity_soil: number;
  light_intensity: number;
  co2_level: number;
  soil_moisture: number;
  soil_ph: number;
  air_quality: number;
  timestamp: Date;
}

// Irrigation Status (Zone-Specific)
interface IrrigationStatus {
  zoneId: string;
  active: boolean;
  waterFlow: number;
  reservoirLevel: number;
  lastStarted?: Date;
  duration?: number;
}

// Plant Health Analysis (Zone-Specific)
interface AnalysisResult {
  zoneId: string;
  imageId: string;
  diseases: Disease[];
  healthScore: number;
  recommendations: string[];
  timestamp: Date;
}

interface Disease {
  name: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high';
  treatment: string;
}

// Growth Metrics (Zone-Specific)
interface GrowthMetrics {
  zoneId: string;
  plantId: string;
  height: number;
  leafCount: number;
  healthScore: number;
  timestamp: Date;
}

// Predictions (Zone-Specific)
interface Prediction {
  zoneId: string;
  metric: string;
  predictions: PredictionPoint[];
  confidenceInterval: { lower: number; upper: number }[];
  generatedAt: Date;
}

interface PredictionPoint {
  timestamp: Date;
  value: number;
}

// Optimization Recommendation (Zone-Specific)
interface Recommendation {
  id: string;
  zoneId: string;
  category: 'environment' | 'irrigation' | 'energy';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  expectedImpact: string;
  actionItems: string[];
  timestamp: Date;
}

// Security Event (Cross-Zone)
interface SecurityEvent {
  id: string;
  zoneId?: string;  // Optional: some events may be zone-specific
  type: 'motion_detected' | 'door_opened' | 'door_closed' | 'window_opened' | 'window_closed';
  timestamp: Date;
  location: string;
  details: Record<string, any>;
}

// Access Point Status
interface AccessPointStatus {
  id: string;
  type: 'door' | 'window';
  location: string;
  status: 'open' | 'closed';
  lastChanged: Date;
}

// Alert (Zone-Aware)
interface Alert {
  id: string;
  zoneId?: string;  // Optional: some alerts may be zone-specific
  zoneName?: string;
  type: 'environmental' | 'security' | 'predictive' | 'system';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  metadata?: Record<string, any>;
}

// Off-Hours Config
interface OffHoursConfig {
  enabled: boolean;
  startHour: number;
  endHour: number;
}

// Weather Data
interface WeatherData {
  temperature: number;
  humidity: number;
  conditions: string;
  forecast: ForecastDay[];
  lastUpdate: Date;
}

interface ForecastDay {
  date: Date;
  tempHigh: number;
  tempLow: number;
  conditions: string;
  precipitation: number;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Zone management display
*For any* configured zone in the system, the zone management interface should display a zone card with current status
**Validates: Requirements 1.1, 1.2**

### Property 2: Real-time data freshness per zone
*For any* sensor reading for a specific zone displayed on the zone dashboard, if the backend sends an update for that zone, then the UI should reflect the new value within 2 seconds
**Validates: Requirements 2.2**

### Property 3: Threshold visual indication per zone
*For any* sensor metric with defined thresholds in a specific zone, when the current value exceeds the threshold, the UI should display a visual warning indicator for that zone
**Validates: Requirements 2.3**

### Property 4: Zone-specific irrigation command acknowledgment
*For any* irrigation start or stop command for a specific zone, when the command is sent to the backend, the UI should display a loading state until receiving confirmation for that zone
**Validates: Requirements 4.1, 4.3**

### Property 5: Zone-specific reservoir level safety
*For any* irrigation control interface for a specific zone, when the reservoir level for that zone is below 10%, the start button should be disabled
**Validates: Requirements 4.5**

### Property 6: Zone-specific image upload validation
*For any* file selected for upload for a specific zone, the system should validate that the file type is JPEG or PNG before attempting upload
**Validates: Requirements 5.1**

### Property 7: Zone-specific chart data completeness
*For any* historical chart for a specific zone, all data points returned from the API for that zone should be rendered on the chart
**Validates: Requirements 3.1, 3.2**

### Property 8: Security event real-time update with zone info
*For any* security event (motion, door, window), when received via WebSocket, the security page should update within 1 second and display zone information if applicable
**Validates: Requirements 9.2**

### Property 9: Form validation feedback
*For any* form submission, when validation fails, all invalid fields should be highlighted with error messages
**Validates: Requirements 15.5**

### Property 10: Authentication redirect to zone management
*For any* protected route, when accessed by an unauthenticated user, the system should redirect to the login page, and after successful authentication, redirect to the zone management interface
**Validates: Requirements 13.1, 13.2**

### Property 11: Responsive layout adaptation
*For any* viewport width, the layout should adapt to display content appropriately (multi-column for desktop, single-column for mobile) for both zone management and zone-specific pages
**Validates: Requirements 12.1, 12.2, 12.3**

### Property 12: Zone-specific cache invalidation on manual refresh
*For any* cached data for a specific zone, when the user triggers a manual refresh, the system should bypass the cache and fetch fresh data for that zone
**Validates: Requirements 14.5**

### Property 13: Loading state visibility
*For any* asynchronous operation, while data is loading, the UI should display a loading indicator
**Validates: Requirements 15.1**

### Property 14: Error message display
*For any* failed API request, the system should display a user-friendly error message
**Validates: Requirements 15.2**

### Property 15: Zone-aware alert notification display
*For any* alert triggered by the backend, the system should display a notification in the UI with zone information if the alert is zone-specific
**Validates: Requirements 11.1**

### Property 16: Zone-specific prediction confidence interval display
*For any* prediction displayed for a specific zone, the system should include confidence intervals in the visualization
**Validates: Requirements 7.2**

## Error Handling

### API Error Handling
- **Network Errors**: Display offline indicator, queue requests for retry
- **4xx Errors**: Show validation errors or authentication prompts
- **5xx Errors**: Display generic error with retry button
- **Timeout**: Show timeout message with manual retry option

### WebSocket Error Handling
- **Connection Lost**: Display connection status indicator, attempt reconnection with exponential backoff
- **Message Parse Errors**: Log error, continue processing other messages
- **Authentication Failure**: Redirect to login

### Client-Side Error Handling
- **Form Validation**: Real-time validation with error messages
- **File Upload**: Size and type validation before upload
- **Browser Compatibility**: Graceful degradation for older browsers

## Testing Strategy

### Unit Testing
- **Framework**: Jest + React Testing Library
- **Coverage**: All utility functions, formatters, validators
- **Component Testing**: Isolated component behavior
- **Hook Testing**: Custom hooks with mock data

### Integration Testing
- **API Integration**: Mock API responses, test data flow
- **WebSocket Integration**: Mock socket events, test real-time updates
- **Form Submission**: End-to-end form workflows
- **Navigation**: Route transitions and authentication guards

### Property-Based Testing
- **Framework**: fast-check
- **Test Count**: Minimum 100 iterations per property
- **Property Tests**: Each correctness property implemented as a PBT
- **Tagging**: Each test tagged with `Feature: nextjs-frontend, Property {number}: {description}`

### E2E Testing
- **Framework**: Playwright
- **Scenarios**: Critical user journeys (login, view dashboard, control irrigation, upload image)
- **Visual Regression**: Screenshot comparison for retro UI consistency

## Retro Game Aesthetic Design System - Spooky/Haunted Theme

### Color Palette
```css
:root {
  /* Primary Colors - Spooky Theme */
  --ghost-green: #39ff14;        /* Neon ghost green */
  --toxic-purple: #9d4edd;       /* Toxic/poison purple */
  --blood-red: #ff006e;          /* Blood red accent */
  --pumpkin-orange: #fb5607;     /* Halloween orange */
  --bone-white: #f8f9fa;         /* Bone white */
  --slime-green: #06ffa5;        /* Radioactive slime */
  
  /* Background - Dark and Moody */
  --bg-darkest: #0a0a0f;         /* Almost black */
  --bg-dark: #1a1a2e;            /* Deep purple-black */
  --bg-medium: #2d1b4e;          /* Dark purple */
  --bg-fog: rgba(157, 78, 221, 0.1); /* Foggy overlay */
  
  /* Text */
  --text-primary: #f8f9fa;       /* Bone white */
  --text-secondary: #adb5bd;     /* Ghostly gray */
  --text-glow: #39ff14;          /* Glowing green */
  
  /* Borders & Effects */
  --border-color: #39ff14;       /* Ghost green */
  --border-glow: rgba(57, 255, 20, 0.6);
  --shadow-spooky: rgba(157, 78, 221, 0.5);
}
```

### Typography
- **Primary Font**: "Creepster" or "Nosifer" (Google Fonts) for spooky headings
- **Secondary Font**: "VT323" or "Press Start 2P" for retro game text
- **Body Font**: "Courier Prime" for readable content
- **Fallback**: Monospace system fonts

### Visual Effects - Haunted Theme
- **Pixel Borders**: 4px solid borders with skull/ghost corner decorations
- **Glow Effects**: Eerie green/purple glow for active elements
- **Fog Overlay**: Subtle animated fog/mist effect on backgrounds
- **Scanlines**: CRT monitor effect with occasional "glitch" animation
- **Animations**: 
  - Floating/hovering animations for cards (ghostly effect)
  - Pulse animations for alerts (heartbeat-like)
  - Flicker effects for critical warnings
  - Smooth transitions (200-300ms) with easing
- **Hover States**: 
  - Scale transform + intense glow
  - Color shift to more vibrant spooky colors
  - Optional: Brief "ghost trail" effect
- **Particle Effects**: 
  - Floating ghost particles in background
  - Dripping slime effect on certain elements
  - Cobweb decorations in corners

### Spooky UI Elements
- **Icons**: Pixel art ghosts, skulls, bats, spiders, pumpkins
- **Cursors**: Custom ghost cursor or spooky pointer
- **Loading States**: Spinning ghost, floating skull, or dripping slime
- **Alerts**: Tombstone-shaped notifications
- **Progress Bars**: Filled with toxic slime or blood
- **Graphs**: Ghostly trails for line charts

### Component Styling Patterns
```tsx
// Example: Spooky Retro Button
<button className="
  px-6 py-3
  bg-bg-dark
  text-ghost-green
  font-bold
  border-4 border-ghost-green
  shadow-[0_0_15px_rgba(57,255,20,0.6),inset_0_0_10px_rgba(157,78,221,0.3)]
  hover:scale-105
  hover:shadow-[0_0_30px_rgba(57,255,20,0.9),0_0_50px_rgba(157,78,221,0.5)]
  hover:text-slime-green
  active:scale-95
  transition-all duration-200
  pixel-corners
  relative
  before:content-['💀']
  before:absolute
  before:left-2
  before:opacity-70
">
  START HAUNTING
</button>

// Example: Haunted Card
<div className="
  bg-gradient-to-b from-bg-dark to-bg-medium
  border-4 border-toxic-purple
  shadow-[0_0_20px_rgba(157,78,221,0.5)]
  rounded-lg
  p-6
  relative
  overflow-hidden
  hover:animate-float
  before:content-['']
  before:absolute
  before:inset-0
  before:bg-fog
  before:animate-fog
">
  {/* Cobweb decoration */}
  <div className="absolute top-0 right-0 text-2xl opacity-30">🕸️</div>
  {children}
</div>
```

## Performance Optimization

### Code Splitting
- Route-based code splitting (automatic with App Router)
- Dynamic imports for heavy components (charts, image upload)
- Lazy loading for below-the-fold content

### Data Fetching
- Server Components for initial data
- React Query for client-side caching
- Optimistic updates for user actions
- Debounced API calls for search/filter

### Asset Optimization
- Next.js Image component for automatic optimization
- SVG for pixel art icons
- Minimal external dependencies
- Tree-shaking for unused code

### Real-time Optimization
- WebSocket connection pooling
- Message batching for high-frequency updates
- Selective re-rendering with React.memo
- Virtual scrolling for long lists (security logs)

## Security Considerations

### Authentication
- NextAuth.js with JWT tokens
- HTTP-only cookies for session management
- CSRF protection
- Secure password requirements

### API Communication
- HTTPS only in production
- API key/token in Authorization header
- Request rate limiting (client-side)
- Input sanitization

### Data Protection
- No sensitive data in localStorage
- XSS prevention (React's built-in escaping)
- Content Security Policy headers
- Secure WebSocket connections (WSS)

## Deployment

### Build Configuration
- **Environment Variables**: API URL, WebSocket URL, Auth secrets
- **Build Command**: `npm run build`
- **Output**: Static export or Node.js server
- **CDN**: Static assets served from CDN

### Hosting Options
- **Vercel**: Recommended for Next.js (automatic deployments)
- **Netlify**: Alternative with similar features
- **Docker**: Self-hosted with Dockerfile
- **Traditional**: Node.js server with PM2

### Environment Setup
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:3000
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-secret-key
```
