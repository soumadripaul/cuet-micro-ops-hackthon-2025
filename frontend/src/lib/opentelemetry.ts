import { context, trace, Span } from '@opentelemetry/api';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { Resource } from '@opentelemetry/resources';
import { BatchSpanProcessor, WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';

let tracer: ReturnType<typeof trace.getTracer>;

export function initializeOpenTelemetry() {
  const collectorUrl = import.meta.env.VITE_OTEL_COLLECTOR_URL;
  const serviceName = import.meta.env.VITE_OTEL_SERVICE_NAME || 'delineate-frontend';

  if (!collectorUrl) {
    console.warn('OpenTelemetry collector URL not configured. Tracing disabled.');
    return;
  }

  // Create a resource with service name
  const resource = Resource.default().merge(
    new Resource({
      [ATTR_SERVICE_NAME]: serviceName,
    })
  );

  // Create a tracer provider
  const provider = new WebTracerProvider({
    resource,
  });

  // Add exporter to send traces to collector
  const exporter = new OTLPTraceExporter({
    url: collectorUrl,
  });

  provider.addSpanProcessor(new BatchSpanProcessor(exporter));

  // Register the provider with zone context manager
  provider.register({
    contextManager: new ZoneContextManager(),
  });

  // Register fetch instrumentation to auto-trace HTTP requests
  registerInstrumentations({
    instrumentations: [
      new FetchInstrumentation({
        propagateTraceHeaderCorsUrls: [
          /localhost:3000/,
          /delineate-app:3000/,
        ],
        clearTimingResources: true,
        applyCustomAttributesOnSpan: (span, request, response) => {
          // Add custom attributes
          if (request instanceof Request) {
            span.setAttribute('http.request.url', request.url);
          }
          if (response instanceof Response) {
            span.setAttribute('http.response.status_code', response.status);
          }
        },
      }),
    ],
  });

  // Create tracer
  tracer = trace.getTracer(serviceName);
  
  console.log('OpenTelemetry initialized successfully');
}

export function getTracer() {
  if (!tracer) {
    throw new Error('OpenTelemetry not initialized. Call initializeOpenTelemetry first.');
  }
  return tracer;
}

export function createSpan(name: string, fn: (span: Span) => Promise<void> | void) {
  const tracer = getTracer();
  return tracer.startActiveSpan(name, async (span) => {
    try {
      await fn(span);
      span.setStatus({ code: 1 }); // OK
    } catch (error) {
      span.setStatus({ code: 2, message: String(error) }); // ERROR
      span.recordException(error as Error);
      throw error;
    } finally {
      span.end();
    }
  });
}

export function getCurrentTraceId(): string | undefined {
  const activeSpan = trace.getActiveSpan();
  if (activeSpan) {
    const spanContext = activeSpan.spanContext();
    return spanContext.traceId;
  }
  return undefined;
}

export { context, trace };
