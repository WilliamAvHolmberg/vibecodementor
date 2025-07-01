"use client";

import { cn } from '@/shared/lib/utils';

interface ConnectionStatusProps {
  isConnected: boolean;
  lastUpdate?: string;
  metricsSource?: string;
}

export function ConnectionStatus({ isConnected, lastUpdate, metricsSource }: ConnectionStatusProps) {
  return (
    <div className="flex items-center space-x-4 rounded-lg border bg-card p-3 text-card-foreground shadow-sm">
      <div className="flex items-center space-x-2">
        <div className={cn(
          "h-3 w-3 rounded-full transition-all duration-300",
          isConnected 
            ? "bg-green-500 shadow-lg shadow-green-500/50 animate-pulse" 
            : "bg-red-500 shadow-lg shadow-red-500/50"
        )} />
        <span className={cn(
          "text-sm font-medium",
          isConnected ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"
        )}>
          {isConnected ? "Connected" : "Disconnected"}
        </span>
      </div>
      
      {lastUpdate && (
        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
          <span>Last update:</span>
          <span className="font-mono">
            {new Date(lastUpdate).toLocaleTimeString()}
          </span>
        </div>
      )}
      
      {metricsSource && (
        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
          <span>Source:</span>
          <span className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
            {metricsSource}
          </span>
        </div>
      )}
      
      {isConnected && (
        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
          <div className="h-1 w-1 rounded-full bg-green-500 animate-ping" />
          <span>Real-time</span>
        </div>
      )}
    </div>
  );
} 