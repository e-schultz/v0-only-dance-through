"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { useAudioContext } from "@/hooks/use-audio-context"
import * as THREE from "three"

interface VoxelWorldProps {
  lowPerformanceMode: boolean
}

export const VoxelWorld = ({ lowPerformanceMode }: VoxelWorldProps) => {
  const groupRef = useRef<THREE.Group>(null)
  const { bassValue, midValue, trebleValue } = useAudioContext()

  // Store the last update time to throttle updates
  const lastUpdateTimeRef = useRef(0)

  // Store initial positions and scales to avoid recalculations
  const positionsRef = useRef<Array<[number, number, number]>>([])
  const scalesRef = useRef<Array<number>>([])
  const colorsRef = useRef<Array<string>>([])

  // Generate voxel grid - ultra simplified for maximum stability
  const voxels = useMemo(() => {
    const items = []
    // Extremely reduced grid size
    const gridSize = lowPerformanceMode ? 1 : 2
    const spacing = 1.5

    // Create a minimal grid structure
    for (let x = -gridSize; x <= gridSize; x += 1) {
      for (let z = -gridSize; z <= gridSize; z += 1) {
        // Skip corners for a more circular pattern
        if (Math.abs(x) === gridSize && Math.abs(z) === gridSize) continue

        // Simple height calculation
        const height = 0

        // Simple color assignment
        const color = x === 0 && z === 0 ? "#ff00ff" : "#00ffff"

        items.push({
          position: [x * spacing, height, z * spacing],
          color,
          scale: 0.8,
        })
      }
    }

    // Add just a couple floating voxels
    const floatingCount = lowPerformanceMode ? 1 : 3
    for (let i = 0; i < floatingCount; i++) {
      const x = (i - floatingCount / 2) * 2
      const y = 3
      const z = 0

      items.push({
        position: [x, y, z],
        color: "#ff66aa",
        scale: 0.5,
      })
    }

    // Store initial values in refs
    positionsRef.current = items.map((item) => item.position as [number, number, number])
    scalesRef.current = items.map((item) => item.scale as number)
    colorsRef.current = items.map((item) => item.color as string)

    return items
  }, [lowPerformanceMode])

  useFrame((state) => {
    if (!groupRef.current) return

    // Ultra-aggressive throttling (only update a few times per second)
    const now = state.clock.getElapsedTime()
    const updateInterval = lowPerformanceMode ? 1 / 5 : 1 / 10 // 5-10 FPS for animations

    if (now - lastUpdateTimeRef.current < updateInterval) {
      return
    }
    lastUpdateTimeRef.current = now

    // Very slow rotation for stability
    groupRef.current.rotation.y += 0.0005

    // Simplified updates with minimal calculations
    groupRef.current.children.forEach((child, index) => {
      if (child instanceof THREE.Mesh && index < voxels.length) {
        // Get stored initial values
        const initialPosition = positionsRef.current[index]
        const initialScale = scalesRef.current[index]

        // Extremely simplified animation
        if (index % 2 === 0) {
          // Only animate half the voxels
          // Simple pulse effect based on bass
          const pulse = 1 + bassValue * 0.1 // Reduced intensity
          child.scale.setScalar(initialScale * pulse)

          // Very subtle position change
          if (!lowPerformanceMode && index < 5) {
            // Only move a few voxels
            const time = state.clock.getElapsedTime() * 0.5 // Slower animation
            child.position.y = initialPosition[1] + Math.sin(time + index) * 0.03 // Tiny movement
          }
        }
      }
    })
  })

  return (
    <group ref={groupRef}>
      {voxels.map((voxel, i) => (
        <mesh key={i} position={voxel.position as [number, number, number]}>
          {/* Use simpler geometry with fewer segments */}
          <boxGeometry args={[1, 1, 1]} />
          {/* Use basic material instead of standard for better performance */}
          <meshBasicMaterial color={voxel.color} />
        </mesh>
      ))}

      {/* Simplified ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshBasicMaterial color="#000033" wireframe />
      </mesh>
    </group>
  )
}
