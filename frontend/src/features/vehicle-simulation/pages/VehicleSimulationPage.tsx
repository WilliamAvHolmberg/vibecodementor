'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import Map from 'react-map-gl/mapbox'
import { Canvas } from 'react-three-map'
import { vector3ToCoords } from 'react-three-map'
import { Environment, PerformanceMonitor, AdaptiveDpr } from '@react-three/drei'
import 'mapbox-gl/dist/mapbox-gl.css'

import { Car } from '../components/Car'
import { ReferenceObjects } from '../components/ReferenceObjects'
import { VehicleControls } from '../components/VehicleControls'
import { SimulationUI } from '../components/SimulationUI'
import { PerformanceDebugPanel } from '../components/PerformanceDebugPanel'
import { usePerformanceDebugger } from '../hooks/usePerformanceDebugger'
import { FPSTracker } from '../hooks/useFPS'

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

// Origin coordinates for the simulation (Gothenburg, Sweden)
const ORIGIN_COORDS = { latitude: 57.7089, longitude: 11.9746 }

export function VehicleSimulationPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null)
  const mapLoadedRef = useRef(false)
  const [bearingMode, setBearingMode] = useState<'direct' | 'inverted' | 'offset_90' | 'offset_neg90'>('direct')
  const [cameraUpdateInterval, setCameraUpdateInterval] = useState(250) // Dynamic camera update frequency
  
  // Physics data stored in refs (no re-renders)
  const currentSpeedRef = useRef(0)
  const terrainInfoRef = useRef<{
    elevation: number
    isOnGround: boolean
    cacheSize: number
  } | undefined>(undefined)

  // Position tracking for camera
  const lastCameraUpdateRef = useRef(0)
  const playerPositionRef = useRef<{
    position: [number, number, number]
    rotation: number
  } | undefined>(undefined)

  // Display state (updates at 10fps for UI)
  const [displaySpeed, setDisplaySpeed] = useState(0)
  const [displayTerrainInfo, setDisplayTerrainInfo] = useState<{
    elevation: number
    isOnGround: boolean
    cacheSize: number
  } | undefined>(undefined)
  const [displayPlayerPosition, setDisplayPlayerPosition] = useState<{
    position: [number, number, number]
    rotation: number
    mapboxCoords: { latitude: number; longitude: number }
  } | undefined>(undefined)
  const [displayCameraPosition, setDisplayCameraPosition] = useState<{
    latitude: number
    longitude: number
    zoom: number
    pitch: number
    bearing: number
  } | undefined>(undefined)

  // Update display state every 100ms (10fps - smooth enough for UI)
  useEffect(() => {
    const interval = setInterval(() => {
      setDisplaySpeed(currentSpeedRef.current)
      setDisplayTerrainInfo(terrainInfoRef.current)
      // Convert player position to display format with mapbox coords
      if (playerPositionRef.current) {
        const coords = vector3ToCoords(playerPositionRef.current.position, ORIGIN_COORDS)
        setDisplayPlayerPosition({
          ...playerPositionRef.current,
          mapboxCoords: { latitude: coords.latitude, longitude: coords.longitude }
        })
      } else {
        setDisplayPlayerPosition(undefined)
      }

      // Update camera position display
      if (mapRef.current && mapLoadedRef.current) {
        try {
          const map = mapRef.current.getMap()
          if (map.loaded()) {
            const center = map.getCenter()
            setDisplayCameraPosition({
              latitude: center.lat,
              longitude: center.lng,
              zoom: map.getZoom(),
              pitch: map.getPitch(),
              bearing: map.getBearing()
            })
          }
        } catch (error) {
          console.warn('Failed to get camera position:', error)
        }
      }
    }, 100)

        return () => clearInterval(interval)
  }, [])
  
  // Bearing mode cycling (for testing)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'b' || e.key === 'B') {
        setBearingMode(prev => {
          const modes: typeof bearingMode[] = ['direct', 'inverted', 'offset_90', 'offset_neg90']
          const currentIndex = modes.indexOf(prev)
          const nextIndex = (currentIndex + 1) % modes.length
          console.log(`🧭 Bearing mode: ${modes[nextIndex]}`)
          return modes[nextIndex]
        })
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])
  
  // Map load handler
  const handleMapLoad = useCallback(() => {
    console.log('🗺️ Map loaded successfully')
    mapLoadedRef.current = true
  }, [])

  // Stable callback references that just update refs
  const handleSpeedUpdate = useCallback((speed: number) => {
    currentSpeedRef.current = speed
  }, [])

  const handleTerrainUpdate = useCallback((terrainInfo: { elevation: number; isOnGround: boolean; cacheSize: number }) => {
    terrainInfoRef.current = terrainInfo
  }, [])

  const handlePositionUpdate = useCallback((position: [number, number, number], rotation: number) => {
    // Always update the player position ref - no throttling here
    playerPositionRef.current = { position, rotation }
  }, [])

  // Camera update with easeTo at dynamic interval
  useEffect(() => {
    const updateInterval = setInterval(() => {
      if (playerPositionRef.current && mapRef.current && mapLoadedRef.current) {
        try {
          const map = mapRef.current.getMap()
          
          if (map.loaded() && map.isStyleLoaded()) {
            const { position, rotation } = playerPositionRef.current
            const coords = vector3ToCoords(position, ORIGIN_COORDS)
            const bearing = (-rotation * 180 / Math.PI) + 180

            // Use easeTo for smooth transitions
            // Duration is 80% of interval for smooth blending
            const duration = Math.floor(cameraUpdateInterval * 0.9)
            
            map.easeTo({
              essential: true,
              center: [coords.longitude, coords.latitude],
              bearing: bearing,
              //pitch: 10,
              duration: duration,
              easing: (t: number) => t  // Linear easing for consistent motion
            })
          }
        } catch (error) {
          // Silently handle errors
        }
      }
    }, cameraUpdateInterval)

    // Cleanup
    return () => {
      clearInterval(updateInterval)
    }
  }, [cameraUpdateInterval])

  const {
    isFeatureEnabled,
    getEnvironmentQuality
  } = usePerformanceDebugger()

  const carPhysics = {
    enginePower: 300,
    vehicleWeight: 1500
  }

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Missing Mapbox Token</h1>
          <p>Please add NEXT_PUBLIC_MAPBOX_TOKEN to your environment variables</p>
        </div>
      </div>
    )
  }

  const environmentQuality = getEnvironmentQuality()
  const showEnvironment = environmentQuality !== 'off'

  return (
    <div className="relative w-full h-screen">
      <Map
        ref={mapRef}
        initialViewState={{
          latitude: 57.7089,
          longitude: 11.9746,
          zoom: 15,
          pitch: 60,
          bearing: 0
        }}
        mapStyle="mapbox://styles/wavh/cma00p05j00d801sidut082jr"
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
        terrain={{ source: 'mapbox-dem', exaggeration: 1.5 }}
        onLoad={handleMapLoad}
      >
        <Canvas latitude={57.7089} longitude={11.9746}
          overlay={true}
        >
          {/* Performance Features */}
          <AdaptiveDpr pixelated />
          <PerformanceMonitor
            onDecline={({ averages }) => {
              const fps = averages[0]
              console.log('🔥 Performance decline detected:', fps, 'FPS')
            }}
            onIncline={() => {
              console.log('✨ Performance improved')
            }}
          />

          <FPSTracker />

          {/* Conditional Environment Lighting */}
          {showEnvironment && (
            <Environment
              preset={
                environmentQuality === 'low' ? 'dawn' :
                  environmentQuality === 'medium' ? 'sunset' :
                    'city'
              }
              environmentIntensity={
                environmentQuality === 'low' ? 0.3 :
                  environmentQuality === 'medium' ? 0.6 :
                    1.0
              }
            />
          )}

          {/* Fallback lighting when environment is disabled */}
          {!showEnvironment && (
            <>
              <hemisphereLight
                args={["#ffffff", "#60666C"]}
                position={[1, 4.5, 3]}
              />
              <directionalLight
                position={[10, 10, 10]}
                intensity={1}
                castShadow={isFeatureEnabled('shadows')}
              />
            </>
          )}

          {/* Conditional Reference Objects */}
          {isFeatureEnabled('references') && <ReferenceObjects />}

          {/* Vehicle with stable callback references */}
          <Car
            onSpeedUpdate={handleSpeedUpdate}
            onTerrainUpdate={handleTerrainUpdate}
            onPositionUpdate={handlePositionUpdate}
            enableTerrain={isFeatureEnabled('terrain')}
            enablePhysics={isFeatureEnabled('physics')}
          />
        </Canvas>
      </Map>

      {/* UI Overlays - now using display state */}
      <VehicleControls
        currentSpeed={displaySpeed}
        vehicleType="car"
        physics={carPhysics}
        terrainInfo={displayTerrainInfo}
      />
      <SimulationUI />

      {/* Camera Update Frequency Control */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/80 text-white p-4 rounded-lg">
        <div className="flex items-center gap-3">
          <label className="text-sm font-bold">Camera Update Interval:</label>
          <input
            type="number"
            value={cameraUpdateInterval}
            onChange={(e) => setCameraUpdateInterval(Math.max(16, parseInt(e.target.value) || 250))}
            className="w-20 px-2 py-1 bg-gray-700 rounded text-white"
            min="16"
            max="1000"
            step="10"
          />
          <span className="text-xs opacity-75">ms ({(1000 / cameraUpdateInterval).toFixed(1)} fps)</span>
          <div className="text-xs opacity-75">
            <span className="text-green-400">16ms = 60fps</span> | 
            <span className="text-yellow-400"> 33ms = 30fps</span> | 
            <span className="text-orange-400"> 100ms = 10fps</span>
          </div>
        </div>
      </div>

      {/* Position Debug Panel */}
      <div className="absolute top-4 right-4 bg-black/80 text-white p-4 rounded-lg max-w-sm">
        <h2 className="text-lg font-bold mb-2">🎯 Position Debug</h2>
        <div className="text-sm space-y-2">
          <div className="p-2 bg-blue-900/50 rounded">
            <p className="text-xs font-bold">Player Position:</p>
            {displayPlayerPosition ? (
              <>
                <div className="border-b border-blue-800 pb-2 mb-2">
                  <p className="text-xs text-blue-300 font-bold">3D World Coords:</p>
                  <p className="text-xs font-mono">
                    X: {displayPlayerPosition.position[0].toFixed(2)}
                  </p>
                  <p className="text-xs font-mono">
                    Y: {displayPlayerPosition.position[1].toFixed(2)}
                  </p>
                  <p className="text-xs font-mono">
                    Z: {displayPlayerPosition.position[2].toFixed(2)}
                  </p>
                </div>
                <div className="border-b border-blue-800 pb-2 mb-2">
                  <p className="text-xs text-blue-300 font-bold">Mapbox Coords:</p>
                  <p className="text-xs font-mono">
                    Lat: {displayPlayerPosition.mapboxCoords.latitude.toFixed(6)}
                  </p>
                  <p className="text-xs font-mono">
                    Lng: {displayPlayerPosition.mapboxCoords.longitude.toFixed(6)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-blue-300 font-bold">Rotation:</p>
                  <p className="text-xs font-mono">
                    {displayPlayerPosition.rotation.toFixed(3)}rad
                  </p>
                  <p className="text-xs font-mono">
                    {((displayPlayerPosition.rotation * 180) / Math.PI).toFixed(1)}° bearing
                  </p>
                </div>
              </>
            ) : (
              <p className="text-xs opacity-75">No position data</p>
            )}
          </div>

          <div className="p-2 bg-green-900/50 rounded">
            <p className="text-xs font-bold">Camera Position:</p>
            {displayCameraPosition ? (
              <>
                <p className="text-xs font-mono">
                  Lat: {displayCameraPosition.latitude.toFixed(6)}
                </p>
                <p className="text-xs font-mono">
                  Lng: {displayCameraPosition.longitude.toFixed(6)}
                </p>
                <p className="text-xs font-mono">
                  Zoom: {displayCameraPosition.zoom.toFixed(2)}
                </p>
                <p className="text-xs font-mono">
                  Pitch: {displayCameraPosition.pitch.toFixed(1)}°
                </p>
                <p className="text-xs font-mono">
                  Bearing: {displayCameraPosition.bearing.toFixed(1)}°
                </p>
              </>
            ) : (
              <p className="text-xs opacity-75">No camera data</p>
            )}
          </div>

          <div className="p-2 bg-yellow-900/50 rounded">
            <p className="text-xs font-bold">Rotation Debug:</p>
            <p className="text-xs text-yellow-300">
              Bearing Mode: <span className="font-mono">{bearingMode}</span> (Press B to cycle)
            </p>
            {displayPlayerPosition ? (
              <>
                <p className="text-xs font-mono">
                  Vehicle Dir: {Math.sin(displayPlayerPosition.rotation) > 0 ? '+X' : '-X'} 
                  {Math.abs(Math.sin(displayPlayerPosition.rotation)) > 0.5 ? ' (Strong)' : ' (Weak)'}
                </p>
                <p className="text-xs font-mono">
                  Vehicle Dir: {Math.cos(displayPlayerPosition.rotation) > 0 ? '+Z' : '-Z'}
                  {Math.abs(Math.cos(displayPlayerPosition.rotation)) > 0.5 ? ' (Strong)' : ' (Weak)'}
                </p>
                <p className="text-xs font-mono">
                  Expected: {
                    Math.abs(Math.sin(displayPlayerPosition.rotation)) > Math.abs(Math.cos(displayPlayerPosition.rotation))
                      ? (Math.sin(displayPlayerPosition.rotation) > 0 ? 'East' : 'West')
                      : (Math.cos(displayPlayerPosition.rotation) > 0 ? 'North' : 'South')
                  }
                </p>
              </>
            ) : null}
          </div>
          
          <p className="text-xs opacity-75 mt-2">
            Camera updates every 1s • Drive around to test rotation sync
          </p>
        </div>
      </div>

      {/* Nuclear Performance Debugger */}
      <PerformanceDebugPanel />
    </div>
  )
}