import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerServiceWorker, setupPWAUpdateHandler } from './utils/pwa'
import { ErrorBoundary } from './components/ErrorBoundary'

// Register service worker for PWA functionality
registerServiceWorker();
setupPWAUpdateHandler();

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
