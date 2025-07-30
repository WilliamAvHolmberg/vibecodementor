'use client'

import { useVehiclePhysics } from '../hooks/useVehiclePhysics'
import { useKeyboardControls } from '../hooks/useKeyboardControls'
import { VehiclePhysics } from '../types'

interface CarProps {
  onSpeedUpdate?: (speed: number) => void
  physics?: Partial<VehiclePhysics>
  onTerrainUpdate?: (terrainInfo: { elevation: number; isOnGround: boolean; cacheSize: number }) => void
  onPositionUpdate?: (position: [number, number, number], rotation: number) => void
  enableTerrain?: boolean
  enablePhysics?: boolean
}

const defaultCarPhysics: VehiclePhysics = {
  enginePower: 300,    // HP
  vehicleWeight: 1500, // kg
  dragCoefficient: 0.01,
  frontalArea: 2.5,    // m²
  maxSpeed: 70         // m/s (~250 km/h)
}

export function Car({ 
  onSpeedUpdate, 
  physics = {}, 
  onTerrainUpdate,
  onPositionUpdate,
  enableTerrain = true,
  enablePhysics = true
}: CarProps) {
  const carPhysics = { ...defaultCarPhysics, ...physics }
  
  const controls = useKeyboardControls({
    forward: 'w',
    backward: 's',
    left: 'a',
    right: 'd'
  })

  const { vehicleState, groupRef, terrainCollision } = useVehiclePhysics({
    type: 'car',
    physics: carPhysics,
    controls: enablePhysics ? controls.current : { forward: false, backward: false, left: false, right: false },
    onSpeedUpdate: (speed) => {
      if (onSpeedUpdate) onSpeedUpdate(speed)
      
      // Update terrain info if collision is enabled
      if (terrainCollision && onTerrainUpdate && enableTerrain) {
        const [x, , z] = vehicleState.position
        const elevation = terrainCollision.getElevationAtPosition(x, z)
        const isOnGround = terrainCollision.isOnGround(vehicleState.position)
        const cacheSize = terrainCollision.cacheSize
        
        onTerrainUpdate({ elevation, isOnGround, cacheSize })
      }
    },
    onPositionUpdate,
    enableTerrainCollision: enableTerrain
  })

  return (
    <group ref={groupRef}>
      {/* Car body - realistic sedan dimensions */}
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[1.8, 1.2, 4.2]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>
      
      {/* Car wheels - realistic proportions */}
      <mesh position={[-0.9, 0.35, 1.2]} rotation={[0, vehicleState.steeringAngle || 0, Math.PI/2]}>
        <cylinderGeometry args={[0.35, 0.35, 0.2]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[0.9, 0.35, 1.2]} rotation={[0, vehicleState.steeringAngle || 0, Math.PI/2]}>
        <cylinderGeometry args={[0.35, 0.35, 0.2]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[-0.9, 0.35, -1.2]} rotation={[0, 0, Math.PI/2]}>
        <cylinderGeometry args={[0.35, 0.35, 0.2]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[0.9, 0.35, -1.2]} rotation={[0, 0, Math.PI/2]}>
        <cylinderGeometry args={[0.35, 0.35, 0.2]} />
        <meshStandardMaterial color="#333" />
      </mesh>
    </group>
  )
}