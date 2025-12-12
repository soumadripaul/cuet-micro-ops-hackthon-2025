# Complete Setup Guide

This guide walks you through setting up the entire system including the backend API, frontend UI, and observability stack.

## Prerequisites

- **Node.js 24+**
- **Docker & Docker Compose**
- **Git**
- **Sentry Account** (free tier available at [sentry.io](https://sentry.io))

## Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd cuet-micro-ops-hackthon-2025
```

### 2. Set Up Backend Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env and configure (at minimum):
# - S3 storage settings (if using self-hosted storage)
# - CORS_ORIGINS=http://localhost:5173
```

### 3. Set Up Sentry (Required for Error Tracking)

#### Create a Sentry Account

1. Go to [sentry.io](https://sentry.io) and sign up
2. Click "Create Project"
3. Select **React** as the platform
4. Name your project (e.g., "delineate-frontend")
5. Click "Create Project"

#### Get Your DSN

After creating the project, you'll see a DSN that looks like:

```
https://abc123def456@o123456.ingest.sentry.io/7890123
```

#### Add DSN to Environment

Edit the `.env` file in the project root:

```bash
# Add this line to .env
VITE_SENTRY_DSN=https://abc123def456@o123456.ingest.sentry.io/7890123
```

### 4. Set Up Frontend Environment

```bash
cd frontend
cp .env.example .env

# The .env file will be automatically populated from the root .env
# But you can also customize it if needed
cd ..
```

### 5. Install Dependencies

#### Backend

```bash
npm install
```

#### Frontend

```bash
cd frontend
npm install
cd ..
```

### 6. Run the Full Stack with Docker

This is the recommended approach as it sets up everything automatically.

```bash
# Start all services (backend, frontend, Jaeger)
npm run docker:dev
```

This will start:

- **Backend API**: http://localhost:3000
- **Frontend UI**: http://localhost:5173
- **Jaeger UI**: http://localhost:16686

### 7. Verify the Setup

#### Check Backend Health

```bash
curl http://localhost:3000/health
```

Expected response:

```json
{
  "status": "healthy",
  "timestamp": "2025-12-12T...",
  "checks": {
    "storage": "ok"
  }
}
```

#### Check Frontend

1. Open http://localhost:5173
2. You should see the Download Service Monitor dashboard

#### Check Jaeger

1. Open http://localhost:16686
2. You should see the Jaeger UI

### 8. Test Sentry Integration

1. Go to http://localhost:5173
2. Enter **File ID**: `70000`
3. Check the box: **"Trigger Sentry test error"**
4. Click **"Check Download"**
5. Go to your Sentry dashboard
6. You should see the error! 🎉

### 9. Test Distributed Tracing

1. In the frontend, enter **File ID**: `70000`
2. Click **"Check Download"** (without Sentry test enabled)
3. After the request completes, click **"View Trace"** on the job entry
4. This opens Jaeger UI with the full trace showing:
   - Frontend span
   - HTTP request span
   - Backend API span

## Alternative: Run Services Separately

If you prefer not to use Docker, you can run services individually:

### Terminal 1: Backend

```bash
npm run dev
```

### Terminal 2: Frontend

```bash
cd frontend
npm run dev
```

### Terminal 3: Jaeger (Optional, via Docker)

```bash
docker run -d --name jaeger \
  -e COLLECTOR_OTLP_ENABLED=true \
  -p 16686:16686 \
  -p 4318:4318 \
  jaegertracing/all-in-one:latest
```

## Using the Application

### Health Monitoring

The dashboard automatically monitors API health every 5 seconds. You'll see:

- Overall status (healthy/unhealthy)
- Storage status (ok/error)
- Last check timestamp

### Download Jobs

#### Check Download Status

1. Enter a file ID (e.g., `70000`)
2. Click "Check Download"
3. View the result in the jobs list

#### Start Download

1. Enter a file ID
2. Click "Start Download"
3. A new job will be created (this may take 10-120 seconds due to simulated processing)

#### Test Error Tracking

1. Enter a file ID
2. Enable "Trigger Sentry test error" checkbox
3. Click "Check Download"
4. Error will be:
   - Shown in the jobs list
   - Captured in Sentry
   - Tagged with trace ID
   - Visible in Jaeger

### Viewing Traces

All requests create distributed traces. To view them:

1. **From the UI**: Click "View Trace" on any job entry
2. **Jaeger UI**: Go to http://localhost:16686
   - Select service: `delineate-frontend` or `delineate-hackathon-challenge`
   - Click "Find Traces"
   - Browse traces to see the request flow

### Correlating Errors and Traces

When an error occurs:

1. Note the **Trace ID** shown in the error (in Sentry or UI)
2. Go to Jaeger UI
3. Search for the trace ID
4. See the exact request flow that led to the error

## Understanding the Architecture

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Browser   │────────▶│   Frontend  │────────▶│   Backend   │
│             │         │   (React)   │         │   (Hono)    │
└─────────────┘         └─────────────┘         └─────────────┘
                              │                        │
                              │                        │
                              ▼                        ▼
                        ┌──────────────────────────────────┐
                        │     OpenTelemetry Collector      │
                        │            (Jaeger)              │
                        └──────────────────────────────────┘
                              │                        │
                              │                        │
                              ▼                        ▼
                        ┌─────────────┐         ┌─────────────┐
                        │   Sentry    │         │  Jaeger UI  │
                        │   (Errors)  │         │  (Traces)   │
                        └─────────────┘         └─────────────┘
```

### Trace Flow

1. User clicks button in frontend
2. Frontend creates a span with unique trace ID
3. HTTP request includes `traceparent` header with trace context
4. Backend continues the same trace
5. All spans sent to Jaeger
6. Errors tagged with trace ID in Sentry

## Troubleshooting

### Backend won't start

**Check:**

- Node.js version: `node --version` (should be 24+)
- Port 3000 is available
- .env file exists

### Frontend won't start

**Check:**

- Dependencies installed: `cd frontend && npm install`
- Port 5173 is available
- .env file exists with Sentry DSN

### Sentry errors not appearing

**Check:**

- DSN is correct in .env
- Frontend has restarted after adding DSN
- Check browser console for Sentry initialization logs
- Ensure not in private/incognito mode

### Traces not in Jaeger

**Check:**

- Jaeger is running: http://localhost:16686
- Give it 10-15 seconds (traces are batched)
- Check browser console for OpenTelemetry logs
- Verify OTLP endpoint: http://localhost:4318

### CORS errors

**Check:**

- Backend .env has: `CORS_ORIGINS=http://localhost:5173`
- Backend has been restarted
- Both services are running

### Docker issues

**Check:**

- Docker is running: `docker ps`
- No port conflicts: `docker ps` to see what's running
- Try: `docker compose -f docker/compose.dev.yml down` then restart

## Production Deployment

For production deployment:

1. Update environment variables:

```bash
NODE_ENV=production
VITE_SENTRY_ENVIRONMENT=production
VITE_API_BASE_URL=https://api.yourdomain.com
CORS_ORIGINS=https://yourdomain.com
```

2. Build and run:

```bash
npm run docker:prod
```

3. Consider:

- Using a reverse proxy (nginx/Cloudflare)
- Setting up SSL certificates
- Configuring proper S3/storage backend
- Scaling considerations for high traffic

## Next Steps

1. **Explore the API**: Visit http://localhost:3000/docs for interactive API documentation
2. **Read Frontend Docs**: See [frontend/README.md](frontend/README.md) for detailed frontend documentation
3. **Customize**: Modify the frontend to add more features
4. **Deploy**: Follow the production deployment guide

## Getting Help

- Check the documentation in `frontend/README.md`
- Review Sentry docs: https://docs.sentry.io/platforms/javascript/guides/react/
- Review OpenTelemetry docs: https://opentelemetry.io/docs/instrumentation/js/
- Open an issue in the repository

## Summary

You now have:

- ✅ Backend API with OpenTelemetry tracing
- ✅ React frontend with real-time monitoring
- ✅ Sentry error tracking with user feedback
- ✅ Distributed tracing with Jaeger
- ✅ Full trace correlation between errors and traces
- ✅ Docker Compose setup for easy development

Happy coding! 🚀
