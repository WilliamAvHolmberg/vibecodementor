"use client";

import { useState, useEffect } from 'react';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { SystemMetrics, DashboardState } from './types';

export function useMetricsSignalR() {
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Create SignalR connection to metrics hub (no auth required!)
    const newConnection = new HubConnectionBuilder()
      .withUrl('/hubs/metrics', {
        withCredentials: false
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    setConnection(newConnection);

    return () => {
      if (newConnection) {
        newConnection.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (connection) {
      connection.start()
        .then(() => {
          setConnected(true);
        })
        .catch(error => {
          console.error('❌ Metrics SignalR Connection Error:', error);
          setConnected(false);
        });

      connection.onclose(() => {
        setConnected(false);
      });

      connection.onreconnecting(() => {
        setConnected(false);
      });

      connection.onreconnected(() => {
        setConnected(true);
      });
    }
  }, [connection]);

  return { connection, connected };
}

export function useDashboard() {
  const [state, setState] = useState<DashboardState>({
    isConnected: false,
    latestMetrics: null,
    metricsHistory: [],
    isLoading: true,
  });

  const { connection, connected } = useMetricsSignalR();

  useEffect(() => {
    setState(prev => ({ 
      ...prev, 
      isConnected: connected, 
      isLoading: false,
    }));
  }, [connected]);

  useEffect(() => {
    if (connection) {
      // Listen for incoming metrics
      connection.on('SystemMetrics', (metricsData: SystemMetrics) => {
        setState(prev => {
          // Keep last 50 metrics for history/charts
          const newHistory = [...prev.metricsHistory, metricsData].slice(-50);
          
          return {
            ...prev,
            latestMetrics: metricsData,
            metricsHistory: newHistory,
          };
        });
      });
    }

    return () => {
      if (connection) {
        connection.off('SystemMetrics');
      }
    };
  }, [connection]);

  // Helper function to get trend data
  const getTrend = (getValue: (metrics: SystemMetrics) => number) => {
    if (state.metricsHistory.length < 2) return null;
    
    const current = getValue(state.latestMetrics!);
    const previous = getValue(state.metricsHistory[state.metricsHistory.length - 2]);
    const change = current - previous;
    
    return {
      value: Math.abs(change),
      isPositive: change >= 0,
    };
  };

  return {
    ...state,
    getTrend,
  };
} 