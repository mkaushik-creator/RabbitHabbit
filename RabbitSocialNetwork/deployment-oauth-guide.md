# OAuth Deployment Configuration Guide

## Current Status
✅ OAuth is configured for dynamic URL detection
✅ Development: Works with current dev domain  
✅ Production: Will automatically use `https://rabbithabbit.replit.app`

## What You Need to Do Before Deployment

### 1. Update Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **Credentials**
3. Click on your OAuth 2.0 Client ID
4. In **Authorized redirect URIs**, add:
   ```
   https://rabbithabbit.replit.app/auth/google/callback
   ```
5. Keep the existing development URL for testing:
   ```
   https://389518e4-ee3b-4ff5-aee9-de23f4fe0d0f-00-2idqpkhi8qf80.riker.replit.dev/auth/google/callback
   ```

### 2. Environment Variables
The following environment variables are already configured and will work in production:
- `GOOGLE_CLIENT_ID` ✅
- `GOOGLE_CLIENT_SECRET` ✅  
- `SESSION_SECRET` ✅
- `DATABASE_URL` ✅

### 3. Automatic URL Detection
The app will automatically detect the environment:

**Development Mode:**
- Uses current dev domain: `https://[random-id].riker.replit.dev`

**Production Mode:**
- Uses production domain: `https://rabbithabbit.replit.app`

## Test Plan After Deployment
1. Deploy the app to `https://rabbithabbit.replit.app`
2. Test Google OAuth login
3. Verify user authentication and session persistence
4. Confirm user name displays correctly

## Backup Configuration
If automatic detection fails, you can manually set the production URL by adding this environment variable:
```
PRODUCTION_URL=https://rabbithabbit.replit.app
```

## Current OAuth Flow
1. User clicks "Sign in with Google"
2. Redirects to Google with correct callback URL
3. Google authenticates user
4. Redirects back to `/auth/google/callback`
5. User session created and redirected to dashboard

The OAuth configuration is now deployment-ready! 🚀