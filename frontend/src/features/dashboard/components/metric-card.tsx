"use client";

import { cn } from '@/shared/lib/utils';
import { MetricCardProps } from '../types';

const colorVariants = {
  blue: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  green: 'bg-green-500/10 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
  yellow: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
  red: 'bg-red-500/10 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
  purple: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  indigo: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
  pink: 'bg-pink-500/10 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800',
};

export function MetricCard({ 
  title, 
  value, 
  unit, 
  icon, 
  color = 'blue',
  trend 
}: MetricCardProps) {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-200 hover:shadow-md hover:scale-[1.02]",
      colorVariants[color]
    )}>
      <div className="p-3 relative h-20">
        <div className="flex items-center space-x-2">
          <div className={cn(
            "flex h-6 w-6 items-center justify-center rounded-lg flex-shrink-0",
            `bg-${color}-100 dark:bg-${color}-900/20`
          )}>
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-muted-foreground truncate">
              {title}
            </p>
            <div className="flex items-baseline space-x-1">
              <p className="text-lg font-bold truncate">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </p>
              {unit && (
                <span className="text-xs font-medium text-muted-foreground flex-shrink-0">
                  {unit}
                </span>
              )}
            </div>
          </div>
        </div>
        


        {/* Trend indicator in bottom-right corner */}
        {trend && (
          <div className={cn(
            "absolute bottom-2 right-2 flex items-center space-x-1 rounded-full px-1.5 py-0.5 text-xs font-medium",
            trend.isPositive 
              ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300"
              : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300"
          )}>
            <span className={cn(
              "text-xs",
              trend.isPositive ? "text-green-500" : "text-red-500"
            )}>
              {trend.isPositive ? "↗" : "↘"}
            </span>
            <span className="text-xs">{trend.value.toFixed(1)}</span>
          </div>
        )}
      </div>
      
      {/* Subtle animated background effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 transform translate-x-[-200%] animate-[shimmer_3s_ease-in-out_infinite]" />
    </div>
  );
} 