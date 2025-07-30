'use client'

import { useEffect, useRef } from 'react'
import { VehicleControls } from '../types'

interface UseKeyboardControlsOptions {
  forward: string
  backward: string
  left: string
  right: string
  up?: string
  down?: string
}

export function useKeyboardControls(keyMap: UseKeyboardControlsOptions) {
  const controls = useRef<VehicleControls>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false
  })

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      
      if (key === keyMap.forward) controls.current.forward = true
      if (key === keyMap.backward) controls.current.backward = true
      if (key === keyMap.left) controls.current.left = true
      if (key === keyMap.right) controls.current.right = true
      if (keyMap.up && key === keyMap.up) controls.current.up = true
      if (keyMap.down && key === keyMap.down) controls.current.down = true
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      
      if (key === keyMap.forward) controls.current.forward = false
      if (key === keyMap.backward) controls.current.backward = false
      if (key === keyMap.left) controls.current.left = false
      if (key === keyMap.right) controls.current.right = false
      if (keyMap.up && key === keyMap.up) controls.current.up = false
      if (keyMap.down && key === keyMap.down) controls.current.down = false
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [keyMap])

  return controls
}