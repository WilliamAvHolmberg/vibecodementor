'use client'

import { useFPS } from '../hooks/useFPS'

export function SimulationUI() {
  const fps = useFPS()
  
  return (
    <>
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-black/80 text-white p-3 rounded-lg">
        <h3 className="font-bold mb-2">Legend:</h3>
        <div className="text-xs space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Red box (West)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Blue box (East)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Green box (South)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>Yellow box (North)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded"></div>
            <span>Purple box (Above)</span>
          </div>
        </div>
      </div>

      {/* Status indicator */}
      <div className="absolute top-4 right-4 bg-black/80 text-white p-2 rounded-lg">
        <div className="flex items-center gap-2 text-green-400">
          <div className="w-2 h-2 rounded-full bg-green-400" />
          Vehicle Controls Active
        </div>
        <div className="text-xs mt-1 opacity-75">
          Use WASD keys to control
        </div>
      </div>

      {/* FPS Counter */}
      <div className="absolute bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">
            {fps}
          </div>
          <div className="text-xs opacity-75">FPS</div>
        </div>
        <div className="mt-2 text-xs">
          <div className={`text-center ${fps >= 60 ? 'text-green-400' : fps >= 30 ? 'text-yellow-400' : 'text-red-400'}`}>
            {fps >= 60 ? 'Excellent' : fps >= 30 ? 'Good' : 'Poor'}
          </div>
        </div>
      </div>
    </>
  )
}