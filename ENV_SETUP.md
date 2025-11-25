# Environment Variables Setup Guide

## Problem: Black Screen When Switching to Your Own Supabase

If you're seeing a black screen after switching from Lovable's Supabase to your own, it's likely because the environment variables are not properly configured.

## Solution: Create a .env File

1. **Create a `.env` file in the root directory of your project** (same level as `package.json`)

2. **Add the following content to your `.env` file:**

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key_here

# Optional: Project ID (for reference)
VITE_SUPABASE_PROJECT_ID=your_project_id_here
```

3. **Where to find your Supabase credentials:**
   - Go to https://app.supabase.com
   - Select your project
   - Go to Settings → API
   - Copy:
     - **Project URL** → use for `VITE_SUPABASE_URL`
     - **anon/public key** → use for `VITE_SUPABASE_PUBLISHABLE_KEY`
     - **Project ID** → use for `VITE_SUPABASE_PROJECT_ID` (optional)

## Example .env File

```env
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.example
```

## Important Steps After Creating .env

1. **Rebuild your app:**
   ```bash
   npm run build
   ```

2. **Sync Capacitor (for Android):**
   ```bash
   npx cap sync
   ```

3. **Rebuild in Android Studio:**
   - Clean and rebuild your Android project
   - The environment variables are embedded during the Vite build process

## Verify Your Setup

1. Open your browser console (F12)
2. Look for these logs when the app starts:
   - ✅ "Supabase client initialized with URL: ..."
   - ✅ "App attempting to connect to Supabase Project: ..."

3. If you see errors about missing environment variables, check:
   - The `.env` file is in the project root
   - No typos in variable names (must start with `VITE_`)
   - You've rebuilt the app after creating/changing `.env`

## Common Issues

### Issue 1: Still seeing black screen
- Make sure you rebuilt the app: `npm run build`
- Clear your browser cache or Android app data
- Check browser console for error messages

### Issue 2: Environment variables not loading
- Vite only loads `.env` files at build time
- Make sure to run `npm run build` after changing `.env`
- For Android, run `npx cap sync` after building

### Issue 3: CORS errors
- In Supabase Dashboard → Settings → API → check CORS settings
- Ensure your app URL is in the allowed origins

### Issue 4: Authentication not working
- Verify your Supabase URL and key are correct
- Check Supabase project settings → Authentication → Site URL
- Ensure you've run the SQL migrations in your Supabase project

## Additional Notes

- The `.env` file is ignored by git (see `.gitignore`)
- Never commit your `.env` file to version control
- For production builds, set environment variables in your deployment platform

