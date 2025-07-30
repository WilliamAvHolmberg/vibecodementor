'use client'

import { Coordinates } from 'react-three-map'

interface BoxProps {
  position: [number, number, number]
  color?: string
  size?: [number, number, number]
}

function Box({ position, color = 'hotpink', size = [5, 5, 5] }: BoxProps) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}

export function ReferenceObjects() {
  return (
    <>
      {/* Test objects at the main location */}
      <Box position={[-10, 0, 0]} color="red" />      {/* West */}
      <Box position={[10, 0, 0]} color="blue" />       {/* East */}
      <Box position={[0, 10, 0]} color="green" />      {/* South */}
      <Box position={[0, -10, 0]} color="yellow" />    {/* North */}
      
      {/* Floating cube above the car */}
      <Box position={[0, 0, 10]} color="purple" />

      {/* Objects at different coordinates */}
      <Coordinates latitude={57.7089} longitude={11.9750}>
        <Box position={[0, 0, 5]} color="orange" />
      </Coordinates>
      
      <Coordinates latitude={57.7085} longitude={11.9746}>
        <Box position={[0, 0, 3]} color="cyan" />
      </Coordinates>
    </>
  )
}