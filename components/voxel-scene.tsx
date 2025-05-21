"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

interface VoxelSceneProps {
  pattern: "grid" | "spiral" | "wave"
  colorScheme: "neon" | "pastel" | "mono"
  rotationSpeed: number
}

export function VoxelScene({ pattern, colorScheme, rotationSpeed }: VoxelSceneProps) {
  const groupRef = useRef<THREE.Group>(null)

  // Color schemes
  const colors = useMemo(() => {
    switch (colorScheme) {
      case "neon":
        return ["#ff00ff", "#00ffff", "#ffff00", "#ff00aa"]
      case "pastel":
        return ["#ffafcc", "#a2d2ff", "#cdb4db", "#bde0fe"]
      case "mono":
        return ["#ffffff", "#cccccc", "#999999", "#666666"]
    }
  }, [colorScheme])

  // Generate voxel positions based on pattern
  const voxels = useMemo(() => {
    const items = []

    if (pattern === "grid") {
      // Simple grid pattern
      const size = 3
      for (let x = -size; x <= size; x += 1) {
        for (let z = -size; z <= size; z += 1) {
          // Skip some voxels for a more interesting pattern
          if (Math.random() > 0.7) continue

          const height = Math.random() * 0.5
          const colorIndex = Math.floor(Math.random() * colors.length)

          items.push({
            position: [x * 1.5, height, z * 1.5],
            color: colors[colorIndex],
            scale: 0.8 + Math.random() * 0.4,
          })
        }
      }
    } else if (pattern === "spiral") {
      // Spiral pattern
      const turns = 3
      const pointsPerTurn = 10
      const totalPoints = turns * pointsPerTurn

      for (let i = 0; i < totalPoints; i++) {
        const angle = (i / pointsPerTurn) * Math.PI * 2
        const radius = (i / totalPoints) * 5
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        const y = (i / totalPoints) * 2

        const colorIndex = Math.floor((i / totalPoints) * colors.length) % colors.length

        items.push({
          position: [x, y, z],
          color: colors[colorIndex],
          scale: 0.8 - (i / totalPoints) * 0.3,
        })
      }
    } else if (pattern === "wave") {
      // Wave pattern
      const size = 5
      for (let x = -size; x <= size; x += 1) {
        for (let z = -size; z <= size; z += 1) {
          // Skip corners
          if (Math.abs(x) === size && Math.abs(z) === size) continue

          // Create wave height
          const distance = Math.sqrt(x * x + z * z)
          const height = Math.sin(distance) * 0.5

          // Color based on position
          const colorIndex = Math.floor((distance / (size * 1.4)) * colors.length) % colors.length

          items.push({
            position: [x, height, z],
            color: colors[colorIndex],
            scale: 0.7,
          })
        }
      }
    }

    return items
  }, [pattern, colors])

  // Animation
  useFrame((state) => {
    if (!groupRef.current) return

    // Rotate the entire group
    groupRef.current.rotation.y += 0.001 * rotationSpeed

    // Animate individual voxels
    const time = state.clock.getElapsedTime()

    groupRef.current.children.forEach((child, index) => {
      if (child instanceof THREE.Mesh) {
        // Simple hover animation
        const i = index % voxels.length
        const offset = index * 0.1

        if (pattern === "wave") {
          // Wave animation
          const pos = child.position.clone()
          const distance = Math.sqrt(pos.x * pos.x + pos.z * pos.z)
          child.position.y = Math.sin(distance + time * 0.5) * 0.5
        } else {
          // Simple hover for other patterns
          child.position.y += Math.sin(time + offset) * 0.002
        }

        // Subtle rotation
        child.rotation.y += 0.01 * rotationSpeed * (index % 2 ? 1 : -1)
      }
    })
  })

  return (
    <group ref={groupRef}>
      {voxels.map((voxel, i) => (
        <mesh key={i} position={voxel.position as [number, number, number]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={voxel.color} />
        </mesh>
      ))}

      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshBasicMaterial color="#050520" wireframe />
      </mesh>
    </group>
  )
}
