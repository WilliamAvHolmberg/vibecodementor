"use client";

import { cn } from '@/shared/lib/utils';

interface ConnectionStatusProps {
  isConnected: boolean;
  lastUpdate?: string;
  metricsSource?: string;
}

export function ConnectionStatus({ isConnected, lastUpdate, metricsSource }: ConnectionStatusProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 rounded-lg border bg-card p-3 text-card-foreground shadow-sm">
      {/* Main connection status - always on top/left */}
      <div className="flex items-center space-x-2 flex-shrink-0">
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
        
        {/* Real-time indicator - desktop only or mobile inline */}
        {isConnected && (
          <div className="flex items-center space-x-1 text-xs text-muted-foreground ml-3 sm:hidden">
            <div className="h-1 w-1 rounded-full bg-green-500 animate-ping" />
            <span>Real-time</span>
          </div>
        )}
      </div>
      
      {/* Secondary info - wraps on mobile, inline on desktop */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-muted-foreground min-w-0">
        {lastUpdate && (
          <div className="flex items-center space-x-1">
            <span className="hidden sm:inline">Last update:</span>
            <span className="sm:hidden">Updated:</span>
            <span className="font-mono">
              {new Date(lastUpdate).toLocaleTimeString()}
            </span>
          </div>
        )}
        
        {metricsSource && (
          <div className="flex items-center space-x-1">
            <span>Source:</span>
            <span className="rounded bg-muted px-1 py-0.5 font-mono text-xs truncate max-w-24 sm:max-w-none">
              {metricsSource}
            </span>
          </div>
        )}
        
        {/* Real-time indicator - desktop only */}
        {isConnected && (
          <div className="hidden sm:flex items-center space-x-1 text-xs text-muted-foreground">
            <div className="h-1 w-1 rounded-full bg-green-500 animate-ping" />
            <span>Real-time</span>
          </div>
        )}
      </div>
    </div>
  );
} 