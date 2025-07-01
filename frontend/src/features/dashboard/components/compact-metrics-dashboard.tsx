"use client";

import { useDashboard } from '../hooks';
import { MetricCard } from './metric-card';
import { ConnectionStatus } from './connection-status';

// Icons (using emojis for simplicity)
const Icons = {
  CPU: () => <span className="text-base">🖥️</span>,
  Memory: () => <span className="text-base">💾</span>,
  Visits: () => <span className="text-base">👥</span>,
  Uptime: () => <span className="text-base">⏱️</span>,
};

export function CompactMetricsDashboard() {
  const { isConnected, latestMetrics, isLoading, getTrend } = useDashboard();

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="text-center">
          <div className="mb-3 inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
          <p className="text-sm text-muted-foreground">Connecting...</p>
        </div>
      </div>
    );
  }

  if (!latestMetrics) {
    return (
      <div className="space-y-4">
        <ConnectionStatus isConnected={isConnected} />
        <div className="flex h-32 items-center justify-center">
          <div className="text-center">
            <span className="text-2xl">📊</span>
            <p className="mt-1 text-sm text-muted-foreground">Waiting for data...</p>
          </div>
        </div>
      </div>
    );
  }

  const formatUptime = (minutes: number) => {
    if (minutes < 1) return `${Math.round(minutes * 60)}s`;
    if (minutes < 60) return `${Math.round(minutes)}m`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <ConnectionStatus 
        isConnected={isConnected} 
        lastUpdate={latestMetrics.timestamp}
        metricsSource={latestMetrics.metricsSource}
      />

      {/* Key Metrics - Compact Grid */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <MetricCard
          title="CPU"
          value={latestMetrics.cpuUsagePercent.toFixed(1)}
          unit="%"
          icon={<Icons.CPU />}
          color={latestMetrics.cpuUsagePercent > 80 ? 'red' : latestMetrics.cpuUsagePercent > 60 ? 'yellow' : 'green'}
          trend={getTrend(m => m.cpuUsagePercent)}
        />
        
        <MetricCard
          title="Memory"
          value={latestMetrics.memoryUsedMB.toFixed(0)}
          unit="MB"
          icon={<Icons.Memory />}
          color="blue"
          trend={getTrend(m => m.memoryUsedMB)}
        />
        
        <MetricCard
          title="Visits"
          value={latestMetrics.totalVisits}
          subtitle={`${latestMetrics.todayVisits} today`}
          icon={<Icons.Visits />}
          color="green"
          trend={getTrend(m => m.totalVisits)}
        />
        
        <MetricCard
          title="Uptime"
          value={formatUptime(latestMetrics.uptime)}
          subtitle={`${latestMetrics.threadCount} threads`}
          icon={<Icons.Uptime />}
          color="indigo"
        />
      </div>

      {/* Quick Info */}
      <div className="rounded-lg bg-muted/50 p-3 text-center text-xs text-muted-foreground">
        <p>
          Real-time • Updates every 2s • 
          {latestMetrics.metricsSource === 'Fallback (macOS)' 
            ? ' macOS metrics' 
            : ' MS monitoring'
          }
        </p>
      </div>
    </div>
  );
} 