# Deployment Guide - Backend API + RLS

This guide walks you through deploying the new backend architecture to production.

## Prerequisites

- Access to Vercel dashboard
- Access to Supabase dashboard
- Clerk account with secret key

## Step 1: Configure Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

### Frontend Variables (already configured)
- `VITE_CLERK_PUBLISHABLE_KEY` - Your Clerk publishable key
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key

### New Backend Variables (⚠️ REQUIRED)
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
  - Find in: Supabase Dashboard → Settings → API → service_role key
  - ⚠️ **CRITICAL**: This key bypasses RLS, never expose to frontend!
  
- `CLERK_SECRET_KEY` - Your Clerk secret key
  - Find in: Clerk Dashboard → API Keys → Secret keys
  - ⚠️ **CRITICAL**: This is different from the publishable key!

4. Set environment for: **Production**, **Preview**, and **Development**

## Step 2: Deploy Code to Vercel

```bash
# Commit all changes
git add .
git commit -m "feat: implement backend API and enable RLS"

# Push to main branch (triggers automatic deployment)
git push origin main
```

Vercel will automatically:
- Build the frontend
- Deploy the API endpoints to `/api/*`
- Apply the new environment variables

## Step 3: Enable RLS in Supabase

⚠️ **IMPORTANT**: Do this AFTER the code is deployed to Vercel!

1. Open Supabase Dashboard
2. Go to **SQL Editor**
3. Open the file `supabase_enable_rls.sql` from your project
4. Copy the entire content
5. Paste into Supabase SQL Editor
6. Click **Run**

Expected output:
```
ALTER TABLE (2 rows affected)
CREATE POLICY (8 rows affected)
```

## Step 4: Verify Deployment

### Test API Endpoints

Open your browser console on the deployed app and run:

```javascript
// Should return 401 (unauthorized) - good!
fetch('https://your-app.vercel.app/api/shinies')
  .then(r => r.json())
  .then(console.log);
```

### Test Authentication Flow

1. Sign in to the app
2. Add a shiny Pokemon
3. Open Network tab in DevTools
4. Verify requests go to `/api/shinies` (not direct Supabase)
5. Verify `Authorization: Bearer ...` header is present

### Test RLS Policies

In Supabase SQL Editor, run:

```sql
-- Should return 0 rows (RLS is working!)
SELECT * FROM shiny_pokemon;
SELECT * FROM user_preferences;
```

## Step 5: Monitor for Errors

1. Check Vercel Function Logs:
   - Vercel Dashboard → Deployments → [Latest] → Functions
   - Look for any errors in API endpoints

2. Check Supabase Logs:
   - Supabase Dashboard → Logs → API
   - Look for authentication errors

## Rollback Plan

If something goes wrong:

### Disable RLS (Emergency)
```sql
ALTER TABLE shiny_pokemon DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences DISABLE ROW LEVEL SECURITY;
```

### Revert Code
```bash
git revert HEAD
git push origin main
```

## Common Issues

### Issue: "Missing authorization header"
**Cause**: Clerk token not being sent
**Fix**: Check that `useClerkToken` hook is initialized in App.tsx

### Issue: "Authentication failed"
**Cause**: Invalid `CLERK_SECRET_KEY`
**Fix**: Verify the secret key in Vercel environment variables

### Issue: "Failed to fetch shiny Pokemon"
**Cause**: RLS enabled but backend not using service role key
**Fix**: Verify `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel

### Issue: API returns 404
**Cause**: Vercel not detecting API routes
**Fix**: Ensure `api/` folder is in project root, redeploy

## Success Checklist

- [ ] All environment variables configured in Vercel
- [ ] Code deployed to Vercel successfully
- [ ] RLS SQL script executed in Supabase
- [ ] Can sign in and add/remove shinies
- [ ] Network tab shows API calls to `/api/*`
- [ ] No errors in Vercel function logs
- [ ] No errors in Supabase logs

## Next Steps

Once deployed successfully:
- [ ] Update `.env.local` with backend variables for local development
- [ ] Test local development with `npm run dev`
- [ ] Consider enabling real-time sync (Phase 3)
- [ ] Add automated tests (Phase 3)

---

**Deployment Date**: _________________  
**Deployed By**: _________________  
**Status**: ⬜ Success ⬜ Failed ⬜ Rolled Back
