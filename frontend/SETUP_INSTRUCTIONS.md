# Frontend Setup Instructions

## Initial Setup

The Next.js project structure has been created with all configuration files. To complete the setup:

### 1. Install Dependencies

Navigate to the frontend directory and install all dependencies:

```bash
cd frontend
npm install
```

This will install:
- **Core Dependencies**: Next.js, React, TypeScript, Tailwind CSS, React Query, Zustand, Socket.io client, Framer Motion
- **UI Dependencies**: Recharts, React Hook Form, Zod, NextAuth.js, Axios, Lucide React
- **Dev Dependencies**: Jest, React Testing Library, Playwright, fast-check, ESLint

### 2. Verify Installation

After installation completes, verify the setup:

```bash
npm run dev
```

The development server should start on `http://localhost:3001`

### 3. Run Tests

Verify the testing setup:

```bash
# Unit tests
npm test

# E2E tests (requires dev server running)
npm run test:e2e
```

## What's Been Configured

✅ Next.js 14+ with App Router and TypeScript  
✅ TypeScript with strict mode enabled  
✅ Tailwind CSS with custom spooky theme  
✅ Jest configuration for unit testing  
✅ Playwright configuration for E2E testing  
✅ ESLint configuration  
✅ Environment variables template  
✅ Project folder structure  
✅ Global styles with spooky theme  
✅ Root layout and home page  

## Next Steps

After running `npm install`, you can proceed with:
- Task 2: Set up spooky design system and global styles (partially complete)
- Task 3: Create base UI components with spooky styling
- Task 4: Set up API client and data fetching infrastructure

## Troubleshooting

If you encounter issues:

1. **Node version**: Ensure you're using Node.js 18 or higher
2. **Port conflicts**: The dev server uses port 3001 (backend uses 3000)
3. **Path issues**: Make sure you're in the `frontend` directory when running commands

## Environment Variables

The `.env.local` file has been created with default values for local development. For production deployments, you'll need to update these values.

### Configuration Files

- **`.env.local`**: Your local environment configuration (not committed to git)
- **`.env.example`**: Template file with all available variables and documentation

### Required Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3000` | Backend REST API URL |
| `NEXT_PUBLIC_WS_URL` | `ws://localhost:3000` | WebSocket URL for real-time updates |
| `NEXTAUTH_URL` | `http://localhost:3001` | Frontend application URL |
| `NEXTAUTH_SECRET` | `your-secret-key-change-this-in-production` | Secret for JWT encryption (MUST change for production) |

### Local Development Setup

The default values in `.env.local` are configured for local development and should work out of the box if:
1. The backend is running on `http://localhost:3000`
2. The frontend is running on `http://localhost:3001`

### Production Setup

For production deployments:

1. **Update API URLs:**
   ```env
   NEXT_PUBLIC_API_URL=https://api.yourdomain.com
   NEXT_PUBLIC_WS_URL=wss://api.yourdomain.com
   NEXTAUTH_URL=https://yourdomain.com
   ```

2. **Generate a secure secret:**
   ```bash
   openssl rand -base64 32
   ```
   Use the output as your `NEXTAUTH_SECRET`

3. **Security checklist:**
   - ✅ Use HTTPS for API URL
   - ✅ Use WSS (secure WebSocket) for WebSocket URL
   - ✅ Generate a unique, random secret (minimum 32 characters)
   - ✅ Never commit `.env.local` to version control
   - ✅ Use different secrets for different environments

### Docker Development

When running with Docker Compose, the environment variables are configured in `docker-compose.yml`. The frontend container can access the backend via the internal Docker network.

### Verifying Configuration

After setting up environment variables:

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Check the console:**
   - Look for any connection errors
   - Verify API requests are going to the correct URL

3. **Test WebSocket connection:**
   - Open browser DevTools → Network tab
   - Filter by "WS" to see WebSocket connections
   - Verify connection to the configured WebSocket URL

4. **Test authentication:**
   - Navigate to the login page
   - Verify authentication flow works correctly
