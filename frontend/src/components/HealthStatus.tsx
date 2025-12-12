import { useQuery } from '@tanstack/react-query';
import { Activity, AlertCircle, CheckCircle2, Database } from 'lucide-react';
import { api } from '../lib/api';

export function HealthStatus() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['health'],
    queryFn: () => api.health(),
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <Activity className="mr-2 h-5 w-5" />
          API Health Status
        </h2>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <Activity className="mr-2 h-5 w-5" />
          API Health Status
        </h2>
        <div className="flex items-center text-red-600">
          <AlertCircle className="mr-2 h-5 w-5" />
          <span>Failed to fetch health status</span>
        </div>
        <button
          onClick={() => refetch()}
          className="mt-4 text-blue-600 hover:text-blue-800 text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  const isHealthy = data?.status === 'healthy';
  const storageOk = data?.checks?.storage === 'ok';

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center">
        <Activity className="mr-2 h-5 w-5" />
        API Health Status
      </h2>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-700">Overall Status</span>
          <div className={`flex items-center ${isHealthy ? 'text-green-600' : 'text-red-600'}`}>
            {isHealthy ? (
              <CheckCircle2 className="mr-2 h-5 w-5" />
            ) : (
              <AlertCircle className="mr-2 h-5 w-5" />
            )}
            <span className="font-semibold capitalize">{data?.status}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-700 flex items-center">
            <Database className="mr-2 h-4 w-4" />
            Storage
          </span>
          <div className={`flex items-center ${storageOk ? 'text-green-600' : 'text-red-600'}`}>
            {storageOk ? (
              <CheckCircle2 className="mr-2 h-5 w-5" />
            ) : (
              <AlertCircle className="mr-2 h-5 w-5" />
            )}
            <span className="font-semibold capitalize">{data?.checks?.storage}</span>
          </div>
        </div>

        {data?.timestamp && (
          <div className="text-xs text-gray-500 mt-4">
            Last checked: {new Date(data.timestamp).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
}
