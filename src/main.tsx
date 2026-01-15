import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerServiceWorker, setupPWAUpdateHandler } from './utils/pwa'
import { ErrorBoundary } from './components/ErrorBoundary'

const isDev = import.meta.env.DEV;

if (isDev) {
  console.log('Screen Coach: Initializing application...');
}

// Register service worker for PWA functionality
registerServiceWorker().then(() => {
  if (isDev) console.log('Screen Coach: Service worker registered');
}).catch((error) => {
  console.warn('Screen Coach: Service worker registration failed', error);
});

setupPWAUpdateHandler();

const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error('Screen Coach: Root element not found!');
  throw new Error('Root element not found');
}

if (isDev) {
  console.log('Screen Coach: Mounting React app...');
}

createRoot(rootElement).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

if (isDev) {
  console.log('Screen Coach: React app mounted successfully');
}
