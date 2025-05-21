"use client"

import { useEffect, useRef, useState } from "react"
import * as Tone from "tone"
import { useAudioContext } from "@/hooks/use-audio-context"
import { Volume2, VolumeX, Play, Pause } from "lucide-react"

export const AudioController = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const { updateAudioValues } = useAudioContext()

  // Audio analysis
  const analyserBass = useRef<Tone.FFT | null>(null)
  const analyserMid = useRef<Tone.FFT | null>(null)
  const analyserHigh = useRef<Tone.FFT | null>(null)

  // Synths and effects
  const bassSynth = useRef<Tone.Synth | null>(null)
  const padSynth = useRef<Tone.PolySynth | null>(null)
  const leadSynth = useRef<Tone.MonoSynth | null>(null)
  const masterVolume = useRef<Tone.Volume | null>(null)

  // Sequences
  const bassSeq = useRef<Tone.Sequence | null>(null)
  const padSeq = useRef<Tone.Sequence | null>(null)
  const leadSeq = useRef<Tone.Sequence | null>(null)

  // Animation frame
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    // Initialize Tone.js with simpler setup
    const initAudio = async () => {
      try {
        await Tone.start()
        Tone.Transport.bpm.value = 120

        // Create master volume
        masterVolume.current = new Tone.Volume(-15).toDestination()

        // Create analyzers with simpler setup
        analyserBass.current = new Tone.FFT(32)
        analyserMid.current = new Tone.FFT(32)
        analyserHigh.current = new Tone.FFT(32)

        // Create bass synth - simpler configuration
        bassSynth.current = new Tone.Synth({
          oscillator: { type: "triangle" },
          envelope: { attack: 0.05, decay: 0.2, sustain: 0.8, release: 1 },
        })
          .connect(analyserBass.current)
          .connect(masterVolume.current)

        // Create pad synth - simpler configuration
        padSynth.current = new Tone.PolySynth({
          oscillator: { type: "sine" },
          envelope: { attack: 0.5, decay: 0.5, sustain: 0.8, release: 3 },
        })
          .connect(analyserMid.current)
          .connect(masterVolume.current)

        // Create lead synth - simpler configuration
        leadSynth.current = new Tone.MonoSynth({
          oscillator: { type: "square" },
          envelope: { attack: 0.01, decay: 0.2, sustain: 0.4, release: 0.8 },
        })
          .connect(analyserHigh.current)
          .connect(masterVolume.current)

        // Create sequences - shorter patterns
        const bassPattern = ["C2", null, "C2", null, "G1", null, "G1", null]
        bassSeq.current = new Tone.Sequence(
          (time, note) => {
            if (note && bassSynth.current) {
              bassSynth.current.triggerAttackRelease(note, "8n", time)
            }
          },
          bassPattern,
          "8n",
        )

        const padPattern = [["C3", "E3", "G3"], null, null, null, ["A2", "C3", "E3"], null, null, null]
        padSeq.current = new Tone.Sequence(
          (time, chord) => {
            if (chord && padSynth.current) {
              padSynth.current.triggerAttackRelease(chord, "2n", time)
            }
          },
          padPattern,
          "2n",
        )

        const leadPattern = [null, null, "G4", "A4", "C5", null, "A4", null]
        leadSeq.current = new Tone.Sequence(
          (time, note) => {
            if (note && leadSynth.current) {
              leadSynth.current.triggerAttackRelease(note, "16n", time)
            }
          },
          leadPattern,
          "16n",
        )

        setIsInitialized(true)

        // Start animation loop for audio analysis
        const analyzeAudio = () => {
          if (analyserBass.current && analyserMid.current && analyserHigh.current) {
            // Get frequency data
            const bassData = analyserBass.current.getValue()
            const midData = analyserMid.current.getValue()
            const highData = analyserHigh.current.getValue()

            // Calculate average values in specific frequency ranges
            // Bass: 20-200Hz, Mid: 200-2000Hz, High: 2000-20000Hz
            let bassSum = 0
            let midSum = 0
            let highSum = 0

            // Simplified analysis - just take a few values from each range
            for (let i = 0; i < 5; i++) {
              bassSum += Math.abs(bassData[i] + 140) / 140
            }

            for (let i = 5; i < 15; i++) {
              midSum += Math.abs(midData[i] + 140) / 140
            }

            for (let i = 15; i < 30; i++) {
              highSum += Math.abs(highData[i] + 140) / 140
            }

            const bassAvg = bassSum / 5
            const midAvg = midSum / 10
            const highAvg = highSum / 15

            // Update context with normalized values
            updateAudioValues({
              bassValue: Math.min(1, Math.max(0, bassAvg)),
              midValue: Math.min(1, Math.max(0, midAvg)),
              trebleValue: Math.min(1, Math.max(0, highAvg)),
            })
          }

          animationRef.current = requestAnimationFrame(analyzeAudio)
        }

        analyzeAudio()
      } catch (err) {
        console.error("Failed to initialize audio:", err)
      }
    }

    initAudio()

    return () => {
      // Clean up
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      if (bassSeq.current) bassSeq.current.dispose()
      if (padSeq.current) padSeq.current.dispose()
      if (leadSeq.current) leadSeq.current.dispose()
      if (bassSynth.current) bassSynth.current.dispose()
      if (padSynth.current) padSynth.current.dispose()
      if (leadSynth.current) leadSynth.current.dispose()
      if (masterVolume.current) masterVolume.current.dispose()
      if (analyserBass.current) analyserBass.current.dispose()
      if (analyserMid.current) analyserMid.current.dispose()
      if (analyserHigh.current) analyserHigh.current.dispose()

      // Stop transport
      Tone.Transport.stop()
    }
  }, [updateAudioValues])

  const togglePlay = () => {
    if (!isInitialized) return

    if (isPlaying) {
      Tone.Transport.stop()
      if (bassSeq.current) bassSeq.current.stop()
      if (padSeq.current) padSeq.current.stop()
      if (leadSeq.current) leadSeq.current.stop()
    } else {
      Tone.Transport.start()
      if (bassSeq.current) bassSeq.current.start(0)
      if (padSeq.current) padSeq.current.start(0)
      if (leadSeq.current) leadSeq.current.start(0)
    }

    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    if (masterVolume.current) {
      masterVolume.current.mute = !isMuted
      setIsMuted(!isMuted)
    }
  }

  return (
    <div className="absolute bottom-4 left-4 z-10 flex gap-2">
      <button
        onClick={togglePlay}
        className="p-3 bg-fuchsia-900 bg-opacity-70 hover:bg-opacity-100 rounded-full text-white transition-colors"
        aria-label={isPlaying ? "Pause" : "Play"}
        disabled={!isInitialized}
      >
        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
      </button>

      <button
        onClick={toggleMute}
        className="p-3 bg-fuchsia-900 bg-opacity-70 hover:bg-opacity-100 rounded-full text-white transition-colors"
        aria-label={isMuted ? "Unmute" : "Mute"}
        disabled={!isInitialized}
      >
        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>
    </div>
  )
}
