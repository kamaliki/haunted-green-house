# Haunted Greenhouse Frontend

A spooky retro-themed Next.js web application for monitoring and controlling a smart greenhouse system.

## Features

- 👻 Spooky retro game aesthetic with pixel art and haunted themes
- 📊 Real-time sensor data monitoring via WebSocket
- 💧 Irrigation system control
- 🌱 Plant health analysis with image upload
- 📈 Predictive analytics and optimization recommendations
- 🔒 Security monitoring with access point tracking
- 📱 Responsive design for desktop, tablet, and mobile

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **State Management**: Zustand + React Query
- **Real-time**: Socket.io client
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod
- **Authentication**: NextAuth.js
- **Testing**: Jest, React Testing Library, Playwright, fast-check

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Backend API running on `http://localhost:3000`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
# Quick start (use defaults for local development)
cp .env.quickstart .env.local

# OR customize your configuration
cp .env.example .env.local
# Edit .env.local with your configuration
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3001](http://localhost:3001) in your browser

For detailed environment configuration, see [ENVIRONMENT_CONFIGURATION.md](./ENVIRONMENT_CONFIGURATION.md)

## Available Scripts

- `npm run dev` - Start development server on port 3001
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run Jest unit tests
- `npm run test:watch` - Run Jest in watch mode
- `npm run test:e2e` - Run Playwright E2E tests
- `npm run test:e2e:ui` - Run Playwright with UI

## Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Dashboard routes
│   ├── api/               # API routes
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── dashboard/        # Dashboard-specific components
│   ├── layout/           # Layout components
│   └── providers/        # Context providers
├── lib/                   # Utilities and helpers
│   ├── api/              # API client functions
│   ├── hooks/            # Custom React hooks
│   ├── store/            # Zustand stores
│   └── utils/            # Utility functions
├── types/                 # TypeScript type definitions
├── public/                # Static assets
└── e2e/                   # E2E tests
```

## Environment Variables

The application requires several environment variables to be configured. Copy `.env.example` to `.env.local` and update the values as needed.

### Required Variables

#### Backend API Configuration

- **`NEXT_PUBLIC_API_URL`**
  - Description: The base URL for the backend REST API
  - Default: `http://localhost:3000`
  - Production: Update to your production backend URL (e.g., `https://api.yourdomain.com`)
  - Note: Must be prefixed with `NEXT_PUBLIC_` to be accessible in the browser

- **`NEXT_PUBLIC_WS_URL`**
  - Description: The WebSocket URL for real-time updates
  - Default: `ws://localhost:3000`
  - Production: Update to your production WebSocket URL (e.g., `wss://api.yourdomain.com`)
  - Note: Use `wss://` (secure WebSocket) in production

#### NextAuth Configuration

- **`NEXTAUTH_URL`**
  - Description: The canonical URL of your Next.js application
  - Default: `http://localhost:3001`
  - Production: Update to your production frontend URL (e.g., `https://yourdomain.com`)
  - Note: Required for NextAuth.js to function correctly

- **`NEXTAUTH_SECRET`**
  - Description: Secret key used to encrypt JWT tokens and session data
  - Default: `your-secret-key-change-this-in-production`
  - Production: **MUST** be changed to a secure random string (minimum 32 characters)
  - Generate: Run `openssl rand -base64 32` to generate a secure secret
  - Security: Never commit this value to version control

### Environment-Specific Configuration

#### Development (Local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:3000
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=dev-secret-key-not-for-production
```

#### Docker Development
When running in Docker, the frontend container can access the backend via the internal network:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:3000
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-nextauth-secret-key
```

#### Production
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_WS_URL=wss://api.yourdomain.com
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=<generated-secure-random-string>
```

### Setup Instructions

1. **Copy the example file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Update the values:**
   - For local development, the defaults should work if the backend is running on port 3000
   - For production, update all URLs to match your deployment

3. **Generate a secure secret:**
   ```bash
   openssl rand -base64 32
   ```
   Copy the output and use it as your `NEXTAUTH_SECRET`

4. **Verify configuration:**
   - Restart the development server after changing environment variables
   - Check the browser console for any connection errors
   - Verify WebSocket connection in the Network tab

### Troubleshooting

**API Connection Issues:**
- Ensure the backend is running and accessible at the configured URL
- Check for CORS issues if the frontend and backend are on different domains
- Verify firewall rules allow connections on the specified ports

**WebSocket Connection Issues:**
- Ensure the WebSocket URL matches the backend configuration
- In production, use `wss://` (secure WebSocket) instead of `ws://`
- Check that your reverse proxy (if any) supports WebSocket upgrades

**Authentication Issues:**
- Verify `NEXTAUTH_SECRET` is set and matches across deployments
- Ensure `NEXTAUTH_URL` matches the actual URL users access
- Clear browser cookies and try again if experiencing session issues

### Security Notes

- **Never commit `.env.local`** to version control (it's in `.gitignore`)
- **Always use HTTPS/WSS** in production environments
- **Rotate secrets regularly** in production
- **Use different secrets** for development and production
- **Restrict API access** with proper authentication and rate limiting

## Spooky Theme

The application features a haunted/Halloween aesthetic with:

- Dark color palette with neon greens, toxic purples, and blood reds
- Pixel art elements and retro fonts
- Smooth animations (floating, glowing, flickering)
- CRT scanline effects
- Custom spooky cursors and icons

## Testing

### Unit Tests
```bash
npm test
```

### E2E Tests
```bash
npm run test:e2e
```

### Property-Based Tests
Property-based tests use fast-check to verify correctness properties across many inputs.

## License

Private - Haunted Greenhouse Project
