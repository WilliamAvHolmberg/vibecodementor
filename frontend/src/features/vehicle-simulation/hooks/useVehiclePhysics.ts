'use client'

import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { VehicleState, VehiclePhysics, VehicleControls, VehicleType } from '../types'
import { useTerrainCollision } from './useTerrainCollision'

interface UseVehiclePhysicsOptions {
  type: VehicleType
  physics: VehiclePhysics
  controls: VehicleControls
  onSpeedUpdate?: (speed: number) => void
  onPositionUpdate?: (position: [number, number, number], rotation: number) => void
  enableTerrainCollision?: boolean
}

export function useVehiclePhysics({
  type,
  physics,
  controls,
  onSpeedUpdate,
  onPositionUpdate,
  enableTerrainCollision = true
}: UseVehiclePhysicsOptions) {
  const [vehicleState, setVehicleState] = useState<VehicleState>({
    position: [0, 0, -90],
    speed: 0,
    rotation: 0,
    steeringAngle: 0,
    pitch: 0,
    roll: 0
  })

  const groupRef = useRef<THREE.Group>(null)
  const terrainCollision = useTerrainCollision({
    vehicleGroundClearance: type === 'car' ? 0.5 : 2.0,
    samplingRadius: type === 'car' ? 2 : 5,
    cacheSize: 200
  })

  useFrame((state, delta) => {
    if (!groupRef.current) return

    const newState = { ...vehicleState }

    if (type === 'car') {
      updateCarPhysics(newState, physics, controls, delta)
    } else if (type === 'airplane') {
      updateAirplanePhysics(newState, physics, controls, delta)
    }

    // Apply terrain collision if enabled
    if (enableTerrainCollision && type === 'car') {
      newState.position = terrainCollision.applyTerrainCollision(newState.position)
    }

    // Update 3D object position and rotation
    groupRef.current.position.set(newState.position[0], newState.position[1], newState.position[2])
    groupRef.current.rotation.y = newState.rotation
    if (newState.pitch !== undefined) groupRef.current.rotation.x = newState.pitch
    if (newState.roll !== undefined) groupRef.current.rotation.z = newState.roll

    setVehicleState(newState)
    
    if (onSpeedUpdate) {
      onSpeedUpdate(newState.speed)
    }
    
    if (onPositionUpdate) {
      onPositionUpdate(newState.position, newState.rotation)
    }
  })

  return { 
    vehicleState, 
    groupRef, 
    terrainCollision: enableTerrainCollision ? terrainCollision : null 
  }
}

function updateCarPhysics(
  state: VehicleState,
  physics: VehiclePhysics,
  controls: VehicleControls,
  delta: number
) {
  // Sports car physics constants
  const airDensity = 1.225 // kg/m³ at sea level
  const rollingResistanceCoeff = 0.008 // High-performance tires (lower resistance)
  const gravity = 9.81 // m/s²

  // Calculate power and forces - SPORTS CAR TUNING
  const powerWattage = physics.enginePower * 745.7 // Convert HP to Watts
  const powerToWeightRatio = powerWattage / physics.vehicleWeight // W/kg
  const baseAcceleration = powerToWeightRatio * 0.12 // 6x more responsive!

  // Air resistance (sports cars have better aerodynamics)
  const dragForce = 0.5 * airDensity * physics.dragCoefficient * physics.frontalArea * (state.speed * state.speed)
  const dragAcceleration = dragForce / physics.vehicleWeight * 0.7 // 30% less drag effect

  // Rolling resistance (sports tires grip better)
  const rollingResistanceForce = physics.vehicleWeight * gravity * rollingResistanceCoeff
  const rollingAcceleration = rollingResistanceForce / physics.vehicleWeight

  // Forward/backward movement - SPORTS CAR ACCELERATION
  if (controls.forward) {
    // Quick acceleration with boost at low speeds
    const speedBoost = state.speed < 10 ? 1.5 : 1.0
    const currentAcceleration = Math.max(baseAcceleration * speedBoost - dragAcceleration - rollingAcceleration, baseAcceleration * 0.3)
    state.speed = Math.min(state.speed + currentAcceleration * delta, physics.maxSpeed)
  } else if (controls.backward) {
    // Powerful brakes on sports cars
    const brakeForce = baseAcceleration * 5 // Stronger brakes
    state.speed = Math.max(state.speed - brakeForce * delta, -physics.maxSpeed * 0.4)
  } else {
    // Coasting - sports cars maintain momentum better
    const naturalDeceleration = Math.max(dragAcceleration + rollingAcceleration, baseAcceleration * 0.1)
    if (state.speed > 0) {
      state.speed = Math.max(state.speed - naturalDeceleration * delta, 0)
    } else if (state.speed < 0) {
      state.speed = Math.min(state.speed + naturalDeceleration * delta, 0)
    }
  }

  // Steering - SPORTS CAR HANDLING
  const minimumSteeringSpeed = 0.1 // Can turn at lower speeds
  const maxSteerAngle = 0.8 // Sharper turning radius
  const rotationSpeed = 2.0 // Much more responsive steering

  if (Math.abs(state.speed) > minimumSteeringSpeed) {
    if (controls.right) {
      state.steeringAngle = -maxSteerAngle
    } else if (controls.left) {
      state.steeringAngle = maxSteerAngle
    } else {
      state.steeringAngle = 0
    }
  }

  // Car rotation - sports car precision
  if (Math.abs(state.speed) > minimumSteeringSpeed && Math.abs(state.steeringAngle || 0) > 0.1) {
    // Better steering response at all speeds
    const speedFactor = Math.min(Math.abs(state.speed) / 15, 1) // Reaches max steering faster
    const steeringDirection = state.speed >= 0 ? 1 : -1
    
    // Add slight drift effect at high speeds
    const driftFactor = state.speed > 30 ? 1.1 : 1.0
    
    state.rotation += (state.steeringAngle || 0) * rotationSpeed * speedFactor * steeringDirection * driftFactor * delta
  }

  // Move in the direction the car is facing
  // IMPORTANT: Mapbox world scale adjustment
  // In react-three-map, 1 unit ≈ 0.1 meters at ground level (approximate)
  // So we need to scale our m/s speed by 10 to get proper visual movement
  const worldScale = 2 // Adjust this to make speed feel right
  const moveDistance = state.speed * delta * worldScale
  state.position[0] += Math.sin(state.rotation) * moveDistance
  state.position[2] += Math.cos(state.rotation) * moveDistance
}

function updateAirplanePhysics(
  state: VehicleState,
  physics: VehiclePhysics,
  controls: VehicleControls,
  delta: number
) {
  // Airplane physics (simplified for future implementation)
  const baseAcceleration = (physics.enginePower * 745.7) / physics.vehicleWeight * 0.01
  const dragAcceleration = 0.5 * 1.225 * physics.dragCoefficient * physics.frontalArea * (state.speed * state.speed) / physics.vehicleWeight

  // Thrust/drag
  if (controls.forward) {
    state.speed = Math.min(state.speed + baseAcceleration * delta, physics.maxSpeed)
  } else if (controls.backward) {
    state.speed = Math.max(state.speed - baseAcceleration * delta, 0)
  } else {
    state.speed = Math.max(state.speed - dragAcceleration * delta, 0)
  }

  // Pitch control
  if (controls.up) {
    state.pitch = Math.max((state.pitch || 0) - 0.5 * delta, -Math.PI / 3)
  } else if (controls.down) {
    state.pitch = Math.min((state.pitch || 0) + 0.5 * delta, Math.PI / 3)
  } else {
    state.pitch = (state.pitch || 0) * 0.98 // Gradual return to level
  }

  // Roll/yaw control
  if (controls.left) {
    state.roll = Math.max((state.roll || 0) - 0.8 * delta, -Math.PI / 6)
    state.rotation += 0.5 * delta
  } else if (controls.right) {
    state.roll = Math.min((state.roll || 0) + 0.8 * delta, Math.PI / 6)
    state.rotation -= 0.5 * delta
  } else {
    state.roll = (state.roll || 0) * 0.95 // Gradual return to level
  }

  // Move in 3D space
  const moveDistance = state.speed * delta
  state.position[0] += Math.sin(state.rotation) * moveDistance
  state.position[2] += Math.cos(state.rotation) * moveDistance
  state.position[1] += Math.sin(state.pitch || 0) * moveDistance
}