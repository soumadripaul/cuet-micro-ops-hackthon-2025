import { BarChart3, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { registerMetricsUpdater } from "../lib/api";

interface MetricData {
  successCount: number;
  failureCount: number;
  avgResponseTime: number;
  totalRequests: number;
}

// Global metrics storage
const metricsStore = {
  successCount: 0,
  failureCount: 0,
  responseTimes: [] as number[],
  totalRequests: 0,
};

// Function to update metrics from API calls
function updateMetrics(success: boolean, responseTime: number) {
  console.log(`[Metrics] API Call: ${success ? 'Success' : 'Failed'}, Response Time: ${responseTime}ms`);
  metricsStore.totalRequests++;
  if (success) {
    metricsStore.successCount++;
  } else {
    metricsStore.failureCount++;
  }
  metricsStore.responseTimes.push(responseTime);
  // Keep only last 100 response times
  if (metricsStore.responseTimes.length > 100) {
    metricsStore.responseTimes.shift();
  }
  console.log(`[Metrics] Total: ${metricsStore.totalRequests}, Success: ${metricsStore.successCount}, Failed: ${metricsStore.failureCount}`);
}

export function PerformanceMetrics() {
  const [metrics, setMetrics] = useState<MetricData>({
    successCount: 0,
    failureCount: 0,
    avgResponseTime: 0,
    totalRequests: 0,
  });

  // Register metrics updater and update metrics display from global store
  useEffect(() => {
    // Register the updater function with the API
    console.log('[Metrics] Registering metrics updater');
    registerMetricsUpdater(updateMetrics);

    const updateDisplay = () => {
      const avgResponseTime =
        metricsStore.responseTimes.length > 0
          ? Math.round(
              metricsStore.responseTimes.reduce((a, b) => a + b, 0) /
                metricsStore.responseTimes.length
            )
          : 0;

      setMetrics({
        successCount: metricsStore.successCount,
        failureCount: metricsStore.failureCount,
        avgResponseTime,
        totalRequests: metricsStore.totalRequests,
      });
    };

    // Update every second
    const interval = setInterval(updateDisplay, 1000);
    updateDisplay(); // Initial update

    return () => clearInterval(interval);
  }, []);

  const successRate =
    metrics.totalRequests > 0
      ? ((metrics.successCount / metrics.totalRequests) * 100).toFixed(1)
      : "0.0";

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center">
          <BarChart3 className="mr-2 h-5 w-5" />
          Performance Metrics
        </h2>
        {metrics.totalRequests > 0 && (
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-600 font-medium">LIVE</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-green-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-green-600 font-medium">
              Success Rate
            </span>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-700 mt-2">
            {successRate}%
          </p>
          <p className="text-xs text-green-600 mt-1">
            {metrics.successCount} / {metrics.totalRequests} requests
          </p>
        </div>

        <div className="p-4 bg-red-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-red-600 font-medium">Failures</span>
          </div>
          <p className="text-2xl font-bold text-red-700 mt-2">
            {metrics.failureCount}
          </p>
          <p className="text-xs text-red-600 mt-1">Failed requests</p>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg col-span-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-600 font-medium">
              Avg Response Time
            </span>
          </div>
          <p className="text-2xl font-bold text-blue-700 mt-2">
            {metrics.avgResponseTime > 0
              ? `${metrics.avgResponseTime}ms`
              : "N/A"}
          </p>
          <p className="text-xs text-blue-600 mt-1">Average API latency</p>
        </div>
      </div>

      <div className="mt-4 p-3 bg-gray-50 rounded text-xs text-gray-600">
        <p>
          💡 <strong>Tip:</strong> Metrics are tracked via OpenTelemetry spans.
          Check Jaeger UI for detailed performance analysis.
        </p>
      </div>
    </div>
  );
}
