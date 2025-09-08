# Google OAuth Setup Instructions - FINAL SOLUTION

## EXACT CALLBACK URL TO ADD IN GOOGLE CONSOLE

Copy this URL exactly and add it to your Google Console:

```
https://389518e4-ee3b-4ff5-aee9-de23f4fe0d0f-00-2idqpkhi8qf80.riker.replit.dev/auth/google/callback
```

## Step-by-Step Google Console Setup

1. **Go to**: https://console.cloud.google.com/apis/credentials
2. **Select Project**: `tactile-welder-464714-i4`
3. **Click on OAuth 2.0 Client ID**: `647150764797-5m5uk6h4gie50l0h1a7pbav9vh0cuh48.apps.googleusercontent.com`
4. **In "Authorized redirect URIs" section**:
   - **REMOVE**: `https://workspace.patswapnfc.repl.co/api/auth/google/callback`
   - **ADD**: `https://389518e4-ee3b-4ff5-aee9-de23f4fe0d0f-00-2idqpkhi8qf80.riker.replit.dev/auth/google/callback`
5. **Click SAVE and wait 2-3 minutes for changes to propagate**

## Current Error: redirect_uri_mismatch

This error means the callback URL in Google Console doesn't match exactly. Make sure you:
1. Remove ALL existing redirect URIs
2. Add ONLY the new callback URL
3. Click SAVE
4. Wait 2-3 minutes before testing

## Testing the OAuth Flow

1. Visit: `https://389518e4-ee3b-4ff5-aee9-de23f4fe0d0f-00-2idqpkhi8qf80.riker.replit.dev/login`
2. Click "Sign in with Google"
3. Should redirect to Google OAuth
4. After authentication, should redirect to `/dashboard`

## Current OAuth Configuration Status
- ✅ Backend routes configured
- ✅ Passport strategy configured
- ✅ Session handling ready
- ❌ Google Console redirect URI needs updating

## Important Notes
- The callback URL must match exactly (including https://)
- Changes in Google Console may take a few minutes to propagate
- Test in incognito mode to avoid cached OAuth states