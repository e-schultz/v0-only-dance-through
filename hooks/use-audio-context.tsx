"use client"

import { createContext, useContext, useRef, useState, type ReactNode } from "react"

interface AudioValues {
  bassValue: number
  midValue: number
  trebleValue: number
}

interface AudioContextType {
  bassValue: number
  midValue: number
  trebleValue: number
  updateAudioValues: (values: AudioValues) => void
}

const defaultContext: AudioContextType = {
  bassValue: 0,
  midValue: 0,
  trebleValue: 0,
  updateAudioValues: () => {},
}

const AudioContext = createContext<AudioContextType>(defaultContext)

export const AudioProvider = ({ children }: { children: ReactNode }) => {
  // Use useState for the public API values that components will read
  const [audioValues, setAudioValues] = useState<AudioValues>({
    bassValue: 0,
    midValue: 0,
    trebleValue: 0,
  })

  // Use refs to track the last update time and previous values to prevent excessive updates
  const lastUpdateTimeRef = useRef(0)
  const prevValuesRef = useRef<AudioValues>({
    bassValue: 0,
    midValue: 0,
    trebleValue: 0,
  })

  const updateAudioValues = (values: AudioValues) => {
    // Ultra-aggressive throttling (max 2 updates per second)
    const now = Date.now()
    if (now - lastUpdateTimeRef.current < 500) {
      return
    }

    // Check if values have changed significantly to avoid unnecessary updates
    // Increased threshold for significant change
    const prevValues = prevValuesRef.current
    const hasSignificantChange =
      Math.abs(prevValues.bassValue - values.bassValue) > 0.2 ||
      Math.abs(prevValues.midValue - values.midValue) > 0.2 ||
      Math.abs(prevValues.trebleValue - values.trebleValue) > 0.2

    if (hasSignificantChange) {
      // Update the refs first
      prevValuesRef.current = values
      lastUpdateTimeRef.current = now

      // Then update the state (which triggers re-renders)
      setAudioValues({
        bassValue: values.bassValue,
        midValue: values.midValue,
        trebleValue: values.trebleValue,
      })
    }
  }

  return (
    <AudioContext.Provider
      value={{
        ...audioValues,
        updateAudioValues,
      }}
    >
      {children}
    </AudioContext.Provider>
  )
}

export const useAudioContext = () => useContext(AudioContext)
