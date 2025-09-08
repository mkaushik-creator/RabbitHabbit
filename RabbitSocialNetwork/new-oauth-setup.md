# New Google OAuth Client Setup

## Current Configuration
- **Domain**: `389518e4-ee3b-4ff5-aee9-de23f4fe0d0f-00-2idqpkhi8qf80.riker.replit.dev`
- **Required Callback URL**: `https://389518e4-ee3b-4ff5-aee9-de23f4fe0d0f-00-2idqpkhi8qf80.riker.replit.dev/auth/google/callback`

## Steps to Create New OAuth Client

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/apis/credentials
   - Select your project (or create a new one)

2. **Create OAuth Client**
   - Click "CREATE CREDENTIALS" → "OAuth 2.0 Client ID"
   - Choose "Web application" as application type
   - Give it a name (e.g., "RabbitHabbit OAuth")

3. **Configure Redirect URI**
   - In "Authorized redirect URIs" section
   - Add exactly: `https://389518e4-ee3b-4ff5-aee9-de23f4fe0d0f-00-2idqpkhi8qf80.riker.replit.dev/auth/google/callback`
   - Click "CREATE"

4. **Copy Credentials**
   - Copy the Client ID
   - Copy the Client Secret

5. **Update Environment Secrets**
   - Update `GOOGLE_CLIENT_ID` with new Client ID
   - Update `GOOGLE_CLIENT_SECRET` with new Client Secret

6. **Test OAuth Flow**
   - Visit `/test-oauth` to test the new credentials
   - Should redirect to Google login successfully

## Important: Delete Old OAuth Client
**CRITICAL STEP**: Delete the previous OAuth client to avoid conflicts:
1. Go to Google Cloud Console → APIs & Services → Credentials
2. Find the old OAuth client: `647150764797-5m5uk6h4gie50l0h1a7pbav9vh0cuh48.apps.googleusercontent.com`
3. Click the trash/delete icon to remove it completely
4. This ensures no caching conflicts between old and new credentials

## Why This Will Work
- Fresh OAuth client eliminates any cached configuration issues
- Clean redirect URI setup with no conflicts
- Proper domain matching from the start
- No conflicts from multiple OAuth clients