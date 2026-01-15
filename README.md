# Screen Coach Hub - Digital Wellbeing App

A professional screen time management and wellness coaching application for families.

## Project info

**URL**: https://lovable.dev/projects/efbe28a2-ea79-4dd8-a955-a30390665a53

## ⚠️ Important: Avoiding White Screen Issues

**Before running the app, you MUST install dependencies:**

```sh
npm install
```

If you see a white screen when running the app, it's likely because dependencies are not installed. See the [Setup Guide](SETUP.md) for detailed troubleshooting steps.

## Quick Start

```sh
# Install dependencies (required to avoid white screen)
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:8080/`

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/efbe28a2-ea79-4dd8-a955-a30390665a53) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd calmcanvas-hub

# Step 3: Install the necessary dependencies (required for the app to run)
npm install

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Note:** Step 3 is essential - skipping `npm install` will result in a white screen when you try to run the app.

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite - Fast build tool and dev server
- TypeScript - Type-safe JavaScript
- React 18 - UI framework
- shadcn-ui - Component library
- Tailwind CSS - Utility-first CSS
- React Router - Client-side routing
- Framer Motion - Animation library
- LocalStorage - Data persistence (no backend required)

## Features

- 📊 **Screen Time Tracking** - Monitor your app usage
- 🎯 **Daily Goals** - Set and track daily screen time limits
- 🔥 **Streaks** - Build healthy habits with streak tracking
- 📈 **Statistics** - View detailed usage analytics
- ⏸️ **Break Reminders** - Take mindful breaks
- 📱 **PWA Support** - Install as a mobile app
- 🔒 **Privacy First** - All data stored locally, no server required

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/efbe28a2-ea79-4dd8-a955-a30390665a53) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Troubleshooting

### White Screen Issue

If you encounter a white screen:

1. **Ensure dependencies are installed:**
   ```sh
   npm install
   ```

2. **Clear cache and reinstall:**
   ```sh
   # Remove node_modules and lock file
   rm -rf node_modules package-lock.json
   
   # Clean install (recommended for consistent dependency resolution)
   npm ci
   
   # Or use regular install
   npm install
   ```
   
   **Note:** Be careful with `rm -rf` commands. Ensure you're in the correct directory.

3. **Check for errors in browser console** (F12 → Console tab)

For more detailed troubleshooting, see [SETUP.md](SETUP.md)

## Available Scripts

- `npm run dev` - Start development server (port 8080)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint code checks
