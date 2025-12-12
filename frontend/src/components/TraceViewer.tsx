import { ExternalLink } from "lucide-react";

const JAEGER_UI_URL =
  import.meta.env.VITE_JAEGER_UI_URL || "http://localhost:16686";

export function TraceViewer() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Distributed Tracing</h2>

      <div className="space-y-4">
        <p className="text-gray-600 text-sm">
          View distributed traces to debug and analyze request flows across the
          frontend and backend.
        </p>

        <a
          href={JAEGER_UI_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Open Jaeger UI
          <ExternalLink className="ml-2 h-4 w-4" />
        </a>

        <div className="mt-6 p-4 bg-gray-50 rounded-md border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            How Tracing Works
          </h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-start">
              <span className="mr-2">1.</span>
              <span>User actions in the frontend create trace spans</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">2.</span>
              <span>Trace context propagates to backend via HTTP headers</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">3.</span>
              <span>Backend continues the trace with its operations</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">4.</span>
              <span>All spans are exported to Jaeger for visualization</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">5.</span>
              <span>Errors in Sentry are tagged with trace IDs</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
