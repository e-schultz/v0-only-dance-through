import type React from "react"
import "@/app/globals.css"
import { AudioProvider } from "@/hooks/use-audio-context"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AudioProvider>{children}</AudioProvider>
      </body>
    </html>
  )
}

export const metadata = {
      generator: 'v0.dev'
    };
