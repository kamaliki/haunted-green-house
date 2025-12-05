# NextAuth Registration Integration Guide

## Overview

This document describes the NextAuth configuration updates that enable seamless session management for both user registration and login flows.

## Changes Made

### 1. NextAuth Configuration (`frontend/app/api/auth/[...nextauth]/route.ts`)

**Key Updates:**
- Added support for registration flow using access tokens
- Extended credentials provider to accept `accessToken` and `isRegistration` parameters
- Implemented dual authentication paths:
  - **Registration Flow**: Uses the JWT token from registration response
  - **Login Flow**: Authenticates with username/password

**How It Works:**

```typescript
// Registration Flow
if (credentials.isRegistration === 'true' && credentials.accessToken) {
  // Verify token by fetching user profile
  const response = await axios.get('/auth/profile', {
    headers: { Authorization: `Bearer ${credentials.accessToken}` }
  });
  return user;
}

// Login Flow
if (credentials.username && credentials.password) {
  // Authenticate with backend
  const response = await axios.post('/auth/login', credentials);
  return user;
}
```

### 2. Registration Page (`frontend/app/(auth)/register/page.tsx`)

**Updated Flow:**
```typescript
// After successful registration
const response = await registerUser(accountData);

// Store token for API calls
storeToken(response.accessToken);

// Create NextAuth session using registration token
await signIn('credentials', {
  accessToken: response.accessToken,
  isRegistration: 'true',
  redirect: false,
});
```

### 3. Backend Auth Controller (`backend/src/modules/auth/auth.controller.ts`)

**Added Profile Endpoint:**
```typescript
@Get('profile')
@UseGuards(JwtAuthGuard)
async getProfile(@Request() req) {
  const user = await this.authService.getUserById(req.user.userId);
  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.username,
    },
  };
}
```

**Response Format Standardization:**
- Both `/auth/register` and `/auth/login` now return `{ user, accessToken }`
- Consistent response structure for frontend consumption

### 4. Backend Auth Service (`backend/src/modules/auth/auth.service.ts`)

**Added Method:**
```typescript
async getUserById(userId: string): Promise<User> {
  const user = await this.userRepository.findOne({ where: { id: userId } });
  if (!user) {
    throw new UnauthorizedException('User not found');
  }
  return user;
}
```

## Session Persistence

### How Sessions Work

1. **Registration:**
   - User submits registration form
   - Backend creates user and returns JWT token
   - Frontend stores token in localStorage
   - Frontend creates NextAuth session using the token
   - Session persists across page reloads

2. **Login:**
   - User submits login form
   - Backend validates credentials and returns JWT token
   - Frontend creates NextAuth session
   - Session persists across page reloads

3. **Session Storage:**
   - NextAuth uses JWT strategy
   - Session data stored in encrypted JWT cookie
   - Access token included in session for API calls
   - Session expires after 24 hours

### Session Structure

```typescript
{
  user: {
    id: string;
    name: string;
    email: string;
  };
  accessToken: string;
  expires: string;
}
```

## Testing Session Persistence

### Manual Testing

1. **Test Registration Flow:**
   ```bash
   # Start the application
   npm run dev
   
   # Navigate to /register
   # Complete registration
   # Verify redirect to greenhouse setup
   # Refresh the page
   # Verify session persists (no redirect to login)
   ```

2. **Test Login Flow:**
   ```bash
   # Navigate to /login
   # Enter credentials
   # Verify redirect to dashboard
   # Refresh the page
   # Verify session persists
   ```

3. **Test Session Expiration:**
   ```bash
   # Login or register
   # Wait 24 hours (or modify maxAge for testing)
   # Refresh the page
   # Verify redirect to login
   ```

### Automated Testing

Run the test suite:
```bash
# Frontend tests
cd frontend
npm test

# Specific test files
npm test -- --testPathPattern="register.*page.test"
npm test -- --testPathPattern="api/auth.*route.test"
```

### API Testing

Test the profile endpoint:
```bash
# Get a token from registration or login
TOKEN="your-jwt-token"

# Test profile endpoint
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/auth/profile
```

## Environment Variables

Ensure these are set:

```env
# Backend (.env)
JWT_SECRET=your-secret-key
JWT_EXPIRATION=24h

# Frontend (.env.local)
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-nextauth-secret
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Troubleshooting

### Session Not Persisting

1. **Check NEXTAUTH_SECRET:**
   - Ensure it's set in `.env.local`
   - Must be consistent across restarts

2. **Check Cookie Settings:**
   - Verify cookies are enabled in browser
   - Check browser console for cookie errors

3. **Check Token Validity:**
   - Verify JWT_SECRET matches between requests
   - Check token expiration time

### Profile Endpoint Errors

1. **401 Unauthorized:**
   - Token may be expired
   - JWT_SECRET mismatch
   - Token not properly formatted

2. **User Not Found:**
   - User may have been deleted
   - Database connection issue

## Security Considerations

1. **Token Storage:**
   - Access tokens stored in localStorage for API calls
   - Session tokens stored in HTTP-only cookies by NextAuth
   - Consider using HTTP-only cookies for access tokens in production

2. **Token Expiration:**
   - JWT tokens expire after 24 hours
   - Implement token refresh mechanism for production

3. **HTTPS:**
   - Always use HTTPS in production
   - Cookies should have `secure` flag set

4. **CSRF Protection:**
   - NextAuth provides built-in CSRF protection
   - Ensure it's enabled in production

## Future Improvements

1. **Token Refresh:**
   - Implement refresh token mechanism
   - Auto-refresh before expiration

2. **Remember Me:**
   - Add option to extend session duration
   - Store refresh token securely

3. **Multi-Device Sessions:**
   - Track active sessions
   - Allow users to revoke sessions

4. **Session Analytics:**
   - Track session duration
   - Monitor authentication patterns
