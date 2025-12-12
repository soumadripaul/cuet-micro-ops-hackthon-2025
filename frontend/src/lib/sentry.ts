import * as Sentry from "@sentry/react";

export function initializeSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  const environment = import.meta.env.VITE_SENTRY_ENVIRONMENT || "development";

  if (!dsn) {
    console.warn("Sentry DSN not configured. Error tracking disabled.");
    return;
  }

  Sentry.init({
    dsn,
    environment,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],

    // Performance Monitoring
    tracesSampleRate: 1.0, // Capture 100% of transactions for development
    tracePropagationTargets: [
      "localhost",
      /^http:\/\/localhost:3000\/v1/,
      /^http:\/\/delineate-app:3000\/v1/,
    ],

    // Session Replay
    replaysSessionSampleRate: 0.1, // 10% of sessions
    replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors

    beforeSend(event, hint) {
      // Add trace context to error events
      const traceId = event.contexts?.trace?.trace_id;
      if (traceId) {
        event.tags = {
          ...event.tags,
          trace_id: traceId,
        };
      }
      return event;
    },
  });
}

export { Sentry };
