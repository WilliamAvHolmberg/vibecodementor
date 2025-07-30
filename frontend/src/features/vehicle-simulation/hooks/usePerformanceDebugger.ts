'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

export interface DebugFeature {
  key: string
  name: string
  enabled: boolean
  frameTime: number
  description: string
}

export interface PerformanceMetrics {
  totalFrameTime: number
  fps: number
  features: Record<string, DebugFeature>
  system: {
    cpu: {
      pressure: 'nominal' | 'fair' | 'serious' | 'critical' | 'unknown'
      supported: boolean
      trend: '→' | '↗️' | '↘️'
    }
    gpu: {
      pressure: 'nominal' | 'fair' | 'serious' | 'critical' | 'unknown'
      supported: boolean
      trend: '→' | '↗️' | '↘️'
    }
    memory: {
      used: number
      growth: number
      trend: '→' | '↗️' | '↘️'
    }
    performance: {
      mainThreadBlocking: number
      frameDrops: number
    }
  }
}

const DEFAULT_FEATURES: Record<string, Omit<DebugFeature, 'enabled' | 'frameTime'>> = {
  terrain: {
    key: 'terrain',
    name: 'Terrain Collision',
    description: 'Ground height detection and collision'
  },
  environment: {
    key: 'environment', 
    name: 'HDRI Environment',
    description: 'Beautiful lighting and reflections'
  },
  physics: {
    key: 'physics',
    name: 'Vehicle Physics',
    description: 'Realistic car movement simulation'
  },
  references: {
    key: 'references',
    name: 'Reference Objects',
    description: 'Grid and spatial markers'
  },
  shadows: {
    key: 'shadows',
    name: 'Shadow Casting',
    description: 'Dynamic shadow rendering'
  }
}

// Import the FPS hook to sync with bottom-right counter
import { useFPS } from './useFPS'
import { useSystemMetrics } from './useSystemMetrics'

export function usePerformanceDebugger() {
  // Initialize features state (all enabled by default)
  const [features, setFeatures] = useState<Record<string, DebugFeature>>(() => {
    const initialFeatures: Record<string, DebugFeature> = {}
    
    Object.entries(DEFAULT_FEATURES).forEach(([key, defaultFeature]) => {
      initialFeatures[key] = {
        ...defaultFeature,
        enabled: true, // Default to enabled
        frameTime: 0
      }
    })

    console.log('📦 Initializing features state:', initialFeatures)
    return initialFeatures
  })

  // Environment quality state
  const [environmentQuality, setEnvironmentQualityState] = useState<'off' | 'low' | 'medium' | 'high'>('high')
  
  // Real-time metrics stored in refs (no re-renders)
  const metricsRef = useRef<PerformanceMetrics>({
    totalFrameTime: 0,
    fps: 0,
    features: {},
    system: {
      cpu: { pressure: 'unknown', supported: false, trend: '→' },
      gpu: { pressure: 'unknown', supported: false, trend: '→' },
      memory: { used: 0, growth: 0, trend: '→' },
      performance: { mainThreadBlocking: 0, frameDrops: 0 }
    }
  })
  
  // Display state (updates every 200ms for UI)
  const [displayMetrics, setDisplayMetrics] = useState<PerformanceMetrics>(metricsRef.current)
  
  const frameTimeRef = useRef<number>(16.67) // Default to 60fps frame time
  
  // Use the same FPS source as the bottom-right counter
  const globalFPS = useFPS()
  
  // Get system metrics
  const systemMetrics = useSystemMetrics()

  // Update display state every 200ms (smooth enough for debug panels)
  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayMetrics({ ...metricsRef.current })
    }, 200)
    
    return () => clearInterval(interval)
  }, [])

  // Helper to update ref without triggering re-renders
  const updateMetricsRef = useCallback((updates: Partial<PerformanceMetrics>) => {
    metricsRef.current = { ...metricsRef.current, ...updates }
  }, [])

  // Sync features with metrics ref
  useEffect(() => {
    updateMetricsRef({ features })
  }, [features, updateMetricsRef])

  // Sync FPS with global state (throttled via ref)
  useEffect(() => {
    updateMetricsRef({
      fps: globalFPS,
      totalFrameTime: globalFPS > 0 ? (1000 / globalFPS) : frameTimeRef.current
    })
  }, [globalFPS, updateMetricsRef])

  // Sync system metrics (throttled via ref)
  useEffect(() => {
    updateMetricsRef({
      system: {
        cpu: {
          pressure: systemMetrics.cpuPressure,
          supported: systemMetrics.cpuPressureSupported,
          trend: systemMetrics.trends.cpu
        },
        gpu: {
          pressure: systemMetrics.gpuPressure,
          supported: systemMetrics.gpuPressureSupported,
          trend: systemMetrics.trends.gpu
        },
        memory: {
          used: systemMetrics.memoryUsage,
          growth: systemMetrics.memoryGrowthRate,
          trend: systemMetrics.trends.memory
        },
        performance: {
          mainThreadBlocking: systemMetrics.mainThreadBlocking,
          frameDrops: systemMetrics.frameDrops
        }
      }
    })
  }, [systemMetrics, updateMetricsRef])

  // Toggle a feature
  const toggleFeature = (featureKey: string) => {
    setFeatures(prevFeatures => {
      const current = prevFeatures[featureKey]?.enabled ?? true
      const newEnabled = !current
      
      console.log('Toggling feature:', featureKey, 'from', current, 'to', newEnabled)
      
      return {
        ...prevFeatures,
        [featureKey]: {
          ...prevFeatures[featureKey],
          enabled: newEnabled
        }
      }
    })
  }

  // Set environment quality level
  const setEnvironmentQuality = (quality: 'off' | 'low' | 'medium' | 'high') => {
    console.log('Setting environment quality:', quality, 'from current:', environmentQuality)
    setEnvironmentQualityState(quality)
  }

  // Get environment quality
  const getEnvironmentQuality = (): 'off' | 'low' | 'medium' | 'high' => {
    return environmentQuality
  }

  // Track frame time for a specific feature
  const trackFeatureTime = (featureKey: string, timeMs: number) => {
    setFeatures(prevFeatures => ({
      ...prevFeatures,
      [featureKey]: {
        ...prevFeatures[featureKey],
        frameTime: timeMs
      }
    }))
  }

  // Update overall performance metrics (keeping this for compatibility)
  const updateMetrics = (totalFrameTime: number) => {
    frameTimeRef.current = totalFrameTime
    // Note: We now use globalFPS instead of this callback
  }

  // Check if debugging is enabled (any feature is disabled)
  const isDebugging = Object.values(displayMetrics.features).some(f => !f.enabled) || 
                      environmentQuality !== 'high'

  return {
    metrics: displayMetrics,
    features: displayMetrics.features,
    isDebugging,
    toggleFeature,
    setEnvironmentQuality,
    getEnvironmentQuality,
    trackFeatureTime,
    updateMetrics,
    
    // Convenience methods
    isFeatureEnabled: (key: string) => displayMetrics.features[key]?.enabled ?? true,
    getFeatureTime: (key: string) => displayMetrics.features[key]?.frameTime ?? 0
  }
} 