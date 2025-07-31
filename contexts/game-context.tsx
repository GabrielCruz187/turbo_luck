"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface GameContextType {
  balance: number
  setBalance: (balance: number) => void
  addToBalance: (amount: number) => void
  subtractFromBalance: (amount: number) => void
}

const GameContext = createContext<GameContextType | undefined>(undefined)

export function GameProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState(1000) // Saldo inicial de demonstração

  const addToBalance = (amount: number) => {
    setBalance((prev) => prev + amount)
  }

  const subtractFromBalance = (amount: number) => {
    setBalance((prev) => Math.max(0, prev - amount))
  }

  return (
    <GameContext.Provider value={{ balance, setBalance, addToBalance, subtractFromBalance }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error("useGame must be used within a GameProvider")
  }
  return context
}
