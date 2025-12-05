# Environment Configuration Guide

This document provides comprehensive information about environment variables used in the Haunted Greenhouse Frontend application.

## Table of Contents

- [Overview](#overview)
- [Configuration Files](#configuration-files)
- [Environment Variables](#environment-variables)
- [Environment-Specific Setup](#environment-specific-setup)
- [Security Best Practices](#security-best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

The Next.js frontend uses environment variables to configure connections to the backend API, WebSocket server, and authentication system. These variables must be properly configured for the application to function correctly.

## Configuration Files

### `.env.local`
- Your local environment configuration
- **Not committed to version control** (listed in `.gitignore`)
- Used for local development
- Takes precedence over `.env.example`

### `.env.example`
- Template file with all available variables
- **Committed to version control**
- Serves as documentation for required variables
- Copy this file to `.env.local` to get started

### `.env.production`
- Optional file for production-specific variables
- Used during production builds
- Should not contain secrets (use deployment platform's secret management instead)

## Environment Variables

### Backend API Configuration

#### `NEXT_PUBLIC_API_URL`
- **Type:** String (URL)
- **Required:** Yes
- **Default:** `http://localhost:3000`
- **Description:** Base URL for the NestJS backend REST API
- **Browser Access:** Yes (prefixed with `NEXT_PUBLIC_`)
- **Examples:**
  - Development: `http://localhost:3000`
  - Docker: `http://localhost:3000`
  - Production: `https://api.yourdomain.com`

#### `NEXT_PUBLIC_WS_URL`
- **Type:** String (WebSocket URL)
- **Required:** Yes
- **Default:** `ws://localhost:3000`
- **Description:** WebSocket URL for real-time sensor data updates
- **Browser Access:** Yes (prefixed with `NEXT_PUBLIC_`)
- **Examples:**
  - Development: `ws://localhost:3000`
  - Docker: `ws://localhost:3000`
  - Production: `wss://api.yourdomain.com` (secure WebSocket)
- **Notes:**
  - Must use `wss://` (secure) in production
  - Should match the backend WebSocket endpoint

#### `INTERNAL_API_URL` (Optional - Docker Only)
- **Type:** String (URL)
- **Required:** No (only for Docker deployments)
- **Default:** Falls back to `NEXT_PUBLIC_API_URL`
- **Description:** Internal Docker network URL for server-side API calls
- **Browser Access:** No (server-side only)
- **Examples:**
  - Docker: `http://backend:3000`
- **Notes:**
  - Only used when running in Docker Compose
  - Allows server-side API calls to use internal Docker network
  - More efficient than routing through localhost
  - Not needed for local development outside Docker

### NextAuth Configuration

#### `NEXTAUTH_URL`
- **Type:** String (URL)
- **Required:** Yes
- **Default:** `http://localhost:3001`
- **Description:** Canonical URL of the Next.js application
- **Browser Access:** No (server-side only)
- **Examples:**
  - Development: `http://localhost:3001`
  - Docker: `http://localhost:3001`
  - Production: `https://yourdomain.com`
- **Notes:**
  - Must match the URL users access in their browser
  - Required for NextAuth.js callbacks and redirects
  - Should not include trailing slash

#### `NEXTAUTH_SECRET`
- **Type:** String (Secret Key)
- **Required:** Yes
- **Default:** `your-secret-key-change-this-in-production`
- **Description:** Secret key for encrypting JWT tokens and session data
- **Browser Access:** No (server-side only)
- **Security:** **CRITICAL** - Must be changed for production
- **Generation:**
  ```bash
  openssl rand -base64 32
  ```
- **Requirements:**
  - Minimum 32 characters
  - Should be cryptographically random
  - Must be unique per environment
  - Never commit to version control
- **Notes:**
  - Used to sign and encrypt JWT tokens
  - Changing this will invalidate all existing sessions
  - Should be different for each environment (dev, staging, prod)

## Environment-Specific Setup

### Local Development

**Prerequisites:**
- Backend running on `http://localhost:3000`
- Frontend running on `http://localhost:3001`

**Configuration:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:3000
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=dev-secret-key-not-for-production
```

**Setup Steps:**
1. Copy `.env.example` to `.env.local`
2. Use default values (no changes needed)
3. Start backend: `cd backend && npm run start:dev`
4. Start frontend: `cd frontend && npm run dev`

### Docker Development

**Prerequisites:**
- Docker and Docker Compose installed
- All services defined in `docker-compose.yml`

**Configuration:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:3000
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-nextauth-secret-key
```

**Setup Steps:**
1. Environment variables are configured in `docker-compose.yml`
2. Frontend container accesses backend via internal Docker network
3. External access uses `localhost` URLs
4. Start all services: `docker-compose up`

**Notes:**
- The frontend container uses `http://backend:3000` internally
- External browsers use `http://localhost:3000`
- WebSocket connections work through the Docker network

### Production Deployment

**Prerequisites:**
- Backend deployed and accessible via HTTPS
- Frontend deployed to hosting platform (Vercel, Netlify, etc.)
- SSL certificates configured

**Configuration:**
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_WS_URL=wss://api.yourdomain.com
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=<generated-secure-random-string>
```

**Setup Steps:**
1. Generate a secure secret:
   ```bash
   openssl rand -base64 32
   ```
2. Configure environment variables in your deployment platform
3. Use platform's secret management (don't commit secrets)
4. Verify HTTPS/WSS connections work
5. Test authentication flow

**Security Checklist:**
- ✅ Use HTTPS for all API URLs
- ✅ Use WSS (secure WebSocket) for WebSocket connections
- ✅ Generate unique, random secret (minimum 32 characters)
- ✅ Use deployment platform's secret management
- ✅ Enable CORS with specific origins (not wildcard)
- ✅ Configure Content Security Policy headers
- ✅ Enable rate limiting on backend
- ✅ Use different secrets for different environments
- ✅ Rotate secrets regularly
- ✅ Monitor for unauthorized access

## Security Best Practices

### Secret Management

1. **Never commit secrets to version control**
   - `.env.local` is in `.gitignore`
   - Use `.env.example` for documentation only
   - Store production secrets in deployment platform

2. **Use strong, random secrets**
   - Minimum 32 characters
   - Cryptographically random
   - Generate with: `openssl rand -base64 32`

3. **Rotate secrets regularly**
   - Change secrets every 90 days
   - Rotate immediately if compromised
   - Use different secrets per environment

4. **Limit secret access**
   - Only authorized personnel should access production secrets
   - Use role-based access control
   - Audit secret access logs

### Network Security

1. **Use HTTPS/WSS in production**
   - Never use HTTP/WS in production
   - Configure SSL certificates properly
   - Enable HSTS headers

2. **Configure CORS properly**
   - Specify exact origins (not wildcard)
   - Limit allowed methods
   - Validate Origin header

3. **Implement rate limiting**
   - Limit API requests per IP
   - Implement exponential backoff
   - Monitor for abuse

### Authentication Security

1. **Secure session management**
   - Use HTTP-only cookies
   - Enable secure flag in production
   - Set appropriate SameSite policy

2. **Implement CSRF protection**
   - NextAuth.js provides built-in CSRF protection
   - Verify CSRF tokens on state-changing operations

3. **Monitor authentication attempts**
   - Log failed login attempts
   - Implement account lockout
   - Alert on suspicious activity

## Troubleshooting

### API Connection Issues

**Symptom:** Frontend cannot connect to backend API

**Possible Causes:**
1. Backend not running
2. Incorrect `NEXT_PUBLIC_API_URL`
3. CORS configuration issues
4. Firewall blocking connections

**Solutions:**
1. Verify backend is running: `curl http://localhost:3000/health`
2. Check environment variable: `echo $NEXT_PUBLIC_API_URL`
3. Verify CORS allows frontend origin
4. Check firewall rules and network connectivity

### WebSocket Connection Issues

**Symptom:** Real-time updates not working

**Possible Causes:**
1. Incorrect `NEXT_PUBLIC_WS_URL`
2. WebSocket not enabled on backend
3. Reverse proxy not configured for WebSocket upgrades
4. Using `ws://` instead of `wss://` in production

**Solutions:**
1. Verify WebSocket URL in browser DevTools → Network → WS
2. Check backend WebSocket gateway is running
3. Configure reverse proxy (nginx/Apache) for WebSocket upgrades
4. Use `wss://` in production environments

### Authentication Issues

**Symptom:** Login fails or sessions expire immediately

**Possible Causes:**
1. Incorrect `NEXTAUTH_SECRET`
2. `NEXTAUTH_URL` doesn't match actual URL
3. Cookie settings incompatible with deployment
4. Session expired or invalidated

**Solutions:**
1. Verify `NEXTAUTH_SECRET` is set and consistent
2. Ensure `NEXTAUTH_URL` matches the URL in browser
3. Check cookie settings (secure, SameSite)
4. Clear browser cookies and try again

### Environment Variable Not Loading

**Symptom:** Environment variable is undefined in code

**Possible Causes:**
1. Variable not prefixed with `NEXT_PUBLIC_` (for client-side)
2. Development server not restarted after changes
3. Typo in variable name
4. `.env.local` not in correct location

**Solutions:**
1. Add `NEXT_PUBLIC_` prefix for client-side variables
2. Restart development server: `npm run dev`
3. Check variable name matches exactly (case-sensitive)
4. Ensure `.env.local` is in `frontend/` directory

### Docker-Specific Issues

**Symptom:** Frontend in Docker cannot connect to backend

**Possible Causes:**
1. Using `localhost` instead of service name
2. Services not on same Docker network
3. Port mapping incorrect

**Solutions:**
1. Use service name (`backend`) for internal connections
2. Verify both services in same network in `docker-compose.yml`
3. Check port mappings: `docker-compose ps`

## Additional Resources

- [Next.js Environment Variables Documentation](https://nextjs.org/docs/basic-features/environment-variables)
- [NextAuth.js Configuration](https://next-auth.js.org/configuration/options)
- [Docker Compose Environment Variables](https://docs.docker.com/compose/environment-variables/)
- [OpenSSL Random Generation](https://www.openssl.org/docs/man1.1.1/man1/rand.html)

## Support

For issues or questions:
1. Check this documentation first
2. Review the troubleshooting section
3. Check backend logs for errors
4. Verify network connectivity
5. Consult the project README.md
