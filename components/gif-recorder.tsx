"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { Video, StopCircle, Settings, Play, Pause, FastForward, Rewind, Download } from "lucide-react"

interface GifRecorderProps {
  targetRef: React.RefObject<HTMLCanvasElement>
}

// Simple GIF encoder class (pure JavaScript implementation)
class GIFEncoder {
  private width: number
  private height: number
  private frames: ImageData[] = []
  private delay: number
  private repeat: number
  private transparent: boolean
  private dispose: number
  private firstFrame = true
  private colorDepth: number
  private palette: number[] = []
  private indexedPixels: Uint8Array | null = null
  private colorTab: Uint8Array | null = null
  private usedEntry: boolean[] = []
  private byteOut: number[] = []
  private pixelIndex = 0
  private gifData: number[] = []

  constructor(width: number, height: number, delay = 100, repeat = 0, transparent = false) {
    this.width = width
    this.height = height
    this.delay = delay
    this.repeat = repeat
    this.transparent = transparent
    this.dispose = -1
    this.colorDepth = 8
  }

  // Add a frame to the GIF
  addFrame(imageData: ImageData): void {
    this.frames.push(imageData)
  }

  // Finish the GIF and return it as a Blob
  finish(): Blob {
    // Start the GIF file
    this.writeHeader()

    // Process each frame
    for (let i = 0; i < this.frames.length; i++) {
      this.analyzePixels(this.frames[i])
      this.writeGraphicCtrlExt()
      this.writeImageDesc()
      this.writePixels()
    }

    // End the GIF file
    this.writeFooter()

    // Convert to Blob
    return new Blob([new Uint8Array(this.gifData)], { type: "image/gif" })
  }

  // Write the GIF header
  private writeHeader(): void {
    // GIF header
    this.byteOut = []
    this.writeString("GIF89a")

    // Logical screen descriptor
    this.writeShort(this.width)
    this.writeShort(this.height)
    this.byteOut.push(0x80 | 0x70 | 0x07) // Global color table, 8 bits per color
    this.byteOut.push(0) // Background color
    this.byteOut.push(0) // Pixel aspect ratio

    // Global color table (simple 256 color palette)
    for (let r = 0; r < 8; r++) {
      for (let g = 0; g < 8; g++) {
        for (let b = 0; b < 4; b++) {
          this.byteOut.push(r * 32)
          this.byteOut.push(g * 32)
          this.byteOut.push(b * 64)
        }
      }
    }

    // Application Extension for looping
    if (this.repeat >= 0) {
      this.byteOut.push(0x21) // Extension introducer
      this.byteOut.push(0xff) // Application extension
      this.byteOut.push(11) // Block size
      this.writeString("NETSCAPE2.0") // App ID
      this.byteOut.push(3) // Sub-block size
      this.byteOut.push(1) // Loop sub-block ID
      this.writeShort(this.repeat) // Loop count (0 = infinite)
      this.byteOut.push(0) // Block terminator
    }

    // Add header bytes to GIF data
    this.gifData = this.gifData.concat(this.byteOut)
  }

  // Write the Graphic Control Extension
  private writeGraphicCtrlExt(): void {
    this.byteOut = []
    this.byteOut.push(0x21) // Extension introducer
    this.byteOut.push(0xf9) // Graphic control extension
    this.byteOut.push(4) // Block size
    this.byteOut.push(0) // Disposal method, no transparency
    this.writeShort(this.delay) // Delay time in 1/100 sec
    this.byteOut.push(0) // Transparent color index
    this.byteOut.push(0) // Block terminator

    // Add bytes to GIF data
    this.gifData = this.gifData.concat(this.byteOut)
  }

  // Write the Image Descriptor
  private writeImageDesc(): void {
    this.byteOut = []
    this.byteOut.push(0x2c) // Image separator
    this.writeShort(0) // Left position
    this.writeShort(0) // Top position
    this.writeShort(this.width) // Width
    this.writeShort(this.height) // Height
    this.byteOut.push(0) // No local color table

    // Add bytes to GIF data
    this.gifData = this.gifData.concat(this.byteOut)
  }

  // Analyze pixels and create color table
  private analyzePixels(imageData: ImageData): void {
    // Simplified: just convert to indexed color
    const pixels = imageData.data
    this.indexedPixels = new Uint8Array(this.width * this.height)

    // Very simple color quantization - just use the most significant bits
    for (let i = 0, j = 0; i < pixels.length; i += 4, j++) {
      const r = pixels[i] >> 5
      const g = pixels[i + 1] >> 5
      const b = pixels[i + 2] >> 6
      this.indexedPixels[j] = r * 32 + g * 4 + b
    }
  }

  // Write the pixels data
  private writePixels(): void {
    if (!this.indexedPixels) return

    this.byteOut = []
    this.byteOut.push(8) // Minimum code size

    // Simple LZW compression (very simplified)
    const pixels = this.indexedPixels
    const dataSize = pixels.length
    const maxChunkSize = 255

    for (let i = 0; i < dataSize; i += maxChunkSize) {
      const chunkSize = Math.min(maxChunkSize, dataSize - i)
      this.byteOut.push(chunkSize)

      for (let j = 0; j < chunkSize; j++) {
        this.byteOut.push(pixels[i + j])
      }
    }

    this.byteOut.push(0) // End of pixel data

    // Add bytes to GIF data
    this.gifData = this.gifData.concat(this.byteOut)
  }

  // Write the GIF footer
  private writeFooter(): void {
    this.byteOut = []
    this.byteOut.push(0x3b) // GIF trailer
    this.gifData = this.gifData.concat(this.byteOut)
  }

  // Helper: Write a 16-bit value
  private writeShort(value: number): void {
    this.byteOut.push(value & 0xff)
    this.byteOut.push((value >> 8) & 0xff)
  }

  // Helper: Write a string
  private writeString(str: string): void {
    for (let i = 0; i < str.length; i++) {
      this.byteOut.push(str.charCodeAt(i))
    }
  }
}

export function GifRecorder({ targetRef }: GifRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [showSettings, setShowSettings] = useState(false)
  const [gifUrl, setGifUrl] = useState<string | null>(null)
  const [settings, setSettings] = useState({
    duration: 3, // seconds (reduced for better performance)
    fps: 10, // frames per second
    width: 320, // output width (reduced for better performance)
  })

  const framesRef = useRef<ImageData[]>([])
  const recordingStartTimeRef = useRef(0)
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const playbackIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
  const animationCanvasRef = useRef<HTMLCanvasElement>(null)
  const currentFrameRef = useRef(0)

  // Create a canvas for capturing frames
  useEffect(() => {
    if (typeof window !== "undefined" && !canvasRef.current) {
      canvasRef.current = document.createElement("canvas")
      ctxRef.current = canvasRef.current.getContext("2d")
    }

    return () => {
      // Clean up playback interval
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current)
      }

      // Clean up GIF URL
      if (gifUrl) {
        URL.revokeObjectURL(gifUrl)
      }
    }
  }, [gifUrl])

  // Handle playback
  useEffect(() => {
    if (!animationCanvasRef.current || framesRef.current.length === 0) return

    if (isPlaying) {
      // Clear any existing interval
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current)
      }

      // Calculate interval based on FPS and playback speed
      const interval = 1000 / (settings.fps * playbackSpeed)

      // Start playback
      playbackIntervalRef.current = setInterval(() => {
        if (!animationCanvasRef.current) return

        const ctx = animationCanvasRef.current.getContext("2d")
        if (!ctx) return

        // Update current frame
        currentFrameRef.current = (currentFrameRef.current + 1) % framesRef.current.length

        // Draw the frame
        ctx.putImageData(framesRef.current[currentFrameRef.current], 0, 0)
      }, interval)
    } else if (playbackIntervalRef.current) {
      // Stop playback
      clearInterval(playbackIntervalRef.current)
      playbackIntervalRef.current = null
    }

    // Cleanup on unmount
    return () => {
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current)
      }
    }
  }, [isPlaying, settings.fps, playbackSpeed, framesRef.current.length])

  const captureFrame = useCallback(() => {
    if (!targetRef.current || !canvasRef.current || !ctxRef.current) return

    try {
      // Get dimensions
      const width = settings.width
      const height = Math.floor((settings.width * targetRef.current.height) / targetRef.current.width)

      // Set canvas size
      canvasRef.current.width = width
      canvasRef.current.height = height

      // Draw the current frame from the Three.js canvas to our canvas
      ctxRef.current.drawImage(targetRef.current, 0, 0, width, height)

      // Get the image data
      const imageData = ctxRef.current.getImageData(0, 0, width, height)

      // Store the frame
      framesRef.current.push(imageData)

      // Update recording time
      const elapsedTime = (Date.now() - recordingStartTimeRef.current) / 1000
      setRecordingTime(Math.round(elapsedTime * 10) / 10)

      // Stop recording if we've reached the duration
      if (elapsedTime >= settings.duration) {
        stopRecording()
      }
    } catch (error) {
      console.error("Error capturing frame:", error)
      stopRecording()
    }
  }, [targetRef, settings.width, settings.duration])

  const startRecording = useCallback(() => {
    if (!targetRef.current || !canvasRef.current || !ctxRef.current) {
      console.error("Cannot start recording - missing dependencies")
      return
    }

    // Stop playback if it's running
    setIsPlaying(false)

    // Clear previous recording
    if (gifUrl) {
      URL.revokeObjectURL(gifUrl)
      setGifUrl(null)
    }

    try {
      // Reset frames array
      framesRef.current = []
      currentFrameRef.current = 0
      recordingStartTimeRef.current = Date.now()
      setRecordingTime(0)

      // Start capturing frames at the specified FPS
      recordingIntervalRef.current = setInterval(captureFrame, 1000 / settings.fps)
      setIsRecording(true)
    } catch (error) {
      console.error("Error starting recording:", error)
      setIsRecording(false)
    }
  }, [targetRef, captureFrame, settings.fps, gifUrl])

  const stopRecording = useCallback(() => {
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current)
      recordingIntervalRef.current = null
    }

    setIsRecording(false)

    // Only process if we have frames
    if (framesRef.current.length > 0) {
      setIsProcessing(true)
      console.log(`Recording complete with ${framesRef.current.length} frames...`)

      try {
        // Initialize the animation canvas with the first frame
        if (animationCanvasRef.current && framesRef.current.length > 0) {
          const ctx = animationCanvasRef.current.getContext("2d")
          if (ctx) {
            // Set canvas dimensions to match the first frame
            const firstFrame = framesRef.current[0]
            animationCanvasRef.current.width = firstFrame.width
            animationCanvasRef.current.height = firstFrame.height

            // Draw the first frame
            ctx.putImageData(firstFrame, 0, 0)
            currentFrameRef.current = 0
          }
        }

        // Create GIF from frames
        setTimeout(() => {
          createGif()
            .then(() => {
              setIsProcessing(false)
            })
            .catch((error) => {
              console.error("Error creating GIF:", error)
              setIsProcessing(false)
            })
        }, 100)
      } catch (error) {
        console.error("Error processing frames:", error)
        setIsProcessing(false)
      }
    } else {
      console.warn("No frames captured")
    }
  }, [])

  // Create a GIF from the captured frames
  const createGif = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        if (framesRef.current.length === 0) {
          reject(new Error("No frames to create GIF"))
          return
        }

        // Clean up previous GIF URL
        if (gifUrl) {
          URL.revokeObjectURL(gifUrl)
        }

        // Get dimensions from the first frame
        const firstFrame = framesRef.current[0]
        const width = firstFrame.width
        const height = firstFrame.height

        // Create a new GIF encoder
        const encoder = new GIFEncoder(width, height, Math.round(100 / settings.fps), 0)

        // Add all frames to the encoder
        for (const frame of framesRef.current) {
          encoder.addFrame(frame)
        }

        // Finish the GIF and get the blob
        const blob = encoder.finish()

        // Create a URL for the blob
        const url = URL.createObjectURL(blob)
        setGifUrl(url)

        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }

  // Toggle playback
  const togglePlayback = useCallback(() => {
    setIsPlaying((prev) => !prev)
  }, [])

  // Change playback speed
  const changePlaybackSpeed = useCallback((multiplier: number) => {
    setPlaybackSpeed((prev) => {
      // Clamp between 0.25 and 4
      return Math.max(0.25, Math.min(4, prev * multiplier))
    })
  }, [])

  // Download the GIF
  const downloadGif = useCallback(() => {
    if (!gifUrl) return

    const link = document.createElement("a")
    link.href = gifUrl
    link.download = `animation-${new Date().getTime()}.gif`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [gifUrl])

  const handleSettingsChange = (key: keyof typeof settings, value: number) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  return (
    <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
      <div className="flex gap-2">
        {!isRecording && !isProcessing && (
          <button
            onClick={startRecording}
            className="p-3 bg-red-600 bg-opacity-70 hover:bg-opacity-100 rounded-full text-white transition-colors"
            aria-label="Start Recording"
            title="Start Recording"
          >
            <Video size={20} />
          </button>
        )}

        {isRecording && (
          <button
            onClick={stopRecording}
            className="p-3 bg-red-600 bg-opacity-90 hover:bg-opacity-100 rounded-full text-white transition-colors animate-pulse"
            aria-label="Stop Recording"
            title="Stop Recording"
          >
            <StopCircle size={20} />
          </button>
        )}

        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-3 bg-fuchsia-900 bg-opacity-70 hover:bg-opacity-100 rounded-full text-white transition-colors"
          aria-label="Recording Settings"
          title="Recording Settings"
        >
          <Settings size={20} />
        </button>
      </div>

      {isRecording && (
        <div className="px-3 py-2 bg-black bg-opacity-70 rounded-md text-white text-xs">
          Recording: {recordingTime.toFixed(1)}s / {settings.duration}s
        </div>
      )}

      {isProcessing && (
        <div className="px-3 py-2 bg-black bg-opacity-70 rounded-md text-white text-xs">
          Creating GIF... This may take a moment.
        </div>
      )}

      {showSettings && (
        <div className="p-4 bg-black bg-opacity-80 border border-fuchsia-500 rounded-md text-white w-64">
          <h3 className="text-sm font-bold mb-3 text-fuchsia-300">RECORDING SETTINGS</h3>

          <div className="mb-3">
            <label className="block text-xs mb-1">Duration: {settings.duration}s</label>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={settings.duration}
              onChange={(e) => handleSettingsChange("duration", Number.parseInt(e.target.value))}
              className="w-full accent-fuchsia-500"
            />
            <p className="text-xs mt-1 opacity-70">Keep short for better performance</p>
          </div>

          <div className="mb-3">
            <label className="block text-xs mb-1">FPS: {settings.fps}</label>
            <input
              type="range"
              min="5"
              max="15"
              step="1"
              value={settings.fps}
              onChange={(e) => handleSettingsChange("fps", Number.parseInt(e.target.value))}
              className="w-full accent-fuchsia-500"
            />
            <p className="text-xs mt-1 opacity-70">Lower FPS = smaller file size</p>
          </div>

          <div>
            <label className="block text-xs mb-1">Output Width: {settings.width}px</label>
            <input
              type="range"
              min="160"
              max="400"
              step="40"
              value={settings.width}
              onChange={(e) => handleSettingsChange("width", Number.parseInt(e.target.value))}
              className="w-full accent-fuchsia-500"
            />
            <p className="text-xs mt-1 opacity-70">Smaller width = better performance</p>
          </div>
        </div>
      )}

      {framesRef.current.length > 0 && !isRecording && !isProcessing && (
        <div className="mt-2 p-3 bg-black bg-opacity-70 rounded-md">
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs text-white">Animation Preview</p>
            {gifUrl && (
              <button
                onClick={downloadGif}
                className="p-1.5 bg-green-600 bg-opacity-70 hover:bg-opacity-100 rounded-md text-white transition-colors"
                aria-label="Download GIF"
                title="Download GIF"
              >
                <Download size={16} />
              </button>
            )}
          </div>

          <canvas ref={animationCanvasRef} className="max-w-full rounded border border-fuchsia-500" />

          {/* Playback controls */}
          <div className="flex justify-between items-center mt-3 bg-black bg-opacity-50 p-2 rounded">
            <button
              onClick={() => changePlaybackSpeed(0.5)}
              className="p-1.5 bg-fuchsia-900 bg-opacity-70 hover:bg-opacity-100 rounded-md text-white transition-colors"
              aria-label="Slower"
              title="Slower"
            >
              <Rewind size={16} />
            </button>

            <button
              onClick={togglePlayback}
              className="p-2 bg-fuchsia-700 bg-opacity-90 hover:bg-opacity-100 rounded-md text-white transition-colors"
              aria-label={isPlaying ? "Pause" : "Play"}
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>

            <button
              onClick={() => changePlaybackSpeed(2)}
              className="p-1.5 bg-fuchsia-900 bg-opacity-70 hover:bg-opacity-100 rounded-md text-white transition-colors"
              aria-label="Faster"
              title="Faster"
            >
              <FastForward size={16} />
            </button>
          </div>

          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-white opacity-70">
              {framesRef.current.length} frames at {settings.fps} FPS
            </p>
            <p className="text-xs text-white opacity-70">Speed: {playbackSpeed.toFixed(2)}x</p>
          </div>

          {gifUrl && (
            <div className="mt-3 p-2 bg-black bg-opacity-50 rounded border border-green-500">
              <p className="text-xs text-white font-bold mb-2">GIF Created Successfully!</p>
              <p className="text-xs text-white opacity-70">
                Click the download button above to save your animated GIF.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
