"use client"

import { useState, useEffect } from "react"

interface MessageDisplayProps {
  pattern: string
  colorScheme: string
}

export function MessageDisplay({ pattern, colorScheme }: MessageDisplayProps) {
  const [currentMessage, setCurrentMessage] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  // Messages based on the provided images
  const messages = {
    radial: [
      "THE ONLY WAY OUT IS THROUGH",
      "WELCOME, SELF-DANCER",
      "JOY IS AN ACT OF RESISTANCE",
      "FRICTION CAN BE USEFUL",
    ],
    sphere: ["SEE BEYOND", "SPHERES WITHIN SPHERES", "INFINITE RECURSION", "COSMIC AWARENESS"],
    vortex: [
      "FOLLOW THE SPIRAL",
      "EVERYTHING CONNECTS",
      "PATTERNS EMERGE FROM CHAOS",
      "FEEL WHAT YOU'RE DANCING AGAINST",
    ],
    grid: [
      "STRUCTURE CREATES FREEDOM",
      "THE GRID CONTAINS ALL POSSIBILITIES",
      "FIND ORDER IN CHAOS",
      "MIGHT AS WELL DANCE WHILE DOING IT",
    ],
    cosmic: [
      "RIVER OF LIGHT, INFINITE BLOOM",
      "COSMIC FIRE, ETERNAL CRYSTAL",
      "SILENT VOID, STAR DUST DANCE",
      "FRICTION CAN BE USEFUL",
    ],
  }

  const currentPatternMessages = messages[pattern as keyof typeof messages] || messages.radial

  useEffect(() => {
    // Change message periodically
    const messageInterval = setInterval(() => {
      setIsVisible(false)

      setTimeout(() => {
        setCurrentMessage((prev) => (prev + 1) % currentPatternMessages.length)
        setIsVisible(true)
      }, 500)
    }, 10000) // Change every 10 seconds

    return () => clearInterval(messageInterval)
  }, [currentPatternMessages])

  // Change message when pattern changes
  useEffect(() => {
    setIsVisible(false)
    setTimeout(() => {
      setCurrentMessage(0)
      setIsVisible(true)
    }, 500)
  }, [pattern, colorScheme])

  return (
    <div className="absolute bottom-4 left-0 w-full text-center z-10 pointer-events-none">
      <div
        className={`inline-block p-3 bg-black bg-opacity-50 border border-fuchsia-500 text-fuchsia-300 font-mono uppercase tracking-wider text-sm transition-opacity duration-500 ${
          isVisible ? "opacity-70" : "opacity-0"
        }`}
      >
        {currentPatternMessages[currentMessage]}
      </div>
    </div>
  )
}
