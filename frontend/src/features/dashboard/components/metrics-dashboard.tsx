"use client";

import { useDashboard } from '../hooks';
import { MetricCard } from './metric-card';
import { ConnectionStatus } from './connection-status';
import { useVisitTracking } from '@/features/analytics/hooks/use-visit-tracking';

// Icons (using emojis for simplicity, could be replaced with proper icon library)
const Icons = {
    CPU: () => <span className="text-base">🖥️</span>,
    Memory: () => <span className="text-base">💾</span>,
    Threads: () => <span className="text-base">🧵</span>,
    Process: () => <span className="text-base">⚙️</span>,
    Visits: () => <span className="text-base">👥</span>,
    TodayVisits: () => <span className="text-base">📅</span>,
    Uptime: () => <span className="text-base">⏱️</span>,
    Source: () => <span className="text-base">📊</span>,
};

export function MetricsDashboard() {
    const { isConnected, latestMetrics, isLoading, getTrend } = useDashboard();
    // Track visit on page load
    useVisitTracking();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center">
                <div className="text-center">
                    <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
                    <p className="text-muted-foreground">Connecting to metrics...</p>
                </div>
            </div>
        );
    }

    if (!latestMetrics) {
        return (
            <div className="space-y-6">
                <ConnectionStatus isConnected={isConnected} />
                <div className="flex items-center justify-center">
                    <div className="text-center">
                        <span className="text-4xl">📊</span>
                        <p className="mt-2 text-muted-foreground">Waiting for metrics data...</p>
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
        <div className="space-y-3">
            {/* Connection Status */}
            <ConnectionStatus
                isConnected={isConnected}
                lastUpdate={latestMetrics.timestamp}
                metricsSource={latestMetrics.metricsSource}
            />

            {/* Horizontal Layout - All Metrics in One Row */}
            <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                <MetricCard
                    title="CPU Usage"
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
                    title="Threads"
                    value={latestMetrics.threadCount}
                    icon={<Icons.Threads />}
                    color="purple"
                    trend={getTrend(m => m.threadCount)}
                />

                <MetricCard
                    title="Uptime"
                    value={formatUptime(latestMetrics.uptime)}
                    icon={<Icons.Uptime />}
                    color="indigo"
                />

                <MetricCard
                    title="Total Visits"
                    value={latestMetrics.totalVisits}
                    icon={<Icons.Visits />}
                    color="green"
                    trend={getTrend(m => m.totalVisits)}
                />

                <MetricCard
                    title="Today"
                    value={latestMetrics.todayVisits}
                    icon={<Icons.TodayVisits />}
                    color="yellow"
                    trend={getTrend(m => m.todayVisits)}
                />
            </div>
        </div>
    );
} 