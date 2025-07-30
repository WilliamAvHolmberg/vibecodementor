'use client'

import { useCallback, useRef } from 'react'
import { useMap } from 'react-three-map'
import { vector3ToCoords } from 'react-three-map'

// Origin coordinates for the simulation (Gothenburg, Sweden)
const ORIGIN_COORDS = { latitude: 57.7089, longitude: 11.9746 }

interface TerrainCollisionOptions {
  vehicleGroundClearance?: number
  samplingRadius?: number
  cacheSize?: number
}

interface TerrainSample {
  longitude: number
  latitude: number
  elevation: number
  timestamp: number
}

export function useTerrainCollision({
  vehicleGroundClearance = 0.5,
  samplingRadius = 2,
  cacheSize = 100
}: TerrainCollisionOptions = {}) {
  const map = useMap()
  const elevationCache = useRef<Map<string, TerrainSample>>(new Map())
  const lastCleanup = useRef<number>(Date.now())
  
  // Cache cleanup to prevent memory leaks
  const cleanupCache = useCallback(() => {
    const now = Date.now()
    if (now - lastCleanup.current > 30000) { // Cleanup every 30 seconds
      const cutoff = now - 60000 // Keep samples for 60 seconds
      
      for (const [key, sample] of elevationCache.current.entries()) {
        if (sample.timestamp < cutoff) {
          elevationCache.current.delete(key)
        }
      }
      
      lastCleanup.current = now
    }
  }, [])
  
  // Generate cache key for coordinates (rounded to reduce cache size)
  const getCacheKey = useCallback((longitude: number, latitude: number) => {
    const precision = 0.0001 // ~11m precision
    const roundedLng = Math.round(longitude / precision) * precision
    const roundedLat = Math.round(latitude / precision) * precision
    return `${roundedLng},${roundedLat}`
  }, [])
  
  // Get terrain elevation at specific coordinates
  const getElevationAtCoords = useCallback((longitude: number, latitude: number): number => {
    if (!map) return 0
    
    const cacheKey = getCacheKey(longitude, latitude)
    const cached = elevationCache.current.get(cacheKey)
    
    // Return cached value if recent
    if (cached && Date.now() - cached.timestamp < 30000) {
      return cached.elevation
    }
    
    // Query elevation from Mapbox
    const elevation = map.queryTerrainElevation([longitude, latitude]) || 0
    
    // Cache the result
    const sample: TerrainSample = {
      longitude,
      latitude,
      elevation,
      timestamp: Date.now()
    }
    
    elevationCache.current.set(cacheKey, sample)
    
    // Cleanup cache if needed
    if (elevationCache.current.size > cacheSize) {
      cleanupCache()
    }
    
    return elevation
  }, [map, getCacheKey, cleanupCache, cacheSize])
  
  // Get terrain elevation at Three.js world position
  const getElevationAtPosition = useCallback((x: number, z: number): number => {
    if (!map) return 0
    
    try {
      const coords = vector3ToCoords([x, 0, z], ORIGIN_COORDS)
      return getElevationAtCoords(coords.longitude, coords.latitude)
    } catch (error) {
      console.warn('Failed to convert world position to coordinates:', error)
      return 0
    }
  }, [map, getElevationAtCoords])
  
  // Sample terrain height at multiple points around vehicle for better collision detection
  const sampleTerrainAroundVehicle = useCallback((x: number, z: number) => {
    if (!map) return { height: 0, normal: [0, 1, 0] as [number, number, number] }
    
    // Sample at vehicle center and 4 points around it
    const center = getElevationAtPosition(x, z)
    const front = getElevationAtPosition(x, z + samplingRadius)
    const back = getElevationAtPosition(x, z - samplingRadius)
    const left = getElevationAtPosition(x - samplingRadius, z)
    const right = getElevationAtPosition(x + samplingRadius, z)
    
    // Calculate average height
    const avgHeight = (center + front + back + left + right) / 5
    
    // Calculate surface normal (simplified)
    const dx = right - left
    const dz = front - back
    const normal: [number, number, number] = [-dx, 2 * samplingRadius, -dz]
    
    // Normalize the normal vector
    const length = Math.sqrt(normal[0] * normal[0] + normal[1] * normal[1] + normal[2] * normal[2])
    if (length > 0) {
      normal[0] /= length
      normal[1] /= length
      normal[2] /= length
    }
    
    return { height: avgHeight, normal }
  }, [map, getElevationAtPosition, samplingRadius])
  
  // Apply terrain collision to vehicle position
  const applyTerrainCollision = useCallback((
    currentPosition: [number, number, number]
  ): [number, number, number] => {
    if (!map) return currentPosition
    
    const [x, y, z] = currentPosition
    const { height } = sampleTerrainAroundVehicle(x, z)
    
    // Calculate the desired Y position (terrain height + clearance)
    const desiredY = height + vehicleGroundClearance
    
    // Smooth transition to prevent jerky movement
    const smoothingFactor = 0.1
    const newY = y + (desiredY - y) * smoothingFactor
    
    return [x, newY, z]
  }, [map, sampleTerrainAroundVehicle, vehicleGroundClearance])
  
  // Check if vehicle is on ground (for jump detection, etc.)
  const isOnGround = useCallback((
    currentPosition: [number, number, number],
    tolerance: number = 0.1
  ): boolean => {
    if (!map) return true
    
    const [x, y, z] = currentPosition
    const terrainHeight = getElevationAtPosition(x, z)
    const expectedY = terrainHeight + vehicleGroundClearance
    
    return Math.abs(y - expectedY) <= tolerance
  }, [map, getElevationAtPosition, vehicleGroundClearance])
  
  // Get terrain slope at position (for vehicle physics)
  const getTerrainSlope = useCallback((x: number, z: number): number => {
    if (!map) return 0
    
    const { normal } = sampleTerrainAroundVehicle(x, z)
    
    // Calculate slope angle from normal vector
    const slope = Math.acos(normal[1]) // Angle from vertical
    return slope
  }, [map, sampleTerrainAroundVehicle])
  
  return {
    applyTerrainCollision,
    getElevationAtPosition,
    getElevationAtCoords,
    sampleTerrainAroundVehicle,
    isOnGround,
    getTerrainSlope,
    cacheSize: elevationCache.current.size
  }
}