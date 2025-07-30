'use client'

import { useState, useEffect, useRef, useCallback } from 'react';

export interface SystemMetrics {
    cpuPressure: 'nominal' | 'fair' | 'serious' | 'critical' | 'unknown';
    cpuPressureSupported: boolean;
    gpuPressure: 'nominal' | 'fair' | 'serious' | 'critical' | 'unknown';
    gpuPressureSupported: boolean;
    memoryUsage: number; // MB
    memoryGrowthRate: number; // MB/sec
    mainThreadBlocking: number; // ms
    frameDrops: number;
    trends: {
        cpu: '→' | '↗️' | '↘️';
        gpu: '→' | '↗️' | '↘️';
        memory: '→' | '↗️' | '↘️';
    };
}

// Compute Pressure API types
interface PressureObserver {
    observe(source: 'cpu' | 'gpu', options?: { sampleInterval?: number }): Promise<void>;
    disconnect(): void;
}

interface PressureRecord {
    source: 'cpu' | 'gpu';
    state: 'nominal' | 'fair' | 'serious' | 'critical';
    time: number;
}

declare global {
    interface Window {
        PressureObserver?: {
            new(callback: (records: PressureRecord[]) => void): PressureObserver;
            knownSources?: string[];
        };
    }
}

export function useSystemMetrics(): SystemMetrics {
    // Real-time data stored in refs (no re-renders)
    const metricsRef = useRef<SystemMetrics>({
        cpuPressure: 'unknown',
        cpuPressureSupported: false,
        gpuPressure: 'unknown',
        gpuPressureSupported: false,
        memoryUsage: 0,
        memoryGrowthRate: 0,
        mainThreadBlocking: 0,
        frameDrops: 0,
        trends: {
            cpu: '→',
            gpu: '→',
            memory: '→'
        }
    });

    // Display state (updates every 500ms for UI)
    const [displayMetrics, setDisplayMetrics] = useState<SystemMetrics>(metricsRef.current);

    const prevMemoryRef = useRef(0);
    const prevCpuStateRef = useRef<'nominal' | 'fair' | 'serious' | 'critical' | 'unknown'>('unknown');
    const prevGpuStateRef = useRef<'nominal' | 'fair' | 'serious' | 'critical' | 'unknown'>('unknown');
    const memoryHistoryRef = useRef<{ time: number; usage: number }[]>([]);
    const pressureObserverRef = useRef<PressureObserver | null>(null);
    const gpuPressureObserverRef = useRef<PressureObserver | null>(null);

    // Update display state every 500ms (smooth enough for system metrics)
    useEffect(() => {
        const interval = setInterval(() => {
            setDisplayMetrics({ ...metricsRef.current });
        }, 500);

        return () => clearInterval(interval);
    }, []);

    // Helper to update ref without triggering re-renders
    const updateMetricRef = useCallback((updates: Partial<SystemMetrics>) => {
        metricsRef.current = { ...metricsRef.current, ...updates };
    }, []);

    // Initialize Compute Pressure API
    useEffect(() => {
        const initializePressureObserver = async () => {
            if (!window.PressureObserver) {
                console.log('Compute Pressure API not supported in this browser');
                updateMetricRef({ cpuPressureSupported: false });
                return;
            }

            try {
                const observer = new window.PressureObserver((records) => {
                    const latestRecord = records[records.length - 1];
                    if (latestRecord) {
                        // Update CPU trend
                        const prevState = prevCpuStateRef.current;
                        const currentState = latestRecord.state;

                        const stateOrder = { 'nominal': 0, 'fair': 1, 'serious': 2, 'critical': 3, 'unknown': -1 };
                        const prevLevel = stateOrder[prevState];
                        const currentLevel = stateOrder[currentState];

                        let cpuTrend: '→' | '↗️' | '↘️' = '→';
                        if (currentLevel > prevLevel) cpuTrend = '↗️';
                        else if (currentLevel < prevLevel) cpuTrend = '↘️';

                        updateMetricRef({
                            cpuPressure: currentState,
                            trends: { ...metricsRef.current.trends, cpu: cpuTrend }
                        });
                        prevCpuStateRef.current = currentState;
                    }
                });

                await observer.observe('cpu', { sampleInterval: 1000 }); // 1 second intervals
                pressureObserverRef.current = observer;
                updateMetricRef({ cpuPressureSupported: true });
                console.log('Compute Pressure API initialized successfully');
            } catch (error) {
                console.log('Failed to initialize Compute Pressure API:', error);
                updateMetricRef({ cpuPressureSupported: false });
            }
        };

        const initializeGpuPressureObserver = async () => {
            if (!window.PressureObserver) {
                updateMetricRef({ gpuPressureSupported: false });
                return;
            }

            try {
                // Check if GPU monitoring is supported
                const knownSources = window.PressureObserver.knownSources || [];
                if (!knownSources.includes('gpu')) {
                    console.log('GPU pressure monitoring not supported in this browser');
                    updateMetricRef({ gpuPressureSupported: false });
                    return;
                }

                const gpuObserver = new window.PressureObserver((records) => {
                    const latestRecord = records[records.length - 1];
                    if (latestRecord) {
                        // Update GPU trend
                        const prevState = prevGpuStateRef.current;
                        const currentState = latestRecord.state;

                        const stateOrder = { 'nominal': 0, 'fair': 1, 'serious': 2, 'critical': 3, 'unknown': -1 };
                        const prevLevel = stateOrder[prevState];
                        const currentLevel = stateOrder[currentState];

                        let gpuTrend: '→' | '↗️' | '↘️' = '→';
                        if (currentLevel > prevLevel) gpuTrend = '↗️';
                        else if (currentLevel < prevLevel) gpuTrend = '↘️';

                        updateMetricRef({
                            gpuPressure: currentState,
                            trends: { ...metricsRef.current.trends, gpu: gpuTrend }
                        });
                        prevGpuStateRef.current = currentState;
                    }
                });

                await gpuObserver.observe('gpu', { sampleInterval: 1000 }); // 1 second intervals
                gpuPressureObserverRef.current = gpuObserver;
                updateMetricRef({ gpuPressureSupported: true });
                console.log('GPU Compute Pressure API initialized successfully');
            } catch (error) {
                console.log('Failed to initialize GPU Compute Pressure API:', error);
                updateMetricRef({ gpuPressureSupported: false });
            }
        };

        initializePressureObserver();
        initializeGpuPressureObserver();

        return () => {
            if (pressureObserverRef.current) {
                pressureObserverRef.current.disconnect();
            }
            if (gpuPressureObserverRef.current) {
                gpuPressureObserverRef.current.disconnect();
            }
        };
    }, [updateMetricRef]);

    // Memory monitoring and performance observer
    useEffect(() => {
        let performanceObserver: PerformanceObserver | null = null;

        const updateMetrics = () => {
            // Memory monitoring
            if ('memory' in performance) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const memInfo = (performance as any).memory;
                const currentMemory = Math.round(memInfo.usedJSHeapSize / 1024 / 1024);

                // Track memory history for growth rate
                const now = Date.now();
                memoryHistoryRef.current.push({ time: now, usage: currentMemory });

                // Keep only last 10 seconds of data
                memoryHistoryRef.current = memoryHistoryRef.current.filter(
                    entry => now - entry.time <= 10000
                );

                // Calculate growth rate
                let growthRate = 0;
                if (memoryHistoryRef.current.length >= 2) {
                    const oldest = memoryHistoryRef.current[0];
                    const newest = memoryHistoryRef.current[memoryHistoryRef.current.length - 1];
                    const timeDiff = (newest.time - oldest.time) / 1000; // seconds
                    const memoryDiff = newest.usage - oldest.usage;
                    growthRate = timeDiff > 0 ? Math.round((memoryDiff / timeDiff) * 100) / 100 : 0;
                }

                // Memory trend
                const memoryTrend = currentMemory > prevMemoryRef.current ? '↗️' :
                    currentMemory < prevMemoryRef.current ? '↘️' : '→';

                updateMetricRef({
                    memoryUsage: currentMemory,
                    memoryGrowthRate: growthRate,
                    trends: { ...metricsRef.current.trends, memory: memoryTrend }
                });

                prevMemoryRef.current = currentMemory;
            }
        };

        // Performance observer for long tasks
        if ('PerformanceObserver' in window) {
            performanceObserver = new PerformanceObserver((list) => {
                const longTasks = list.getEntries().filter(entry => entry.entryType === 'longtask');

                let totalBlocking = 0;
                longTasks.forEach(task => {
                    totalBlocking += task.duration;
                });

                updateMetricRef({
                    mainThreadBlocking: Math.round(totalBlocking),
                    frameDrops: metricsRef.current.frameDrops + longTasks.length
                });
            });

            try {
                performanceObserver.observe({ entryTypes: ['longtask'] });
            } catch {
                console.log('Long task observation not supported');
            }
        }

        // Update metrics every 100ms (but don't trigger re-renders)
        const interval = setInterval(updateMetrics, 100);

        return () => {
            clearInterval(interval);
            if (performanceObserver) {
                performanceObserver.disconnect();
            }
        };
    }, [updateMetricRef]);

    return displayMetrics;
} 