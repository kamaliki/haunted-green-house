# Environment Setup Checklist

Use this checklist to ensure your environment is properly configured.

## Quick Start (Local Development)

- [ ] Copy environment file: `cp .env.quickstart .env.local`
- [ ] Verify backend is running on `http://localhost:3000`
- [ ] Start frontend: `npm run dev`
- [ ] Open browser to `http://localhost:3001`
- [ ] Verify connection status in UI

## Production Deployment

### Pre-Deployment

- [ ] Generate secure secret: `openssl rand -base64 32`
- [ ] Update `NEXT_PUBLIC_API_URL` to production backend URL (HTTPS)
- [ ] Update `NEXT_PUBLIC_WS_URL` to production WebSocket URL (WSS)
- [ ] Update `NEXTAUTH_URL` to production frontend URL (HTTPS)
- [ ] Set `NEXTAUTH_SECRET` to generated secure string
- [ ] Verify all URLs use HTTPS/WSS (not HTTP/WS)
- [ ] Configure environment variables in deployment platform
- [ ] Enable secret management in deployment platform
- [ ] Review security checklist in ENVIRONMENT_CONFIGURATION.md

### Post-Deployment

- [ ] Test API connectivity from production frontend
- [ ] Verify WebSocket connection works
- [ ] Test authentication flow (login/logout)
- [ ] Check browser console for errors
- [ ] Verify CORS configuration allows frontend origin
- [ ] Test on multiple devices/browsers
- [ ] Monitor error logs for issues
- [ ] Set up alerts for connection failures

## Docker Deployment

- [ ] Verify `docker-compose.yml` has correct environment variables
- [ ] Set `INTERNAL_API_URL=http://backend:3000` for server-side calls
- [ ] Ensure all services are on same Docker network
- [ ] Start services: `docker-compose up`
- [ ] Verify frontend can access backend via internal network
- [ ] Test external access via `http://localhost:3001`
- [ ] Check logs: `docker-compose logs frontend`

## Verification Steps

### API Connection
```bash
# Test backend is accessible
curl http://localhost:3000/health

# Check from frontend container (Docker)
docker exec haunted-greenhouse-frontend curl http://backend:3000/health
```

### WebSocket Connection
1. Open browser DevTools
2. Go to Network tab
3. Filter by "WS"
4. Verify WebSocket connection to configured URL
5. Check for successful connection (status 101)

### Authentication
1. Navigate to login page
2. Enter credentials
3. Verify successful login
4. Check session cookie is set
5. Verify protected routes are accessible
6. Test logout functionality

## Troubleshooting

### Issue: Cannot connect to backend
- [ ] Verify backend is running
- [ ] Check `NEXT_PUBLIC_API_URL` is correct
- [ ] Test backend URL in browser
- [ ] Check CORS configuration
- [ ] Verify firewall rules

### Issue: WebSocket not connecting
- [ ] Check `NEXT_PUBLIC_WS_URL` is correct
- [ ] Verify WebSocket is enabled on backend
- [ ] Use WSS in production (not WS)
- [ ] Check reverse proxy WebSocket configuration
- [ ] Verify network allows WebSocket connections

### Issue: Authentication fails
- [ ] Verify `NEXTAUTH_SECRET` is set
- [ ] Check `NEXTAUTH_URL` matches browser URL
- [ ] Clear browser cookies
- [ ] Check backend authentication endpoint
- [ ] Verify JWT secret matches backend

### Issue: Environment variables not loading
- [ ] Restart development server
- [ ] Check variable names (case-sensitive)
- [ ] Verify `.env.local` is in `frontend/` directory
- [ ] Add `NEXT_PUBLIC_` prefix for client-side variables
- [ ] Check for typos in variable names

## Documentation References

- **Quick Reference**: `.env.example` - Template with all variables
- **Comprehensive Guide**: `ENVIRONMENT_CONFIGURATION.md` - Detailed documentation
- **Setup Instructions**: `SETUP_INSTRUCTIONS.md` - Initial setup guide
- **Main README**: `README.md` - Project overview and getting started

## Security Reminders

- ✅ Never commit `.env.local` to version control
- ✅ Use HTTPS/WSS in production
- ✅ Generate unique secrets for each environment
- ✅ Rotate secrets regularly (every 90 days)
- ✅ Use deployment platform's secret management
- ✅ Monitor for unauthorized access
- ✅ Keep dependencies updated
- ✅ Review security logs regularly

## Support

If you encounter issues:
1. Check this checklist
2. Review `ENVIRONMENT_CONFIGURATION.md`
3. Check backend logs
4. Verify network connectivity
5. Consult project documentation
