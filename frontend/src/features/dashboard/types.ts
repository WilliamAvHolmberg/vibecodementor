export interface SystemMetrics {
  timestamp: string;
  cpuUsagePercent: number;
  memoryUsagePercent: number;
  memoryUsedMB: number;
  workingSetMB?: number;
  guaranteedMemoryMB?: number;
  maximumMemoryMB?: number;
  guaranteedCpuUnits?: number;
  maximumCpuUnits?: number;
  threadCount: number;
  processId: number;
  processName: string;
  uptime: number;
  totalVisits: number;
  todayVisits: number;
  activeConnections: number;
  requestsPerMinute: number;
  metricsSource: string;
}

export interface DashboardState {
  isConnected: boolean;
  latestMetrics: SystemMetrics | null;
  metricsHistory: SystemMetrics[];
  isLoading: boolean;
}

export interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  icon: React.ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo' | 'pink';
  trend?: {
    value: number;
    isPositive: boolean;
  } | null;
} 