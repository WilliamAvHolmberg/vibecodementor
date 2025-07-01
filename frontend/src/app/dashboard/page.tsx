import { MetricsDashboard } from '@/features/dashboard';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                📊 System Dashboard
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Real-time system metrics and application insights
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Updates every second
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">
                ✨ Live metrics via SignalR
              </p>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <MetricsDashboard />
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link 
            href="/"
            className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            <span>← Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
} 