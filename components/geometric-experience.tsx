"use client"

import { useState } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { GeometricScene } from "./geometric-scene"
import { WelcomeScreen } from "./welcome-screen"
import { Controls } from "./controls"
import { MessageDisplay } from "./message-display"
import { Fullscreen, Maximize2 } from "lucide-react"

export default function GeometricExperience() {
  const [started, setStarted] = useState(false)
  const [pattern, setPattern] = useState<"radial" | "sphere" | "vortex" | "grid" | "cosmic">("radial")
  const [colorScheme, setColorScheme] = useState<"neon" | "fire" | "cosmic" | "matrix">("neon")
  const [rotationSpeed, setRotationSpeed] = useState(0.2)
  const [showLines, setShowLines] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((e) => {
        console.error(`Error attempting to enable fullscreen: ${e.message}`)
      })
      setIsFullscreen(true)
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
        setIsFullscreen(false)
      }
    }
  }

  return (
    <div className="relative w-full h-full">
      {!started && <WelcomeScreen onStart={() => setStarted(true)} />}

      <Canvas camera={{ position: [0, 0, 15], fov: 60 }} gl={{ antialias: true, alpha: true }} className="touch-none">
        <color attach="background" args={["#050510"]} />

        <OrbitControls
          enableZoom={true}
          enablePan={false}
          maxPolarAngle={Math.PI}
          minDistance={5}
          maxDistance={30}
          enableDamping={true}
          dampingFactor={0.05}
        />

        <ambientLight intensity={0.2} />
        <pointLight position={[0, 0, 0]} intensity={0.5} color="#ffffff" />

        {started && (
          <GeometricScene
            pattern={pattern}
            colorScheme={colorScheme}
            rotationSpeed={rotationSpeed}
            showLines={showLines}
          />
        )}
      </Canvas>

      {started && (
        <>
          <Controls
            pattern={pattern}
            setPattern={setPattern}
            colorScheme={colorScheme}
            setColorScheme={setColorScheme}
            rotationSpeed={rotationSpeed}
            setRotationSpeed={setRotationSpeed}
            showLines={showLines}
            setShowLines={setShowLines}
          />
          <MessageDisplay pattern={pattern} colorScheme={colorScheme} />
          <button
            onClick={toggleFullscreen}
            className="absolute top-4 right-4 z-10 p-3 bg-fuchsia-900 bg-opacity-70 hover:bg-opacity-100 rounded-full text-white transition-colors"
            aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Fullscreen size={20} /> : <Maximize2 size={20} />}
          </button>
        </>
      )}
    </div>
  )
}
