export interface VehicleState {
  position: [number, number, number]
  speed: number
  rotation: number
  steeringAngle?: number
  pitch?: number // For airplanes
  roll?: number  // For airplanes
}

export interface VehiclePhysics {
  enginePower: number    // HP for cars, thrust for airplanes
  vehicleWeight: number  // kg
  dragCoefficient: number
  frontalArea: number    // m²
  maxSpeed: number       // m/s
}

export interface VehicleControls {
  forward: boolean
  backward: boolean
  left: boolean
  right: boolean
  up?: boolean    // For airplanes
  down?: boolean  // For airplanes
}

export type VehicleType = 'car' | 'airplane'

export interface VehicleConfig {
  type: VehicleType
  physics: VehiclePhysics
  controls: {
    forward: string
    backward: string
    left: string
    right: string
    up?: string
    down?: string
  }
}

export interface FPSData {
  current: number
  callbacks: Set<(fps: number) => void>
}