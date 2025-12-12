# Quick Reference Card

## 🚀 Quick Start

```bash
# 1. Setup (one time)
npm install
cd frontend && npm install && cd ..
cp .env.example .env
# Edit .env - add Sentry DSN

# 2. Run everything
npm run docker:dev
```

## 🌐 URLs

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:5173 | React UI Dashboard |
| Backend | http://localhost:3000 | Hono API Server |
| API Docs | http://localhost:3000/docs | Interactive API Docs |
| Jaeger UI | http://localhost:16686 | Distributed Traces |
| Sentry | https://sentry.io | Error Dashboard |

## 🔑 Environment Variables

**Required:**
- `VITE_SENTRY_DSN` - Get from sentry.io after creating project

**Optional (have defaults):**
- `VITE_API_BASE_URL` - Backend URL (default: http://localhost:3000)
- `VITE_OTEL_COLLECTOR_URL` - OTel endpoint (default: http://localhost:4318/v1/traces)
- `VITE_JAEGER_UI_URL` - Jaeger URL (default: http://localhost:16686)

## 📝 Common Commands

```bash
# Backend
npm run dev          # Development server
npm run start        # Production server
npm run lint         # Lint code
npm run test:e2e     # Run E2E tests

# Frontend
cd frontend
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Preview production build

# Docker
npm run docker:dev   # Start dev stack
npm run docker:prod  # Start prod stack
docker compose -f docker/compose.dev.yml down  # Stop
```

## 🧪 Testing Checklist

### ✅ Test Health Monitoring
1. Open http://localhost:5173
2. See health status (should be green)
3. Watch it refresh every 5 seconds

### ✅ Test Download Job
1. Enter file ID: `70000`
2. Click "Check Download" or "Start Download"
3. See job in the list

### ✅ Test Sentry Integration
1. Enter file ID: `70000`
2. ✓ Check "Trigger Sentry test error"
3. Click "Check Download"
4. Go to Sentry dashboard - see the error!

### ✅ Test Distributed Tracing
1. Make any API call
2. Click "View Trace" on the job
3. See the full trace in Jaeger UI

### ✅ Test Error Boundary
1. Open browser DevTools console
2. Type: `throw new Error("Test")`
3. See error boundary UI
4. Check Sentry for the error

## 🔍 Debugging

### Check Backend Health
```bash
curl http://localhost:3000/health
```

### Check Frontend is Running
```bash
curl http://localhost:5173
```

### View Docker Logs
```bash
# All services
docker compose -f docker/compose.dev.yml logs -f

# Specific service
docker compose -f docker/compose.dev.yml logs -f delineate-frontend
docker compose -f docker/compose.dev.yml logs -f delineate-app
docker compose -f docker/compose.dev.yml logs -f delineate-jaeger
```

### Check OpenTelemetry
```bash
# Should show traces being sent
# Open browser DevTools → Console
# Look for: "OpenTelemetry initialized successfully"
```

## 🐛 Common Issues

### Sentry errors not showing
- ✓ Check DSN is in .env
- ✓ Restart frontend after adding DSN
- ✓ Check browser console for errors
- ✓ Not in incognito mode

### Traces not in Jaeger
- ✓ Jaeger is running: http://localhost:16686
- ✓ Wait 10-15 seconds (batched)
- ✓ Check OTEL_COLLECTOR_URL in .env

### CORS errors
- ✓ Backend CORS_ORIGINS includes http://localhost:5173
- ✓ Both services running
- ✓ Restart backend after changing .env

### Port already in use
```bash
# Find what's using the port
# Windows
netstat -ano | findstr :5173
netstat -ano | findstr :3000

# Linux/Mac
lsof -i :5173
lsof -i :3000

# Kill the process or change port in config
```

## 📊 Architecture Overview

```
Browser (User)
    ↓
Frontend (React)
    ↓ fetch() with traceparent header
Backend (Hono)
    ↓ continues trace
OpenTelemetry → Jaeger (traces)
    ↓
Sentry (errors with trace_id)
```

## 🎯 Key Features

1. **Error Tracking**
   - Automatic capture
   - User feedback dialogs
   - Trace correlation

2. **Distributed Tracing**
   - Frontend → Backend
   - W3C Trace Context
   - Full request flow

3. **Real-time Monitoring**
   - Health status
   - Job tracking
   - Performance metrics

4. **Trace Correlation**
   - Errors tagged with trace_id
   - Link from Sentry to Jaeger
   - End-to-end visibility

## 📚 Documentation Files

| File | Description |
|------|-------------|
| SETUP.md | Complete setup guide |
| frontend/README.md | Frontend documentation |
| FRONTEND_IMPLEMENTATION.md | Implementation details |
| README.md | Main project README |

## 🔗 Useful Links

- [Sentry Docs](https://docs.sentry.io/platforms/javascript/guides/react/)
- [OpenTelemetry Docs](https://opentelemetry.io/docs/instrumentation/js/)
- [Jaeger Docs](https://www.jaegertracing.io/)
- [React Query Docs](https://tanstack.com/query/latest)

## 💡 Pro Tips

1. **View Trace IDs**: Every job shows a trace ID - click "View Trace"
2. **Error Correlation**: Errors in Sentry include trace_id tag
3. **Real-time Updates**: Health status auto-refreshes every 5s
4. **Test Safely**: Use file_id 70000 for testing
5. **Docker Logs**: Use `docker compose logs -f` to watch everything

## 🎓 Learning Path

1. Start the app and explore the UI
2. Make a normal API call - see the trace
3. Trigger a Sentry error - see correlation
4. Read frontend/README.md for deep dive
5. Modify components to add features

---

**Need Help?**
- Check SETUP.md for detailed instructions
- Read frontend/README.md for frontend specifics
- Open an issue in the repository
