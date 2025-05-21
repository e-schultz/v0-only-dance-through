"use client"

import { useState } from "react"

interface WelcomeScreenProps {
  onStart: () => void
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleStart = async () => {
    setIsLoading(true)
    // Small delay to allow UI to update
    await new Promise((resolve) => setTimeout(resolve, 100))
    onStart()
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black bg-opacity-90 text-white">
      <div className="text-center p-6 max-w-md">
        <h1 className="text-3xl font-bold mb-4 text-fuchsia-500">GEOMETRIC EXPERIENCE</h1>
        <p className="mb-6 text-cyan-300">WELCOME, SELF-DANCER</p>

        <div className="mb-8 text-sm opacity-80">
          <p>Explore a realm of geometric patterns and cosmic vibrations</p>
          <p className="mt-2">No sound, just pure visual meditation</p>
        </div>

        <button
          onClick={handleStart}
          disabled={isLoading}
          className="px-6 py-3 bg-fuchsia-700 hover:bg-fuchsia-600 text-white rounded-md transition-colors disabled:opacity-50 mb-4 uppercase tracking-wider"
        >
          {isLoading ? "LOADING..." : "SEE BEYOND"}
        </button>

        <p className="mt-6 text-xs opacity-70">
          Use the controls to change patterns, colors, and rotation speed.
          <br />
          Drag to rotate the view. Scroll to zoom.
        </p>
      </div>
    </div>
  )
}
