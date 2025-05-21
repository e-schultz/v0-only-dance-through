"use client"

import { useState } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { VoxelScene } from "./voxel-scene"
import { WelcomeScreen } from "./welcome-screen"
import { Controls } from "./controls"

export default function VoxelExperience() {
  const [started, setStarted] = useState(false)
  const [pattern, setPattern] = useState<"grid" | "spiral" | "wave">("grid")
  const [colorScheme, setColorScheme] = useState<"neon" | "pastel" | "mono">("neon")
  const [rotationSpeed, setRotationSpeed] = useState(0.2)

  return (
    <div className="relative w-full h-full">
      {!started && <WelcomeScreen onStart={() => setStarted(true)} />}

      <Canvas
        camera={{ position: [0, 5, 10], fov: 60 }}
        gl={{ antialias: false, powerPreference: "low-power" }}
        className="touch-none"
      >
        <color attach="background" args={["#050510"]} />

        <OrbitControls
          enableZoom={true}
          enablePan={false}
          maxPolarAngle={Math.PI / 2}
          minDistance={5}
          maxDistance={15}
          enableDamping={false}
        />

        <ambientLight intensity={0.5} />
        <pointLight position={[0, 10, 0]} intensity={0.5} />

        {started && <VoxelScene pattern={pattern} colorScheme={colorScheme} rotationSpeed={rotationSpeed} />}
      </Canvas>

      {started && (
        <Controls
          pattern={pattern}
          setPattern={setPattern}
          colorScheme={colorScheme}
          setColorScheme={setColorScheme}
          rotationSpeed={rotationSpeed}
          setRotationSpeed={setRotationSpeed}
        />
      )}
    </div>
  )
}
