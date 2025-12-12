import React, { Component, ErrorInfo, ReactNode } from "react";
import * as Sentry from "@sentry/react";
import { getCurrentTraceId } from "../lib/opentelemetry";

interface Props {
  children: ReactNode;
  fallback?: (
    error: Error,
    errorInfo: ErrorInfo,
    traceId?: string,
  ) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  traceId?: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      traceId: getCurrentTraceId(),
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const traceId = getCurrentTraceId();

    // Log error to console
    console.error("Error caught by boundary:", error, errorInfo);

    // Send to Sentry with trace context
    Sentry.captureException(error, {
      tags: {
        trace_id: traceId,
        error_boundary: "true",
      },
      extra: {
        errorInfo,
        componentStack: errorInfo.componentStack,
      },
    });

    // Update state
    this.setState({
      error,
      errorInfo,
      traceId,
    });

    // Show user feedback dialog
    if (traceId) {
      Sentry.showReportDialog({
        eventId: Sentry.lastEventId(),
        title: "It looks like we're having issues.",
        subtitle: "Our team has been notified.",
        subtitle2: `Trace ID: ${traceId}`,
        labelName: "Name",
        labelEmail: "Email",
        labelComments: "What happened?",
        labelClose: "Close",
        labelSubmit: "Submit",
      });
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(
          this.state.error!,
          this.state.errorInfo!,
          this.state.traceId,
        );
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center mb-6">
              <div className="flex-shrink-0">
                <svg
                  className="h-12 w-12 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-gray-900">
                  Something went wrong
                </h1>
                <p className="text-gray-600 mt-1">
                  We've been notified and are looking into it.
                </p>
              </div>
            </div>

            {this.state.traceId && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Trace ID:</span>{" "}
                  <code className="bg-blue-100 px-2 py-1 rounded">
                    {this.state.traceId}
                  </code>
                </p>
                <p className="text-xs text-blue-600 mt-2">
                  Include this ID when reporting the issue for faster debugging.
                </p>
              </div>
            )}

            <details className="mb-6">
              <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                Error Details
              </summary>
              <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200">
                <p className="text-sm font-mono text-red-600 mb-2">
                  {this.state.error?.toString()}
                </p>
                {this.state.errorInfo && (
                  <pre className="text-xs text-gray-600 overflow-auto">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            </details>

            <div className="flex space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Reload Page
              </button>
              <button
                onClick={() =>
                  this.setState({
                    hasError: false,
                    error: null,
                    errorInfo: null,
                  })
                }
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
