import { trace } from '@opentelemetry/api';
import * as Sentry from '@sentry/react';
import { getCurrentTraceId } from './opentelemetry';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  checks: {
    storage: 'ok' | 'error';
  };
}

export interface DownloadCheckRequest {
  file_id: number;
  sentry_test?: boolean;
}

export interface DownloadCheckResponse {
  file_id: number;
  status: 'completed' | 'pending' | 'failed';
  estimated_delay?: number;
  message?: string;
}

export interface DownloadStartRequest {
  file_id: number;
}

export interface DownloadStartResponse {
  job_id: string;
  file_id: number;
  status: 'pending';
  message: string;
}

export interface ErrorResponse {
  error: string;
  message: string;
  details?: unknown;
}

class ApiError extends Error {
  constructor(
    public statusCode: number,
    public errorResponse: ErrorResponse,
    public traceId?: string
  ) {
    super(errorResponse.message);
    this.name = 'ApiError';
  }
}

async function fetchWithTracing<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const tracer = trace.getTracer('delineate-frontend');
  
  return tracer.startActiveSpan(`HTTP ${options.method || 'GET'} ${url}`, async (span) => {
    try {
      // Get current trace ID for correlation
      const traceId = getCurrentTraceId();
      
      // Add trace context to request headers
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      span.setAttribute('http.url', url);
      span.setAttribute('http.method', options.method || 'GET');
      if (traceId) {
        span.setAttribute('trace.id', traceId);
      }

      const startTime = Date.now();
      const response = await fetch(url, { ...options, headers });
      const duration = Date.now() - startTime;

      span.setAttribute('http.status_code', response.status);
      span.setAttribute('http.response_time_ms', duration);

      // Get request ID from response headers
      const requestId = response.headers.get('x-request-id');
      if (requestId) {
        span.setAttribute('request.id', requestId);
      }

      if (!response.ok) {
        const errorData: ErrorResponse = await response.json();
        const error = new ApiError(response.status, errorData, traceId);
        
        // Report error to Sentry with trace context
        Sentry.captureException(error, {
          tags: {
            trace_id: traceId,
            request_id: requestId || undefined,
            status_code: response.status,
          },
          extra: {
            url,
            method: options.method || 'GET',
            errorResponse: errorData,
          },
        });

        span.setStatus({ code: 2, message: error.message });
        span.recordException(error);
        span.end();
        throw error;
      }

      const data = await response.json();
      span.setStatus({ code: 1 }); // OK
      span.end();
      return data as T;
    } catch (error) {
      span.setStatus({ code: 2, message: String(error) });
      span.recordException(error as Error);
      span.end();
      throw error;
    }
  });
}

export const api = {
  async health(): Promise<HealthCheckResponse> {
    return fetchWithTracing<HealthCheckResponse>(`${API_BASE_URL}/health`);
  },

  async downloadCheck(request: DownloadCheckRequest): Promise<DownloadCheckResponse> {
    const params = new URLSearchParams();
    if (request.sentry_test) {
      params.append('sentry_test', 'true');
    }
    
    const url = `${API_BASE_URL}/v1/download/check${params.toString() ? '?' + params.toString() : ''}`;
    return fetchWithTracing<DownloadCheckResponse>(url, {
      method: 'POST',
      body: JSON.stringify({ file_id: request.file_id }),
    });
  },

  async downloadStart(request: DownloadStartRequest): Promise<DownloadStartResponse> {
    return fetchWithTracing<DownloadStartResponse>(`${API_BASE_URL}/v1/download/start`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },
};

export { ApiError };
