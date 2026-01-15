# Setup Guide

## Prerequisites

- Node.js (v18 or higher recommended)
- npm (comes with Node.js)

## Installation Steps

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd calmcanvas-hub
```

### 2. Install Dependencies

**IMPORTANT:** You must install dependencies before running the app to avoid white screen issues.

```bash
npm install
```

This will install all required packages including React, Vite, and UI components.

### 3. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:8080/`

### 4. Build for Production

```bash
npm run build
```

### 5. Preview Production Build

```bash
npm run preview
```

## Troubleshooting

### White Screen Issue

If you encounter a white screen when running the app:

1. **Check if dependencies are installed:**
   ```bash
   ls node_modules/
   ```
   If this directory doesn't exist or is empty, run:
   ```bash
   npm install
   ```

2. **Clear cache and reinstall:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Check browser console for errors:**
   Open Developer Tools (F12) and check the Console tab for any error messages.

4. **Verify Node.js version:**
   ```bash
   node --version
   ```
   Should be v18.0.0 or higher.

### Port Already in Use

If port 8080 is already in use, you can change it in `vite.config.ts`:

```typescript
server: {
  host: "::",
  port: 3000, // Change to your preferred port
},
```

## Common Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
calmcanvas-hub/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Page components
│   ├── services/       # Local storage and services
│   ├── contexts/       # React contexts
│   ├── hooks/          # Custom React hooks
│   ├── utils/          # Utility functions
│   └── main.tsx        # App entry point
├── public/             # Static assets
└── index.html          # HTML template
```

## Features

- **Screen Time Tracking:** Monitor app usage
- **Digital Wellbeing:** Set daily goals and limits
- **Streaks:** Track your progress
- **Statistics:** View usage analytics
- **Breaks:** Take mindful breaks
- **PWA Support:** Install as a progressive web app

## Support

For issues or questions, please open an issue on GitHub.
