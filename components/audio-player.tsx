"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useAudioContext } from "@/hooks/use-audio-context"
import { Play, Pause } from "lucide-react"

export const AudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoaded, setIsLoaded] = useState(true) // Always start as loaded
  const { updateAudioValues } = useAudioContext()

  // Store animation time in a ref to avoid dependency issues
  const timeRef = useRef(0)
  const animationRef = useRef<number | null>(null)

  // Ultra-simplified animation function
  const fakePulse = useCallback(() => {
    // Only update a few times per second
    timeRef.current += 0.02 // Slower time increment

    // Generate super simple wave patterns
    const t = timeRef.current
    const fakeBass = Math.abs(Math.sin(t * 0.2)) * 0.8
    const fakeMid = Math.abs(Math.sin(t * 0.3)) * 0.6
    const fakeTreble = Math.abs(Math.sin(t * 0.4)) * 0.4

    updateAudioValues({
      bassValue: fakeBass,
      midValue: fakeMid,
      trebleValue: fakeTreble,
    })

    // Schedule next update with a delay for stability
    animationRef.current = window.setTimeout(() => {
      requestAnimationFrame(fakePulse)
    }, 250) // 4 updates per second maximum
  }, [updateAudioValues])

  // Handle play/pause state
  useEffect(() => {
    // Clean up previous animation
    if (animationRef.current) {
      clearTimeout(animationRef.current)
      animationRef.current = null
    }

    // Start animation if playing
    if (isPlaying) {
      fakePulse()
    }

    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current)
      }
    }
  }, [isPlaying, fakePulse]) // Only re-run when play state changes

  const togglePlay = () => {
    setIsPlaying((prev) => !prev)
  }

  return (
    <div className="absolute bottom-4 left-4 z-10">
      <button
        onClick={togglePlay}
        className="p-3 bg-fuchsia-900 bg-opacity-70 hover:bg-opacity-100 rounded-full text-white transition-colors"
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
      </button>
    </div>
  )
}
