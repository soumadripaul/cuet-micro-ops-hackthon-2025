# Download Service Monitor Frontend

A modern React application with integrated Sentry error tracking and OpenTelemetry distributed tracing for monitoring the download service.

## Features

- 🎯 **Real-time Health Monitoring** - Track API health and storage status
- 📥 **Download Job Management** - Initiate and monitor download jobs
- 🐛 **Sentry Integration** - Comprehensive error tracking with user feedback
- 📊 **OpenTelemetry Tracing** - End-to-end distributed tracing from frontend to backend
- 🔍 **Trace Correlation** - Link errors in Sentry with traces in Jaeger
- 📈 **Performance Metrics** - Monitor API response times and success rates

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **TailwindCSS** - Styling
- **TanStack Query** - Data fetching and state management
- **Sentry** - Error tracking and performance monitoring
- **OpenTelemetry** - Distributed tracing

## Prerequisites

1. **Node.js 24+** - Required for running the frontend
2. **Sentry Account** - For error tracking
   - Sign up at [sentry.io](https://sentry.io)
   - Create a new project (React)
   - Get your DSN from Project Settings → Client Keys (DSN)
3. **Backend API** - The download service must be running
4. **Jaeger** - For trace visualization (included in Docker Compose)

## Quick Start

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and add your Sentry DSN:

```env
# Sentry Configuration
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
VITE_SENTRY_ENVIRONMENT=development

# API Configuration
VITE_API_BASE_URL=http://localhost:3000

# OpenTelemetry Configuration
VITE_OTEL_COLLECTOR_URL=http://localhost:4318/v1/traces
VITE_OTEL_SERVICE_NAME=delineate-frontend

# Jaeger UI URL for trace viewing
VITE_JAEGER_UI_URL=http://localhost:16686
```

### 3. Run the Application

#### Option A: Standalone Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

#### Option B: With Docker Compose (Recommended)

From the project root:

```bash
# Development mode
npm run docker:dev

# Production mode
npm run docker:prod
```

This starts:

- Backend API on `http://localhost:3000`
- Frontend on `http://localhost:5173`
- Jaeger UI on `http://localhost:16686`

## Setting Up Sentry

### Step 1: Create a Sentry Project

1. Go to [sentry.io](https://sentry.io) and sign up/log in
2. Click "Create Project"
3. Choose "React" as the platform
4. Set an alert frequency (optional)
5. Name your project (e.g., "delineate-frontend")
6. Click "Create Project"

### Step 2: Get Your DSN

1. After creating the project, you'll see setup instructions
2. Copy the DSN (it looks like: `https://abc123@o123456.ingest.sentry.io/7890123`)
3. Add it to your `.env` file:

```env
VITE_SENTRY_DSN=https://abc123@o123456.ingest.sentry.io/7890123
```

### Step 3: Verify Integration

1. Start the application
2. In the UI, enter a file ID (e.g., 70000)
3. Check "Trigger Sentry test error"
4. Click "Check Download"
5. Go to your Sentry dashboard - you should see the error!

## Setting Up OpenTelemetry

OpenTelemetry is pre-configured to work with the Jaeger instance in Docker Compose.

### How It Works

1. **Frontend Instrumentation**
   - Automatically traces all `fetch` requests
   - Propagates trace context via HTTP headers
   - Creates spans for user interactions

2. **Trace Propagation**
   - Frontend creates a trace with ID (e.g., `abc123`)
   - Adds `traceparent` header to API requests
   - Backend continues the trace with the same ID

3. **Trace Viewing**
   - All traces are sent to Jaeger collector
   - View in Jaeger UI at `http://localhost:16686`

### Viewing Traces

1. Make a request from the UI (check or start download)
2. Click "View Trace" on the job entry
3. Or open Jaeger UI manually and search for traces

### Trace Correlation with Sentry

When an error occurs:

1. Sentry captures the error
2. Error is tagged with `trace_id`
3. Use the trace ID to find the corresponding trace in Jaeger
4. See the full request flow that led to the error

## Application Features

### 1. Health Status Dashboard

Monitors the API health in real-time:

- Overall service status
- Storage connectivity
- Auto-refreshes every 5 seconds

### 2. Download Jobs

Manage download jobs:

- **Check Download**: Verify file status
- **Start Download**: Initiate a new download
- **Sentry Test**: Trigger a test error for Sentry
- View job history with trace links

### 3. Trace Viewer

Direct access to Jaeger UI with instructions on:

- How distributed tracing works
- End-to-end trace correlation
- Frontend → Backend trace flow

### 4. Performance Metrics

Track API performance:

- Success rate
- Failure count
- Average response time

## Testing the Integration

### Test 1: Normal API Call

1. Enter file ID: `70000`
2. Click "Check Download"
3. ✅ See the result in the jobs list
4. 📊 Click "View Trace" to see the trace in Jaeger

### Test 2: Sentry Error Tracking

1. Enter file ID: `70000`
2. ✅ Check "Trigger Sentry test error"
3. Click "Check Download"
4. ❌ See the error in the jobs list
5. 🐛 Check your Sentry dashboard for the error
6. 📊 Note the trace ID in both Sentry and Jaeger

### Test 3: Error Boundary

1. Open browser DevTools → Console
2. Type: `throw new Error("Test error")`
3. ❌ See the error boundary UI
4. 🐛 Check Sentry for the captured error
5. 📊 Note the trace ID displayed in the UI

## Project Structure

```text
frontend/
├── src/
│   ├── components/
│   │   ├── ErrorBoundary.tsx      # React error boundary with Sentry
│   │   ├── HealthStatus.tsx       # Health monitoring component
│   │   ├── DownloadJobs.tsx       # Download job management
│   │   ├── TraceViewer.tsx        # Jaeger UI integration
│   │   └── PerformanceMetrics.tsx # Metrics dashboard
│   ├── lib/
│   │   ├── sentry.ts              # Sentry configuration
│   │   ├── opentelemetry.ts       # OpenTelemetry setup
│   │   └── api.ts                 # API client with tracing
│   ├── App.tsx                    # Main app component
│   ├── main.tsx                   # Entry point
│   └── index.css                  # Styles
├── docker/
│   ├── Dockerfile.frontend.dev    # Development Docker image
│   └── Dockerfile.frontend.prod   # Production Docker image
└── package.json
```

## Environment Variables Reference

| Variable                  | Description                      | Example                           |
| ------------------------- | -------------------------------- | --------------------------------- |
| `VITE_SENTRY_DSN`         | Sentry project DSN               | `https://...@sentry.io/123`       |
| `VITE_SENTRY_ENVIRONMENT` | Environment name                 | `development` / `production`      |
| `VITE_API_BASE_URL`       | Backend API URL                  | `http://localhost:3000`           |
| `VITE_OTEL_COLLECTOR_URL` | OpenTelemetry collector endpoint | `http://localhost:4318/v1/traces` |
| `VITE_OTEL_SERVICE_NAME`  | Service name in traces           | `delineate-frontend`              |
| `VITE_JAEGER_UI_URL`      | Jaeger UI URL                    | `http://localhost:16686`          |

## Troubleshooting

### Sentry errors not appearing

1. Check that `VITE_SENTRY_DSN` is set correctly in `.env`
2. Verify the DSN is valid in your Sentry project settings
3. Check browser console for Sentry initialization logs
4. Ensure the app is not in private/incognito mode (some browsers block tracking)

### Traces not showing in Jaeger

1. Verify Jaeger is running: `http://localhost:16686`
2. Check `VITE_OTEL_COLLECTOR_URL` is correct
3. Look for OpenTelemetry initialization logs in browser console
4. Try waiting a few seconds - traces are batched before sending

### CORS errors

1. Ensure backend `CORS_ORIGINS` includes `http://localhost:5173`
2. Check that both frontend and backend are running
3. Verify network configuration in Docker Compose

### API connection failed

1. Verify backend is running on `http://localhost:3000`
2. Check backend health: `curl http://localhost:3000/health`
3. Ensure `.env` variables are loaded (restart dev server)

## Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Adding New Features

1. **Add a new component**: Create in `src/components/`
2. **Add API endpoint**: Update `src/lib/api.ts`
3. **Add custom span**: Use `createSpan()` from `src/lib/opentelemetry.ts`

Example custom span:

```typescript
import { createSpan } from "./lib/opentelemetry";

await createSpan("custom-operation", async (span) => {
  span.setAttribute("user.id", userId);
  // Your code here
});
```

## Architecture

### End-to-End Trace Flow

```text
User clicks "Download" button
        ↓
Frontend creates span with trace-id: abc123
        ↓
API request includes header: traceparent: 00-abc123-...
        ↓
Backend continues trace with trace_id=abc123
        ↓
Backend logs include: trace_id=abc123
        ↓
Errors in Sentry tagged with: trace_id=abc123
        ↓
All spans sent to Jaeger for visualization
```

### Error Handling

1. **API Errors**: Caught by TanStack Query, reported to Sentry
2. **Component Errors**: Caught by ErrorBoundary, reported to Sentry
3. **Network Errors**: Caught by fetch instrumentation, reported to Sentry
4. **All errors** include trace ID for correlation

## Production Deployment

### Building for Production

```bash
npm run build
```

Creates optimized bundle in `dist/`

### Docker Production Build

```bash
docker compose -f docker/compose.prod.yml up --build -d
```

### Environment Configuration

For production, update:

```env
VITE_SENTRY_ENVIRONMENT=production
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_JAEGER_UI_URL=https://jaeger.yourdomain.com
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

See LICENSE file in the project root.

## Support

For issues and questions:

- Check [Sentry Documentation](https://docs.sentry.io/platforms/javascript/guides/react/)
- Check [OpenTelemetry Documentation](https://opentelemetry.io/docs/instrumentation/js/)
- Open an issue in the project repository
