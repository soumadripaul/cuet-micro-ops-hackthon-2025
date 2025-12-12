import { BarChart3, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

interface MetricData {
  successCount: number;
  failureCount: number;
  avgResponseTime: number;
  totalRequests: number;
}

export function PerformanceMetrics() {
  const [metrics, setMetrics] = useState<MetricData>({
    successCount: 0,
    failureCount: 0,
    avgResponseTime: 0,
    totalRequests: 0,
  });

  // In a real app, this would come from actual telemetry data
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) => ({
        ...prev,
        // Mock data update
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const successRate =
    metrics.totalRequests > 0
      ? ((metrics.successCount / metrics.totalRequests) * 100).toFixed(1)
      : "0.0";

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center">
        <BarChart3 className="mr-2 h-5 w-5" />
        Performance Metrics
      </h2>

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
