"use client"

import { Settings, Camera, Eye, EyeOff } from "lucide-react"
import { useState } from "react"

interface ControlsProps {
  pattern: "radial" | "sphere" | "vortex" | "grid" | "cosmic"
  setPattern: (pattern: "radial" | "sphere" | "vortex" | "grid" | "cosmic") => void
  colorScheme: "neon" | "fire" | "cosmic" | "matrix"
  setColorScheme: (scheme: "neon" | "fire" | "cosmic" | "matrix") => void
  rotationSpeed: number
  setRotationSpeed: (speed: number) => void
  showLines: boolean
  setShowLines: (show: boolean) => void
}

export function Controls({
  pattern,
  setPattern,
  colorScheme,
  setColorScheme,
  rotationSpeed,
  setRotationSpeed,
  showLines,
  setShowLines,
}: ControlsProps) {
  const [isOpen, setIsOpen] = useState(false)

  const takeScreenshot = () => {
    const canvas = document.querySelector("canvas")
    if (!canvas) return

    // Create a temporary link to download the image
    const link = document.createElement("a")
    link.download = `geometric-experience-${pattern}-${colorScheme}.png`
    link.href = canvas.toDataURL("image/png")
    link.click()
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute bottom-4 right-4 z-10 p-3 bg-fuchsia-900 bg-opacity-70 hover:bg-opacity-100 rounded-full text-white transition-colors"
        aria-label="Settings"
      >
        <Settings size={20} />
      </button>

      <button
        onClick={takeScreenshot}
        className="absolute bottom-4 right-16 z-10 p-3 bg-fuchsia-900 bg-opacity-70 hover:bg-opacity-100 rounded-full text-white transition-colors"
        aria-label="Take Screenshot"
      >
        <Camera size={20} />
      </button>

      <button
        onClick={() => setShowLines(!showLines)}
        className="absolute bottom-4 right-28 z-10 p-3 bg-fuchsia-900 bg-opacity-70 hover:bg-opacity-100 rounded-full text-white transition-colors"
        aria-label={showLines ? "Hide Lines" : "Show Lines"}
      >
        {showLines ? <Eye size={20} /> : <EyeOff size={20} />}
      </button>

      {isOpen && (
        <div className="absolute bottom-20 right-4 z-10 p-4 bg-black bg-opacity-80 border border-fuchsia-500 rounded-md text-white w-64">
          <h3 className="text-sm font-bold mb-3 text-fuchsia-300">CONTROLS</h3>

          <div className="mb-4">
            <label className="block text-xs mb-1">Pattern</label>
            <div className="flex flex-wrap gap-2">
              {["radial", "sphere", "vortex", "grid", "cosmic"].map((p) => (
                <button
                  key={p}
                  onClick={() => setPattern(p as any)}
                  className={`px-2 py-1 text-xs rounded ${pattern === p ? "bg-fuchsia-700" : "bg-gray-800"}`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs mb-1">Color Scheme</label>
            <div className="flex flex-wrap gap-2">
              {["neon", "fire", "cosmic", "matrix"].map((c) => (
                <button
                  key={c}
                  onClick={() => setColorScheme(c as any)}
                  className={`px-2 py-1 text-xs rounded ${colorScheme === c ? "bg-fuchsia-700" : "bg-gray-800"}`}
                >
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs mb-1">Rotation Speed: {rotationSpeed.toFixed(1)}</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={rotationSpeed}
              onChange={(e) => setRotationSpeed(Number.parseFloat(e.target.value))}
              className="w-full accent-fuchsia-500"
            />
          </div>
        </div>
      )}
    </>
  )
}
