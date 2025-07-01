"use client";

import { useDashboard } from '@/features/dashboard/hooks';

// Floating Metric Card Component
function FloatingMetricCard({ 
  title, 
  value, 
  unit = '', 
  icon, 
  className = '',
  color = 'blue',
  style
}: {
  title: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  className?: string;
  color?: string;
  style?: React.CSSProperties;
}) {
  const colorClasses = {
    blue: 'from-blue-500/80 to-cyan-500/80 text-white',
    green: 'from-green-500/80 to-emerald-500/80 text-white',
    purple: 'from-purple-500/80 to-pink-500/80 text-white',
    orange: 'from-orange-500/80 to-red-500/80 text-white',
    yellow: 'from-yellow-500/80 to-orange-500/80 text-white',
    red: 'from-red-500/80 to-pink-500/80 text-white',
  };

  return (
    <div 
      className={`absolute ${className} transform hover:scale-110 transition-all duration-300 z-20`} 
      style={style}
    >
      <div className={`bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} backdrop-blur-xl rounded-2xl p-3 md:p-4 shadow-2xl border border-white/20 min-w-[100px] md:min-w-[120px]`}>
        <div className="flex items-center gap-2 md:gap-3">
          <div className="text-lg md:text-2xl">{icon}</div>
          <div>
            <div className="text-lg md:text-2xl font-bold">
              {value}{unit}
            </div>
            <div className="text-xs opacity-90 font-medium">
              {title}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Client-side metrics enhancement overlay
export function FloatingMetrics() {
  const { latestMetrics, isConnected, isLoading } = useDashboard();

  const formatUptime = (minutes: number) => {
    if (minutes < 1) return `${Math.round(minutes * 60)}s`;
    if (minutes < 60) return `${Math.round(minutes)}m`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  // Mock data for testing
  const mockMetrics = {
    cpuUsagePercent: 2.5,
    memoryUsedMB: 128,
    totalVisits: 42,
    uptime: 156 // minutes
  };

  // Use real metrics if available, otherwise use mock data for testing
  const metrics = latestMetrics || mockMetrics;
  const showMockData = !latestMetrics;

  return (
    <>
      {/* Overlay container positioned over the hero */}
      <div className="absolute inset-0 max-w-6xl mx-auto pointer-events-none">
        {/* Floating Analytics Cards */}
        <div className="pointer-events-auto">
          {/* Top Left - CPU */}
          <FloatingMetricCard
            title="CPU Usage"
            value={metrics.cpuUsagePercent.toFixed(1)}
            unit="%"
            icon="🖥️"
            color={metrics.cpuUsagePercent > 80 ? 'red' : metrics.cpuUsagePercent > 60 ? 'yellow' : 'green'}
            className="top-20 left-8 md:top-24 md:left-16 lg:left-20 xl:left-24"
          />

          {/* Top Right - Memory */}
          <FloatingMetricCard
            title="Memory"
            value={metrics.memoryUsedMB.toFixed(0)}
            unit="MB"
            icon="💾"
            color="blue"
            className="top-20 right-8 md:top-24 md:right-16 lg:right-20 xl:right-24"
          />

          {/* Bottom Left - Total Visits */}
          <FloatingMetricCard
            title="Total Visits"
            value={metrics.totalVisits}
            icon="👥"
            color="green"
            className="bottom-20 left-8 md:bottom-24 md:left-16 lg:left-20 xl:left-24"
          />

          {/* Bottom Right - Uptime */}
          <FloatingMetricCard
            title="Uptime"
            value={formatUptime(metrics.uptime)}
            icon="⏱️"
            color="orange"
            className="bottom-20 right-8 md:bottom-24 md:right-16 lg:right-20 xl:right-24"
          />
        </div>
      </div>

      {/* Connection Status Indicator */}
      <div className="absolute top-4 right-4 bg-green-500/80 backdrop-blur-xl rounded-full px-3 py-1 md:px-4 md:py-2 text-white text-xs md:text-sm font-medium shadow-xl z-30">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <span className="hidden sm:inline">
            {showMockData ? 'Demo Mode' : 'Live Metrics'}
          </span>
          <span className="sm:hidden">
            {showMockData ? 'Demo' : 'Live'}
          </span>
        </div>
      </div>
    </>
  );
} 