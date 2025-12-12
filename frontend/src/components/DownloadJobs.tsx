import { useMutation } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle, Clock, Download, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { api, ApiError } from '../lib/api';
import { getCurrentTraceId } from '../lib/opentelemetry';

interface JobEntry {
  id: string;
  fileId: number;
  status: 'pending' | 'completed' | 'failed';
  message?: string;
  traceId?: string;
  timestamp: Date;
}

export function DownloadJobs() {
  const [jobs, setJobs] = useState<JobEntry[]>([]);
  const [fileId, setFileId] = useState('');
  const [sentryTest, setSentryTest] = useState(false);

  const checkMutation = useMutation({
    mutationFn: (data: { fileId: number; sentryTest: boolean }) =>
      api.downloadCheck({ file_id: data.fileId, sentry_test: data.sentryTest }),
    onSuccess: (data, variables) => {
      const job: JobEntry = {
        id: `check-${Date.now()}`,
        fileId: variables.fileId,
        status: data.status,
        message: data.message,
        traceId: getCurrentTraceId(),
        timestamp: new Date(),
      };
      setJobs((prev) => [job, ...prev]);
    },
    onError: (error: ApiError, variables) => {
      const job: JobEntry = {
        id: `check-${Date.now()}`,
        fileId: variables.fileId,
        status: 'failed',
        message: error.message,
        traceId: error.traceId || getCurrentTraceId(),
        timestamp: new Date(),
      };
      setJobs((prev) => [job, ...prev]);
    },
  });

  const startMutation = useMutation({
    mutationFn: (fileId: number) => api.downloadStart({ file_id: fileId }),
    onSuccess: (data) => {
      const job: JobEntry = {
        id: data.job_id,
        fileId: data.file_id,
        status: data.status,
        message: data.message,
        traceId: getCurrentTraceId(),
        timestamp: new Date(),
      };
      setJobs((prev) => [job, ...prev]);
    },
    onError: (error: ApiError, fileId) => {
      const job: JobEntry = {
        id: `start-${Date.now()}`,
        fileId,
        status: 'failed',
        message: error.message,
        traceId: error.traceId || getCurrentTraceId(),
        timestamp: new Date(),
      };
      setJobs((prev) => [job, ...prev]);
    },
  });

  const handleCheck = () => {
    const id = parseInt(fileId);
    if (!isNaN(id)) {
      checkMutation.mutate({ fileId: id, sentryTest });
    }
  };

  const handleStart = () => {
    const id = parseInt(fileId);
    if (!isNaN(id)) {
      startMutation.mutate(id);
    }
  };

  const getStatusIcon = (status: JobEntry['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusColor = (status: JobEntry['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center">
        <Download className="mr-2 h-5 w-5" />
        Download Jobs
      </h2>

      <div className="mb-6 space-y-4">
        <div>
          <label htmlFor="fileId" className="block text-sm font-medium text-gray-700 mb-2">
            File ID
          </label>
          <input
            type="number"
            id="fileId"
            value={fileId}
            onChange={(e) => setFileId(e.target.value)}
            placeholder="Enter file ID (e.g., 70000)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="sentryTest"
            checked={sentryTest}
            onChange={(e) => setSentryTest(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="sentryTest" className="ml-2 block text-sm text-gray-700">
            Trigger Sentry test error
          </label>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleCheck}
            disabled={!fileId || checkMutation.isPending}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {checkMutation.isPending ? (
              <>
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                Checking...
              </>
            ) : (
              'Check Download'
            )}
          </button>
          <button
            onClick={handleStart}
            disabled={!fileId || startMutation.isPending}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {startMutation.isPending ? (
              <>
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                Starting...
              </>
            ) : (
              'Start Download'
            )}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">Recent Jobs</h3>
        {jobs.length === 0 ? (
          <p className="text-gray-500 text-sm">No jobs initiated yet</p>
        ) : (
          <div className="space-y-2">
            {jobs.map((job) => (
              <div key={job.id} className="border border-gray-200 rounded-md p-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {getStatusIcon(job.status)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">
                          File ID: {job.fileId}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            job.status
                          )}`}
                        >
                          {job.status}
                        </span>
                      </div>
                      {job.message && (
                        <p className="text-sm text-gray-600 mt-1">{job.message}</p>
                      )}
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-xs text-gray-500">
                          {job.timestamp.toLocaleTimeString()}
                        </span>
                        {job.traceId && (
                          <a
                            href={`${import.meta.env.VITE_JAEGER_UI_URL}/trace/${job.traceId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            View Trace
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
