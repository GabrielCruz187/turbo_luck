import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { GameProvider } from "@/contexts/game-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "TurboLuck - Jogos Online",
  description: "A plataforma de jogos mais inteligente do Brasil",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <GameProvider>{children}</GameProvider>
      </body>
    </html>
  )
}
