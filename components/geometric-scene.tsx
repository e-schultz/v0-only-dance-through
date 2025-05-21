"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

interface GeometricSceneProps {
  pattern: "radial" | "sphere" | "vortex" | "grid" | "cosmic"
  colorScheme: "neon" | "fire" | "cosmic" | "matrix"
  rotationSpeed: number
  showLines: boolean
}

export function GeometricScene({ pattern, colorScheme, rotationSpeed, showLines }: GeometricSceneProps) {
  const groupRef = useRef<THREE.Group>(null)
  const linesRef = useRef<THREE.Group>(null)
  const timeRef = useRef(0)

  // Color schemes based on the provided images
  const colors = useMemo(() => {
    switch (colorScheme) {
      case "neon":
        return {
          primary: "#ff00ff", // Magenta
          secondary: "#00ffff", // Cyan
          accent: "#ff3366", // Pink
          background: "#050510", // Dark blue
        }
      case "fire":
        return {
          primary: "#ff4400", // Orange
          secondary: "#ff0000", // Red
          accent: "#ffaa00", // Yellow
          background: "#220000", // Dark red
        }
      case "cosmic":
        return {
          primary: "#9900ff", // Purple
          secondary: "#0066ff", // Blue
          accent: "#ff00aa", // Pink
          background: "#000033", // Dark blue
        }
      case "matrix":
        return {
          primary: "#00ff66", // Green
          secondary: "#00cc33", // Dark green
          accent: "#ffffff", // White
          background: "#001100", // Very dark green
        }
    }
  }, [colorScheme])

  // Generate geometric shapes based on pattern
  const { shapes, lines } = useMemo(() => {
    const shapesArray = []
    const linesArray = []

    // Central point for lines to emanate from
    const center = new THREE.Vector3(0, 0, 0)

    if (pattern === "radial") {
      // Create hexagons and triangles in a radial pattern
      const count = 20
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2
        const radius = 5 + Math.random() * 8
        const x = Math.cos(angle) * radius
        const y = Math.sin(angle) * radius
        const z = (Math.random() - 0.5) * 5

        // Alternate between hexagons and triangles
        const isHexagon = i % 3 !== 0
        const color = i % 2 === 0 ? colors.primary : colors.secondary

        shapesArray.push({
          type: isHexagon ? "hexagon" : "triangle",
          position: [x, y, z],
          rotation: [Math.random() * Math.PI, Math.random() * Math.PI, angle],
          color,
          scale: 0.5 + Math.random() * 0.5,
        })

        // Add lines from center to each shape
        if (i % 2 === 0) {
          linesArray.push({
            start: [center.x, center.y, center.z],
            end: [x, y, z],
            color: i % 4 === 0 ? colors.accent : colors.secondary,
          })
        }
      }

      // Add central ring
      shapesArray.push({
        type: "ring",
        position: [0, 0, 0],
        rotation: [Math.PI / 2, 0, 0],
        color: colors.accent,
        scale: 2,
      })
    } else if (pattern === "sphere") {
      // Create a spherical arrangement with a wireframe sphere
      shapesArray.push({
        type: "sphere",
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        color: "#ffffff",
        scale: 5,
      })

      shapesArray.push({
        type: "sphere",
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        color: colors.primary,
        scale: 3.5,
      })

      // Add hexagonal grid around the sphere
      const gridCount = 30
      for (let i = 0; i < gridCount; i++) {
        const phi = Math.acos(-1 + (2 * i) / gridCount)
        const theta = Math.sqrt(gridCount * Math.PI) * phi

        const x = 7 * Math.cos(theta) * Math.sin(phi)
        const y = 7 * Math.sin(theta) * Math.sin(phi)
        const z = 7 * Math.cos(phi)

        shapesArray.push({
          type: "hexagon",
          position: [x, y, z],
          rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
          color: i % 2 === 0 ? colors.primary : colors.secondary,
          scale: 0.2 + Math.random() * 0.2,
        })
      }

      // Add some cubes
      for (let i = 0; i < 10; i++) {
        const angle = (i / 10) * Math.PI * 2
        const radius = 8 + Math.random() * 5
        const x = Math.cos(angle) * radius
        const y = Math.sin(angle) * radius
        const z = (Math.random() - 0.5) * 10

        shapesArray.push({
          type: "cube",
          position: [x, y, z],
          rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
          color: colors.primary,
          scale: 0.5 + Math.random() * 0.5,
        })
      }
    } else if (pattern === "vortex") {
      // Create a vortex pattern with lines emanating from center
      const lineCount = 36
      for (let i = 0; i < lineCount; i++) {
        const angle = (i / lineCount) * Math.PI * 2
        const radius = 15
        const x = Math.cos(angle) * radius
        const y = Math.sin(angle) * radius

        linesArray.push({
          start: [0, 0, 0],
          end: [x, y, 0],
          color: i % 3 === 0 ? colors.primary : colors.secondary,
        })
      }

      // Add shapes along the vortex
      const shapeCount = 20
      for (let i = 0; i < shapeCount; i++) {
        const angle = (i / shapeCount) * Math.PI * 2
        const radius = 3 + (i / shapeCount) * 8
        const x = Math.cos(angle) * radius
        const y = Math.sin(angle) * radius
        const z = (i / shapeCount) * 5 - 2.5

        const shapeType = i % 3 === 0 ? "triangle" : "hexagon"
        const color = i % 2 === 0 ? colors.primary : colors.secondary

        shapesArray.push({
          type: shapeType,
          position: [x, y, z],
          rotation: [Math.PI / 2, 0, angle],
          color,
          scale: 0.5 + (1 - i / shapeCount) * 0.5,
        })
      }

      // Add central ring
      shapesArray.push({
        type: "ring",
        position: [0, 0, 0],
        rotation: [Math.PI / 2, 0, 0],
        color: colors.accent,
        scale: 1.5,
      })
    } else if (pattern === "grid") {
      // Create a grid of hexagons
      const size = 5
      for (let x = -size; x <= size; x += 1) {
        for (let y = -size; y <= size; y += 1) {
          // Skip some hexagons for a more interesting pattern
          if (Math.random() > 0.7) continue

          // Offset every other row
          const xPos = x * 1.5 + (y % 2 === 0 ? 0 : 0.75)
          const yPos = y * 1.3

          const distance = Math.sqrt(xPos * xPos + yPos * yPos)
          if (distance > size) continue // Keep it circular

          const colorIndex = Math.floor(distance) % 2
          const color = colorIndex === 0 ? colors.primary : colors.secondary

          shapesArray.push({
            type: "hexagon",
            position: [xPos, yPos, 0],
            rotation: [Math.PI / 2, 0, 0],
            color,
            scale: 0.5,
          })
        }
      }
    } else if (pattern === "cosmic") {
      // Create a cosmic pattern with various shapes
      // Central sphere
      shapesArray.push({
        type: "sphere",
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        color: colors.accent,
        scale: 1,
      })

      // Orbiting shapes
      const orbits = 3
      const shapesPerOrbit = 8

      for (let orbit = 0; orbit < orbits; orbit++) {
        const orbitRadius = (orbit + 1) * 3

        for (let i = 0; i < shapesPerOrbit; i++) {
          const angle = (i / shapesPerOrbit) * Math.PI * 2
          const x = Math.cos(angle) * orbitRadius
          const y = Math.sin(angle) * orbitRadius
          const z = (Math.random() - 0.5) * 2

          // Alternate shapes
          const shapeType = (orbit + i) % 3 === 0 ? "cube" : (orbit + i) % 3 === 1 ? "hexagon" : "triangle"

          const color = orbit % 2 === 0 ? colors.primary : colors.secondary

          shapesArray.push({
            type: shapeType,
            position: [x, y, z],
            rotation: [Math.random() * Math.PI, Math.random() * Math.PI, angle],
            color,
            scale: 0.5 - orbit * 0.1,
          })

          // Add connecting lines between adjacent shapes in the same orbit
          const nextIndex = (i + 1) % shapesPerOrbit
          const nextAngle = (nextIndex / shapesPerOrbit) * Math.PI * 2
          const nextX = Math.cos(nextAngle) * orbitRadius
          const nextY = Math.sin(nextAngle) * orbitRadius
          const nextZ = (Math.random() - 0.5) * 2

          linesArray.push({
            start: [x, y, z],
            end: [nextX, nextY, nextZ],
            color: colors.secondary,
          })

          // Add lines from center to each shape
          if (i % 2 === 0) {
            linesArray.push({
              start: [0, 0, 0],
              end: [x, y, z],
              color: colors.accent,
            })
          }
        }
      }
    }

    return { shapes: shapesArray, lines: linesArray }
  }, [pattern, colors])

  // Animation
  useFrame((state) => {
    if (!groupRef.current) return

    timeRef.current += 0.01 * rotationSpeed
    const time = timeRef.current

    // Rotate the entire group
    groupRef.current.rotation.z += 0.001 * rotationSpeed

    // Animate individual shapes
    groupRef.current.children.forEach((child, index) => {
      if (child instanceof THREE.Mesh) {
        const i = index % shapes.length

        // Different animation based on shape type
        if (shapes[i]?.type === "ring") {
          child.rotation.z += 0.01 * rotationSpeed
        } else if (shapes[i]?.type === "sphere") {
          // Pulsate spheres
          const scale = shapes[i].scale + Math.sin(time * 2) * 0.05
          child.scale.set(scale, scale, scale)
        } else {
          // Rotate other shapes
          child.rotation.x += 0.005 * rotationSpeed
          child.rotation.y += 0.005 * rotationSpeed

          // Subtle position animation
          if (pattern === "radial" || pattern === "vortex") {
            const pos = child.position.clone()
            const distance = Math.sqrt(pos.x * pos.x + pos.y * pos.y)
            const angle = Math.atan2(pos.y, pos.x) + 0.002 * rotationSpeed

            child.position.x = Math.cos(angle) * distance
            child.position.y = Math.sin(angle) * distance
          }
        }
      }
    })

    // Animate lines
    if (linesRef.current && showLines) {
      linesRef.current.rotation.z += 0.001 * rotationSpeed
    }
  })

  return (
    <>
      <group ref={groupRef}>
        {shapes.map((shape, i) => {
          if (shape.type === "hexagon") {
            return (
              <mesh
                key={`shape-${i}`}
                position={shape.position as [number, number, number]}
                rotation={shape.rotation as [number, number, number]}
              >
                <ringGeometry args={[shape.scale - 0.1, shape.scale, 6]} />
                <meshBasicMaterial color={shape.color} wireframe />
              </mesh>
            )
          } else if (shape.type === "triangle") {
            return (
              <mesh
                key={`shape-${i}`}
                position={shape.position as [number, number, number]}
                rotation={shape.rotation as [number, number, number]}
              >
                <ringGeometry args={[shape.scale - 0.1, shape.scale, 3]} />
                <meshBasicMaterial color={shape.color} wireframe />
              </mesh>
            )
          } else if (shape.type === "ring") {
            return (
              <mesh
                key={`shape-${i}`}
                position={shape.position as [number, number, number]}
                rotation={shape.rotation as [number, number, number]}
              >
                <ringGeometry args={[shape.scale - 0.2, shape.scale, 32]} />
                <meshBasicMaterial color={shape.color} />
              </mesh>
            )
          } else if (shape.type === "sphere") {
            return (
              <mesh
                key={`shape-${i}`}
                position={shape.position as [number, number, number]}
                rotation={shape.rotation as [number, number, number]}
                scale={[shape.scale, shape.scale, shape.scale]}
              >
                <sphereGeometry args={[1, 16, 16]} />
                <meshBasicMaterial color={shape.color} wireframe />
              </mesh>
            )
          } else if (shape.type === "cube") {
            return (
              <mesh
                key={`shape-${i}`}
                position={shape.position as [number, number, number]}
                rotation={shape.rotation as [number, number, number]}
                scale={[shape.scale, shape.scale, shape.scale]}
              >
                <boxGeometry args={[1, 1, 1]} />
                <meshBasicMaterial color={shape.color} wireframe />
              </mesh>
            )
          }
        })}
      </group>

      {showLines && (
        <group ref={linesRef}>
          {lines.map((line, i) => (
            <line key={`line-${i}`}>
              <bufferGeometry attach="geometry">
                <bufferAttribute
                  attach="attributes-position"
                  array={new Float32Array([...line.start, ...line.end])}
                  count={2}
                  itemSize={3}
                />
              </bufferGeometry>
              <lineBasicMaterial attach="material" color={line.color} />
            </line>
          ))}
        </group>
      )}
    </>
  )
}
