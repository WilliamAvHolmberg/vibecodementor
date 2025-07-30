'use client'

import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { FPSData } from '../types'

// Global FPS state
const globalFPSData: FPSData = {
  current: 0,
  callbacks: new Set()
}

// Expose FPS globally for system metrics
if (typeof globalThis !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).__fps_global_state__ = 60 // Default value
}

interface FPSTrackerProps {
  onUpdate?: (totalFrameTime: number, fps: number) => void
}

export function FPSTracker({ onUpdate }: FPSTrackerProps) {
  const frameCount = useRef(0)
  const lastTime = useRef(performance.now())

  useFrame(() => {
    frameCount.current++
    const currentTime = performance.now()

    if (currentTime - lastTime.current >= 1000) {
      const newFPS = Math.round(frameCount.current * 1000 / (currentTime - lastTime.current))
      globalFPSData.current = newFPS

      // Update global state for system metrics
      if (typeof globalThis !== 'undefined') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (globalThis as any).__fps_global_state__ = newFPS
      }

      globalFPSData.callbacks.forEach(callback => callback(newFPS))

      // Report to performance debugger
      if (onUpdate) {
        const avgFrameTime = 1000 / newFPS
        onUpdate(avgFrameTime, newFPS)
      }

      frameCount.current = 0
      lastTime.current = currentTime
    }
  })

  return null
}

export function useFPS() {
  const [fps, setFps] = useState(0)

  useEffect(() => {
    const callback = (newFPS: number) => setFps(newFPS)
    globalFPSData.callbacks.add(callback)

    return () => {
      globalFPSData.callbacks.delete(callback)
    }
  }, [])

  return fps
}