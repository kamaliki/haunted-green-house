# Implementation Plan

- [x] 1. Initialize Next.js project with TypeScript and core dependencies





  - Create Next.js 14+ project with App Router and TypeScript
  - Install core dependencies: Tailwind CSS, React Query, Zustand, Socket.io client, Framer Motion
  - Install UI dependencies: Recharts, React Hook Form, Zod, NextAuth.js
  - Install dev dependencies: Jest, React Testing Library, Playwright, fast-check
  - Configure TypeScript with strict mode
  - Set up Tailwind CSS with custom spooky theme configuration
  - Create basic folder structure (app, components, lib, types, public)
  - _Requirements: 16.1, 16.2_

- [x] 2. Set up spooky design system and global styles





  - Create globals.css with spooky color palette CSS variables
  - Add Google Fonts: Creepster, VT323, Press Start 2P, Courier Prime
  - Create Tailwind config with custom colors, animations, and utilities
  - Implement pixel border utility classes
  - Create glow effect utility classes
  - Add fog overlay animation keyframes
  - Create floating/hovering animation keyframes
  - Add custom cursor styles (optional ghost cursor)
  - _Requirements: 16.1, 16.2, 16.3, 16.4_

- [x] 3. Create base UI components with spooky styling





  - Implement PixelBorder component with corner decorations
  - Create Button component with ghost green glow and hover effects
  - Build Card component with fog overlay and floating animation
  - Implement Input component with spooky focus states
  - Create Modal component with tombstone-style design
  - Build LoadingSpinner with spinning ghost or floating skull
  - Create StatusIndicator with color-coded glow effects
  - Add pixel art icon components (ghost, skull, bat, spider, cobweb)
  - _Requirements: 16.1, 16.2, 16.3_

- [x] 3.1 Write unit tests for UI components


  - Test Button component rendering and interactions
  - Test Card component with different props
  - Test Input component validation states
  - Test Modal open/close behavior
  - Test LoadingSpinner rendering

- [x] 4. Set up API client and data fetching infrastructure





  - Create Axios instance with base URL and interceptors
  - Implement API client functions for zones endpoints (list zones, get zone details)
  - Implement API client functions for zone-specific environment endpoints
  - Implement API client functions for zone-specific irrigation endpoints
  - Implement API client functions for zone-specific plant-health endpoints
  - Implement API client functions for zone-specific analytics endpoints
  - Implement API client functions for security endpoints (cross-zone)
  - Set up React Query provider with default options
  - Create custom hooks: useZones, useZone, useSensorData (zone-aware), useIrrigationStatus (zone-aware), useSecurityEvents
  - Implement error handling and retry logic
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 6.1, 7.1, 8.1, 9.1_

- [x] 4.1 Write unit tests for API client functions


  - Test API client with mock responses
  - Test error handling for network failures
  - Test retry logic
  - Test custom hooks with React Query

- [x] 5. Implement WebSocket connection for real-time updates




  - Create SocketProvider component with Socket.io client
  - Implement connection management with reconnection logic
  - Create useRealtime hook for subscribing to zone-specific sensor updates
  - Handle zone-specific sensor data events and update React Query cache
  - Handle security events with zone information and trigger UI notifications
  - Implement connection status indicator
  - Add exponential backoff for reconnection attempts
  - _Requirements: 1.5, 2.2, 9.2_

- [x] 5.1 Write property test for zone management display
  - **Property 1: Zone management display**
  - **Validates: Requirements 1.1, 1.2**

- [x] 5.2 Write property test for real-time data freshness per zone
  - **Property 2: Real-time data freshness per zone**
  - **Validates: Requirements 2.2**

- [ ] 6. Set up authentication with NextAuth.js



  - Configure NextAuth.js with credentials provider
  - Create login page with spooky styling
  - Implement authentication API route
  - Create useAuth hook for accessing session
  - Implement protected route middleware
  - Add logout functionality
  - Create authentication context provider
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_
 

- [x] 6.1 Write property test for authentication redirect



  - **Property 9: Authentication redirect**
  - **Validates: Requirements 12.1**

- [x] 7. Create dashboard layout with navigation


  - Implement root layout with providers (Query, Socket, Auth, Theme, Zone)
  - Create Navbar component with user info and notifications bell
  - Build Sidebar component with zone selector and pixel art navigation icons
  - Implement responsive sidebar (collapsible on mobile)
  - Create Footer component with last update timestamp
  - Add connection status indicator in header
  - Implement page transitions with Framer Motion
  - Create ZoneProvider for zone context management
  - _Requirements: 12.1, 12.2, 12.3, 2.5_

- [x] 7.1 Write property test for responsive layout adaptation


  - **Property 11: Responsive layout adaptation**
  - **Validates: Requirements 12.1, 12.2, 12.3**

- [x] 7.2 Create zone management landing page





  - Create zone management page route (main landing after login)
  - Implement ZoneGrid component to display all zones
  - Create ZoneCard component with zone summary (name, temp, humidity, health status, alerts)
  - Add click handler to navigate to zone-specific dashboard
  - Fetch zones list from API
  - Implement real-time updates for zone cards
  - Add loading and error states
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 7.3 Write property test for zone management display





  - **Property 1: Zone management display**
  - **Validates: Requirements 1.1, 1.2**

- [x] 8. Build zone-specific dashboard page with sensor cards





- [x] 8.1 Create zone-specific SensorCard component


  - Create SensorCard component with zoneId, value, unit, and trend display
  - Implement threshold-based color coding (green/yellow/red)
  - Add animated value transitions
  - _Requirements: 2.1, 2.3_

- [x] 8.2 Write property test for threshold visual indication per zone
  - **Property 3: Threshold visual indication per zone**
  - **Validates: Requirements 2.3**

- [x] 8.3 Create zone dashboard page layout


  - Create zone dashboard page route (zones/[zoneId]/page.tsx)
  - Display zone name and back button
  - Create grid layout for sensor cards (responsive)
  - Add last update timestamp display for zone
  - _Requirements: 2.1, 2.4_

- [x] 8.4 Integrate zone-specific sensor data fetching


  - Fetch and display all environmental metrics for selected zone
  - Connect SensorCard components to zone-specific API data
  - Add loading states
  - _Requirements: 2.1, 2.2_

- [x] 8.5 Implement zone-specific real-time updates


  - Implement real-time updates via WebSocket for selected zone
  - Update sensor cards when new data arrives for the zone
  - _Requirements: 2.2_

- [x] 8.6 Create WeatherWidget component


  - Create WeatherWidget component with current conditions
  - Integrate with weather data API
  - Add to zone dashboard layout
  - _Requirements: 16.1_

- [x] 8.7 Write unit tests for dashboard components


  - Test SensorCard with different threshold states
  - Test grid layout responsiveness
  - Test WeatherWidget rendering

- [-] 9. Implement zone-specific historical data visualization page

- [x] 9.1 Create environment page route and basic layout





  - Create environment page route (zones/[zoneId]/environment/page.tsx)
  - Set up page structure with zone name in header
  - Add back navigation to zone dashboard
  - Create container for chart and controls
  - _Requirements: 3.1_

- [x] 9.2 Build RetroChart component wrapper





  - Create RetroChart component wrapper for Recharts
  - Apply spooky styling (ghost green colors, pixel borders)
  - Configure chart dimensions and responsiveness
  - Add basic line chart rendering
  - _Requirements: 3.3, 3.4_
-


- [x] 9.3 Implement time range selector





  - Create TimeRangeSelector component
  - Add buttons for time ranges (1h, 6h, 24h, 7d, 30d)
  - Implement active state styling
  - Handle time range selection state
  - _Requirements: 3.2_

- [x] 9.4 Create metric selector




  - Create MetricSelector component with multi-select checkboxes
  - Add checkboxes for each metric (temperature, humidity, soil moisture, light)
  - Implement selection state management
  - Add color coding for each metric
  - _Requirements: 3.2_

- [x] 9.5 Integrate historical data fetching




  - Create API client function for historical data
  - Fetch historical data from API for selected zone based on time range and metrics
  - Implement loading states
  - Handle error states
  - _Requirements: 3.1_

- [x] 9.6 Connect chart to data and add interactivity





  - Render line/area chart with fetched data
  - Add interactive tooltips with pixel borders
  - Implement chart legend with color coding
  - Add loading skeleton for chart
  - Handle empty data states
  - _Requirements: 3.3, 3.4_

- [ ]* 9.7 Write property test for zone-specific chart data completeness
  - **Property 7: Zone-specific chart data completeness**
  - **Validates: Requirements 3.1, 3.2**

- [x] 10. Create zone-specific irrigation control page





  - Create irrigation page route (zones/[zoneId]/irrigation/page.tsx)
  - Build IrrigationControlPanel component with zoneId prop
  - Display current status (active/inactive) with animated indicator for zone
  - Show reservoir level with slime-style progress bar for zone
  - Display water flow rate with animated gauge for zone
  - Implement start irrigation button with confirmation modal for zone
  - Implement stop irrigation button for zone
  - Disable start button when zone reservoir < 10%
  - Add loading states for commands
  - Show success/error notifications
  - Display zone name in page header
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 10.1 Write property test for zone-specific irrigation command acknowledgment






  - **Property 4: Zone-specific irrigation command acknowledgment**
  - **Validates: Requirements 4.1, 4.3**

- [ ]* 10.2 Write property test for zone-specific reservoir level safety
  - **Property 5: Zone-specific reservoir level safety**
  - **Validates: Requirements 4.5**

- [x] 11. Build zone-specific plant health image upload page







  - Create plant-health page route (zones/[zoneId]/plant-health/page.tsx)
  - Implement ImageUpload component with drag-and-drop and zoneId prop
  - Add file type validation (JPEG, PNG only)
  - Add file size validation
  - Create image preview with retro frame
  - Implement upload progress indicator with pixel art animation
  - Display analysis results with disease cards for zone
  - Show confidence scores with progress bars
  - Display treatment recommendations for zone
  - Add error handling for upload failures
  - Display zone name in page header
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ]* 11.1 Write property test for zone-specific image upload validation
  - **Property 6: Zone-specific image upload validation**
  - **Validates: Requirements 5.1**

- [x] 12. Create zone-specific plant growth tracking page







  - Create plant-health/growth page route (zones/[zoneId]/plant-health/growth/page.tsx)
  - Fetch list of tracked plants from API for selected zone
  - Display plant list with thumbnails for zone
  - Implement plant selection
  - Show growth metrics (height, leaf count, health score) for zone plants
  - Create growth chart with time-series data for zone
  - Add comparison to expected growth rates
  - Display "no data" message when appropriate
  - Display zone name in page header
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ]* 12.1 Write unit tests for zone-specific growth tracking components
  - Test plant list rendering with zone context
  - Test growth chart with mock data
  - Test empty state display

- [x] 13. Implement zone-specific predictive analytics page





  - Create analytics page route (zones/[zoneId]/analytics/page.tsx)
  - Fetch predictions from API for selected zone
  - Display prediction cards for each metric for zone
  - Create prediction chart with confidence intervals (shaded area) for zone
  - Show forecast period (6-24 hours) for zone
  - Display proactive alerts for threshold exceedances in zone
  - Add last update timestamp
  - Implement auto-refresh every 6 hours
  - Show loading state while fetching
  - Display zone name in page header
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ]* 13.1 Write property test for zone-specific prediction confidence interval display
  - **Property 16: Zone-specific prediction confidence interval display**
  - **Validates: Requirements 7.2**

- [x] 14. Create zone-specific optimization recommendations page





  - Create analytics/recommendations page route (zones/[zoneId]/analytics/recommendations/page.tsx)
  - Fetch recommendations from API for selected zone
  - Display recommendation cards with priority badges for zone
  - Implement expandable cards for detailed information
  - Show category, expected impact, and action items for zone
  - Sort recommendations by priority (high, medium, low)
  - Add color coding based on priority
  - Display "optimal conditions" message when no recommendations for zone
  - Display zone name in page header
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ]* 14.1 Write unit tests for zone-specific recommendations page
  - Test recommendation card rendering
  - Test priority sorting
  - Test expand/collapse functionality

- [x] 15. Build security monitoring page (cross-zone)







  - Create security page route (not zone-specific)
  - Display access point status grid (doors and windows) across all zones
  - Show current state (open/closed) with color indicators and zone labels
  - Implement real-time updates for state changes
  - Create security log table with filtering
  - Add event type filter (motion, door, window)
  - Add date range filter
  - Add location filter
  - Add zone filter
  - Display motion events with confidence scores and zone information
  - Show prominent alert for off-hours motion events with zone information
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ]* 15.1 Write property test for security event real-time update with zone info
  - **Property 8: Security event real-time update with zone info**
  - **Validates: Requirements 9.2**

- [x] 16. Create off-hours configuration page

  - Create security/settings page route
  - Display current off-hours configuration
  - Implement enable/disable toggle
  - Create time picker for start hour (0-23)
  - Create time picker for end hour (0-23)
  - Add form validation
  - Implement save functionality
  - Show success confirmation
  - Display validation errors
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ]* 16.1 Write property test for form validation feedback
  - **Property 9: Form validation feedback**
  - **Validates: Requirements 15.5**

- [x] 17. Implement alert management system (zone-aware)





  - Create alerts page route (cross-zone)
  - Set up Zustand store for alert state
  - Display alert list with severity indicators and zone information
  - Implement alert notification component (toast/banner) with zone info
  - Add acknowledge functionality
  - Sort alerts by severity and timestamp
  - Show detailed alert information on click including zone
  - Implement alert filtering by zone
  - Add real-time alert updates via WebSocket with zone information
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_


- [x] 17.1 Write property test for zone-aware alert notification display



  - **Property 15: Zone-aware alert notification display**
  - **Validates: Requirements 11.1**


- [ ] 18. Implement zone-aware data refresh and caching strategy





  - Configure React Query cache times
  - Set zone dashboard data refetch interval to 5 seconds per zone
  - Set historical data cache to 60 seconds per zone
  - Set predictions cache to 6 hours per zone
  - Implement manual refresh functionality for current zone
  - Add cache invalidation on manual refresh for current zone
  - Implement optimistic updates for user actions
  - Add stale-while-revalidate pattern
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

- [ ]* 18.1 Write property test for zone-specific cache invalidation on manual refresh
  - **Property 12: Zone-specific cache invalidation on manual refresh**
  - **Validates: Requirements 14.5**

- [ ] 19. Add comprehensive error handling and loading states













  - Create ErrorBoundary component with spooky error page
  - Implement loading skeletons for all pages (zone management and zone-specific)
  - Add error messages for API failures
  - Create retry buttons for failed requests
  - Implement network error detection
  - Add offline indicator
  - Create success toast notifications
  - Implement form validation error display
  - Add timeout handling
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

- [ ]* 19.1 Write property test for loading state visibility
  - **Property 13: Loading state visibility**
  - **Validates: Requirements 15.1**

- [ ]* 19.2 Write property test for error message display
  - **Property 14: Error message display**
  - **Validates: Requirements 15.2**

- [x] 20. Expand weather widget with detailed view





  - Enhance WeatherWidget with current conditions
  - Add 5-day forecast display
  - Implement expandable detailed view
  - Show last update timestamp
  - Display appropriate message when data unavailable
  - Add weather icons (pixel art style)
  - Implement auto-refresh every hour
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

- [ ]* 20.1 Write unit tests for weather widget
  - Test current conditions display
  - Test forecast rendering
  - Test expand/collapse functionality
  - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5_

- [x] 21. Add spooky visual effects and animations





  - Implement fog overlay animation on backgrounds
  - Add floating animation for cards (zone cards and sensor cards)
  - Create pulse animation for alerts
  - Add flicker effect for critical warnings
  - Implement ghost particle effect (optional)
  - Add cobweb decorations to corners
  - Create hover glow effects
  - Add page transition animations (zone management to zone dashboard)
  - Implement loading animations (spinning ghost, floating skull)
  - _Requirements: 17.3_

- [x] 22. Implement responsive design optimizations





  - Test and refine mobile layout (single column) for zone management and zone pages
  - Test and refine tablet layout (two columns) for zone management and zone pages
  - Test and refine desktop layout (multi-column) for zone management and zone pages
  - Implement collapsible sidebar for mobile with zone selector
  - Add touch gesture support
  - Test rotation handling
  - Optimize chart rendering for small screens
  - Add mobile-friendly navigation with zone context
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [x] 23. Set up environment configuration





  - Create .env.local file with API URLs
  - Configure NEXT_PUBLIC_API_URL
  - Configure NEXT_PUBLIC_WS_URL
  - Configure NEXTAUTH_URL and NEXTAUTH_SECRET
  - Create .env.example template
  - Document environment variables in README
  - _Requirements: All_

- [ ]* 24. Write property-based tests for correctness properties
- [ ]* 24.1 Write property test for zone management display
  - **Property 1: Zone management display**
  - **Validates: Requirements 1.1, 1.2**

- [ ]* 24.2 Write property test for real-time data freshness per zone
  - **Property 2: Real-time data freshness per zone**
  - **Validates: Requirements 2.2**

- [ ]* 24.3 Write property test for threshold visual indication per zone
  - **Property 3: Threshold visual indication per zone**
  - **Validates: Requirements 2.3**

- [ ]* 24.4 Write property test for zone-specific irrigation command acknowledgment
  - **Property 4: Zone-specific irrigation command acknowledgment**
  - **Validates: Requirements 4.1, 4.3**

- [ ]* 24.5 Write property test for zone-specific reservoir level safety
  - **Property 5: Zone-specific reservoir level safety**
  - **Validates: Requirements 4.5**

- [ ]* 24.6 Write property test for zone-specific image upload validation
  - **Property 6: Zone-specific image upload validation**
  - **Validates: Requirements 5.1**

- [ ]* 24.7 Write property test for zone-specific chart data completeness
  - **Property 7: Zone-specific chart data completeness**
  - **Validates: Requirements 3.1, 3.2**

- [ ]* 24.8 Write property test for security event real-time update with zone info
  - **Property 8: Security event real-time update with zone info**
  - **Validates: Requirements 9.2**

- [ ]* 24.9 Write property test for form validation feedback
  - **Property 9: Form validation feedback**
  - **Validates: Requirements 15.5**

- [ ]* 24.10 Write property test for authentication redirect to zone management
  - **Property 10: Authentication redirect to zone management**
  - **Validates: Requirements 13.1, 13.2**

- [ ]* 24.11 Write property test for responsive layout adaptation
  - **Property 11: Responsive layout adaptation**
  - **Validates: Requirements 12.1, 12.2, 12.3**

- [ ]* 24.12 Write property test for zone-specific cache invalidation
  - **Property 12: Zone-specific cache invalidation on manual refresh**
  - **Validates: Requirements 14.5**

- [ ]* 24.13 Write property test for loading state visibility
  - **Property 13: Loading state visibility**
  - **Validates: Requirements 15.1**

- [ ]* 24.14 Write property test for error message display
  - **Property 14: Error message display**
  - **Validates: Requirements 15.2**

- [ ]* 24.15 Write property test for zone-aware alert notification display
  - **Property 15: Zone-aware alert notification display**
  - **Validates: Requirements 11.1**

- [ ]* 24.16 Write property test for zone-specific prediction confidence intervals
  - **Property 16: Zone-specific prediction confidence interval display**
  - **Validates: Requirements 7.2**

- [ ] 25. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ]* 26. Create E2E tests for critical user journeys
- [ ]* 26.1 Write E2E test for login flow
  - Test login page rendering
  - Test successful authentication
  - Test failed authentication
  - Test redirect after login to zone management page

- [ ]* 26.2 Write E2E test for zone management and navigation
  - Test zone management page loads with zone cards
  - Test zone card displays correct information
  - Test clicking zone card navigates to zone dashboard
  - Test real-time updates on zone cards

- [ ]* 26.3 Write E2E test for zone dashboard viewing
  - Test zone dashboard loads with sensor data for selected zone
  - Test real-time updates for zone
  - Test navigation between zone pages
  - Test back to zone management

- [ ]* 26.4 Write E2E test for zone-specific irrigation control
  - Test start irrigation flow for specific zone
  - Test stop irrigation flow for specific zone
  - Test reservoir level warning for zone

- [ ]* 26.5 Write E2E test for zone-specific image upload
  - Test file selection for zone
  - Test upload process with zone context
  - Test results display for zone

- [ ] 27. Create deployment configuration
  - Create Dockerfile for containerized deployment
  - Set up Vercel configuration (vercel.json)
  - Create build scripts in package.json
  - Document deployment steps in README
  - Configure production environment variables
  - Set up CI/CD pipeline (optional)
  - _Requirements: All_

- [ ] 28. Write comprehensive README documentation
  - Document project setup instructions
  - List all environment variables
  - Explain folder structure
  - Document component architecture
  - Add screenshots of spooky UI
  - Include development workflow
  - Document testing strategy
  - Add troubleshooting section
  - _Requirements: All_

- [ ] 29. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
