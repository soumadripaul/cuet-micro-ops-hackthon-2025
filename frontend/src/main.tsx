import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeOpenTelemetry } from './lib/opentelemetry';
import { initializeSentry } from './lib/sentry';

// Initialize observability
initializeSentry();
initializeOpenTelemetry();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
