'use client'

import { VehicleType } from '../types'

interface VehicleControlsProps {
  currentSpeed: number
  vehicleType: VehicleType
  physics: {
    enginePower: number
    vehicleWeight: number
  }
  terrainInfo?: {
    elevation: number
    isOnGround: boolean
    cacheSize: number
  }
}

export function VehicleControls({ currentSpeed, vehicleType, physics, terrainInfo }: VehicleControlsProps) {
  const powerToWeight = (physics.enginePower / physics.vehicleWeight).toFixed(2)
  
  return (
    <div className="absolute top-4 left-4 bg-black/80 text-white p-4 rounded-lg max-w-sm">
      <h2 className="text-lg font-bold mb-2">
        {vehicleType === 'car' ? '🏎️' : '✈️'} {vehicleType === 'car' ? 'Car' : 'Airplane'} Physics
      </h2>
      <div className="text-sm space-y-2">
        <p><strong>Controls:</strong></p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div><strong>W</strong> - {vehicleType === 'car' ? 'Forward' : 'Thrust'}</div>
          <div><strong>S</strong> - {vehicleType === 'car' ? 'Backward' : 'Reverse'}</div>
          <div><strong>A</strong> - Turn Left</div>
          <div><strong>D</strong> - Turn Right</div>
          {vehicleType === 'airplane' && (
            <>
              <div><strong>Q</strong> - Pitch Up</div>
              <div><strong>E</strong> - Pitch Down</div>
            </>
          )}
        </div>
        <div className="mt-3 p-2 bg-blue-900/50 rounded">
          <p className="text-xs font-bold">Current Speed:</p>
          <p className="text-lg font-mono">{(currentSpeed * 3.6).toFixed(1)} km/h</p>
          <p className="text-xs opacity-75">{currentSpeed.toFixed(1)} m/s</p>
        </div>
        <div className="mt-2 p-2 bg-green-900/50 rounded">
          <p className="text-xs font-bold">Vehicle Physics:</p>
          <p className="text-xs">
            {physics.enginePower} {vehicleType === 'car' ? 'HP' : 'lbs thrust'} • {physics.vehicleWeight} kg
          </p>
          <p className="text-xs opacity-75">
            Power-to-weight: {powerToWeight} {vehicleType === 'car' ? 'HP/kg' : 'lbs/kg'}
          </p>
        </div>
        {terrainInfo && (
          <div className="mt-2 p-2 bg-yellow-900/50 rounded">
            <p className="text-xs font-bold">Terrain Info:</p>
            <p className="text-xs">Elevation: {terrainInfo.elevation.toFixed(1)}m</p>
            <p className="text-xs">Ground: {terrainInfo.isOnGround ? 'Yes' : 'No'}</p>
            <p className="text-xs opacity-75">Cache: {terrainInfo.cacheSize} entries</p>
          </div>
        )}
        <p className="text-xs opacity-75 mt-2">
          Physics: Engine power vs vehicle weight determines acceleration!
        </p>
      </div>
    </div>
  )
}