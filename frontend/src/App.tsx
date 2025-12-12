import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as Sentry from '@sentry/react';
import { DownloadJobs } from './components/DownloadJobs';
import { ErrorBoundary } from './components/ErrorBoundary';
import { HealthStatus } from './components/HealthStatus';
import { PerformanceMetrics } from './components/PerformanceMetrics';
import { TraceViewer } from './components/TraceViewer';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function AppContent() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Download Service Monitor</h1>
              <p className="text-sm text-gray-600 mt-1">
                Real-time monitoring with Sentry & OpenTelemetry
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href={import.meta.env.VITE_JAEGER_UI_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Jaeger UI →
              </a>
              <a
                href="https://sentry.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Sentry →
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <HealthStatus />
            <DownloadJobs />
          </div>
          
          <div className="space-y-6">
            <TraceViewer />
            <PerformanceMetrics />
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Testing Guide</h2>
          <div className="space-y-4 text-sm text-gray-700">
            <div>
              <h3 className="font-semibold mb-2">1. Test Normal Download</h3>
              <p className="text-gray-600">Enter a file ID (e.g., 70000) and click "Check Download" or "Start Download"</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">2. Test Sentry Integration</h3>
              <p className="text-gray-600">
                Check the "Trigger Sentry test error" checkbox and click "Check Download". The error will appear in your Sentry dashboard with trace correlation.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">3. View Distributed Traces</h3>
              <p className="text-gray-600">
                Click "View Trace" on any job to see the full request flow in Jaeger UI, including frontend and backend spans.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            Delineate Hackathon Challenge - CUET Fest 2025
          </p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default Sentry.withProfiler(App);
