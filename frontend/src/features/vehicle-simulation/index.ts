// Main exports
export { VehicleSimulationPage } from './pages/VehicleSimulationPage'

// Vehicle components
export { Car } from './components/Car'
export { ReferenceObjects } from './components/ReferenceObjects'
export { SimulationUI } from './components/SimulationUI'

// Hooks
export { useVehiclePhysics } from './hooks/useVehiclePhysics'
export { useKeyboardControls } from './hooks/useKeyboardControls'
export { useFPS, FPSTracker } from './hooks/useFPS'
export { usePerformanceDebugger } from './hooks/usePerformanceDebugger'
export { useSystemMetrics } from './hooks/useSystemMetrics'

// Types
export type { 
  VehicleState, 
  VehiclePhysics, 
  VehicleControls, 
  VehicleType, 
  VehicleConfig,
  FPSData 
} from './types'
export type { DebugFeature, PerformanceMetrics } from './hooks/usePerformanceDebugger'
export type { SystemMetrics } from './hooks/useSystemMetrics'