'use client'

import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import { usePerformanceDebugger } from '../hooks/usePerformanceDebugger'

export function PerformanceDebugPanel() {
  const {
    metrics,
    features,
    isDebugging,
    toggleFeature,
    setEnvironmentQuality,
    getEnvironmentQuality
  } = usePerformanceDebugger()
  
  const [isExpanded, setIsExpanded] = useState(false)

  const environmentQuality = getEnvironmentQuality()
  const totalFeatureTime = Object.values(features).reduce((sum, f) => sum + f.frameTime, 0)

  // Helper function to get trend icon
  const getTrendIcon = (trend: '→' | '↗️' | '↘️') => {
    return trend
  }

  // Helper function to get color based on CPU pressure
  const getCPUPressureColor = (pressure: 'nominal' | 'fair' | 'serious' | 'critical' | 'unknown') => {
    switch (pressure) {
      case 'nominal': return 'text-green-400'
      case 'fair': return 'text-yellow-400'
      case 'serious': return 'text-orange-400'
      case 'critical': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  // Helper function to display pressure state
  const getPressureDisplay = (pressure: 'nominal' | 'fair' | 'serious' | 'critical' | 'unknown') => {
    switch (pressure) {
      case 'nominal': return '⚪ Normal'
      case 'fair': return '🟢 Fair'
      case 'serious': return '🟡 High'
      case 'critical': return '🔴 Critical'
      default: return '❓ Unknown'
    }
  }

  const getMemoryColor = (growth: number) => {
    if (Math.abs(growth) < 0.1) return 'text-green-400'
    if (growth > 1) return 'text-red-400'
    return 'text-yellow-400'
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      {/* Minimized State */}
      {!isExpanded && (
        <div 
          className={`bg-black/90 text-white rounded-lg p-3 cursor-pointer transition-all hover:bg-black/95 ${
            isDebugging ? 'border-2 border-yellow-400' : 'border border-gray-600'
          }`}
          onClick={() => setIsExpanded(true)}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-sm font-mono">
              {metrics.fps.toFixed(0)} FPS
            </span>
            {isDebugging && (
              <span className="text-xs text-yellow-400">DEBUG</span>
            )}
          </div>
        </div>
      )}

      {/* Expanded State */}
      {isExpanded && (
        <div className="bg-black/95 text-white rounded-lg p-4 w-80 border border-gray-600 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">Performance Debugger</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-white h-6 w-6 p-0"
            >
              ×
            </Button>
          </div>

          {/* Overall Metrics */}
          <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-gray-800/50 rounded">
            <div>
              <div className="text-xs text-gray-400">FPS</div>
              <div className={`text-xl font-mono ${
                metrics.fps >= 55 ? 'text-green-400' : 
                metrics.fps >= 45 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {metrics.fps.toFixed(0)}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Frame Time</div>
              <div className="text-xl font-mono text-blue-400">
                {metrics.totalFrameTime.toFixed(1)}ms
              </div>
            </div>
          </div>

          {/* System Metrics */}
          <div className="mb-4 p-3 bg-gray-800/30 rounded">
            <div className="text-sm font-medium mb-3">System Performance</div>
            
            {/* CPU, GPU, and Memory */}
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="bg-gray-700/50 p-2 rounded">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    CPU Pressure {!metrics.system.cpu.supported && '(Fallback)'}
                  </span>
                  <span className="text-xs">{getTrendIcon(metrics.system.cpu.trend)}</span>
                </div>
                <div className={`text-lg font-mono ${getCPUPressureColor(metrics.system.cpu.pressure)}`}>
                  {getPressureDisplay(metrics.system.cpu.pressure)}
                </div>
                {!metrics.system.cpu.supported && (
                  <div className="text-xs text-gray-500">
                    Browser API not supported
                  </div>
                )}
              </div>
              
              <div className="bg-gray-700/50 p-2 rounded">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    GPU Pressure {!metrics.system.gpu.supported && '(Not Available)'}
                  </span>
                  <span className="text-xs">{getTrendIcon(metrics.system.gpu.trend)}</span>
                </div>
                <div className={`text-lg font-mono ${getCPUPressureColor(metrics.system.gpu.pressure)}`}>
                  {getPressureDisplay(metrics.system.gpu.pressure)}
                </div>
                {!metrics.system.gpu.supported && (
                  <div className="text-xs text-gray-500">
                    GPU monitoring not supported
                  </div>
                )}
              </div>
              
              <div className="bg-gray-700/50 p-2 rounded">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Memory</span>
                  <span className="text-xs">{getTrendIcon(metrics.system.memory.trend)}</span>
                </div>
                <div className="text-lg font-mono text-blue-400">
                  {metrics.system.memory.used}MB
                </div>
                <div className={`text-xs ${getMemoryColor(metrics.system.memory.growth)}`}>
                  {metrics.system.memory.growth >= 0 ? '+' : ''}{metrics.system.memory.growth} MB/s
                </div>
              </div>
            </div>

            {/* Performance Details */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-gray-700/30 p-2 rounded">
                <div className="text-gray-400">Main Thread Block</div>
                <div className={`font-mono ${
                  metrics.system.performance.mainThreadBlocking > 100 ? 'text-red-400' :
                  metrics.system.performance.mainThreadBlocking > 50 ? 'text-yellow-400' : 
                  'text-green-400'
                }`}>
                  {metrics.system.performance.mainThreadBlocking}ms
                </div>
              </div>
              
              <div className="bg-gray-700/30 p-2 rounded">
                <div className="text-gray-400">Frame Drops</div>
                <div className={`font-mono ${
                  metrics.system.performance.frameDrops > 5 ? 'text-red-400' :
                  metrics.system.performance.frameDrops > 0 ? 'text-yellow-400' : 
                  'text-green-400'
                }`}>
                  {metrics.system.performance.frameDrops}
                </div>
              </div>
            </div>
          </div>

          {/* Environment Quality */}
          <div className="mb-4">
            <div className="text-sm font-medium mb-2">Environment Quality</div>
            <div className="grid grid-cols-4 gap-1">
              {(['off', 'low', 'medium', 'high'] as const).map((quality) => (
                <Button
                  key={quality}
                  variant={environmentQuality === quality ? "default" : "secondary"}
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    console.log('Environment quality clicked:', quality, 'current:', environmentQuality)
                    setEnvironmentQuality(quality)
                  }}
                  className={`text-xs h-8 font-medium cursor-pointer ${
                    environmentQuality === quality 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600' 
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-200 border-gray-600'
                  }`}
                >
                  {quality.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>

          {/* Feature Toggles */}
          <div className="mb-4">
            <div className="text-sm font-medium mb-3">Features</div>
            <div className="space-y-2">
              {Object.values(features).map((feature) => (
                <div 
                  key={feature.key}
                  className="flex items-center justify-between p-2 bg-gray-800/30 rounded hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          console.log('Toggle clicked for:', feature.key, 'current state:', feature.enabled)
                          toggleFeature(feature.key)
                        }}
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all cursor-pointer hover:scale-110 ${
                          feature.enabled 
                            ? 'bg-green-500 border-green-500' 
                            : 'border-gray-500 hover:border-gray-400'
                        }`}
                      >
                        {feature.enabled && (
                          <div className="w-2 h-2 bg-white rounded-sm"></div>
                        )}
                      </button>
                      <span 
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          console.log('Label clicked for:', feature.key, 'current state:', feature.enabled)
                          toggleFeature(feature.key)
                        }}
                        className={`text-sm cursor-pointer select-none ${feature.enabled ? 'text-white' : 'text-gray-500'}`}
                      >
                        {feature.name}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 ml-6">
                      {feature.description}
                    </div>
                  </div>
                  <div className="text-xs font-mono text-blue-400 ml-2">
                    {feature.frameTime > 0 ? `${feature.frameTime.toFixed(1)}ms` : '—'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feature Time Breakdown */}
          {totalFeatureTime > 0 && (
            <div className="mb-4 p-3 bg-gray-800/30 rounded">
              <div className="text-xs text-gray-400 mb-2">Feature Breakdown</div>
              <div className="text-xs font-mono">
                Total: {totalFeatureTime.toFixed(1)}ms ({((totalFeatureTime / metrics.totalFrameTime) * 100).toFixed(1)}%)
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 