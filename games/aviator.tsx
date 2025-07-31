"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useGame } from "@/contexts/game-context"
import { Plane } from "lucide-react"

export default function AviatorGame() {
  const { balance, addToBalance, subtractFromBalance } = useGame()
  const [multiplier, setMultiplier] = useState(1.0)
  const [isFlying, setIsFlying] = useState(false)
  const [hasCrashed, setHasCrashed] = useState(false)
  const [betAmount, setBetAmount] = useState(10)
  const [hasActiveBet, setHasActiveBet] = useState(false)
  const [cashedOut, setCashedOut] = useState(false)
  const [cashOutMultiplier, setCashOutMultiplier] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const crashPointRef = useRef(0)

  const startRound = () => {
    if (betAmount > balance) return

    subtractFromBalance(betAmount)
    setIsFlying(true)
    setHasCrashed(false)
    setHasActiveBet(true)
    setCashedOut(false)
    setMultiplier(1.0)

    // Gera um ponto de crash aleatório entre 1.01 e 10.00
    crashPointRef.current = Math.random() * 9 + 1.01

    intervalRef.current = setInterval(() => {
      setMultiplier((prev) => {
        const newMultiplier = prev + 0.01
        if (newMultiplier >= crashPointRef.current) {
          crash()
          return prev
        }
        return newMultiplier
      })
    }, 50)
  }

  const crash = () => {
    setIsFlying(false)
    setHasCrashed(true)
    setHasActiveBet(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }

  const cashOut = () => {
    if (!hasActiveBet || cashedOut) return

    setCashedOut(true)
    setCashOutMultiplier(multiplier)
    setHasActiveBet(false)
    addToBalance(Math.floor(betAmount * multiplier))

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <Card className="max-w-4xl mx-auto bg-black/40 border-blue-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Plane className="w-6 h-6" />
            Aviãozinho - Crash Game
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Game Display */}
          <div className="relative h-64 bg-gradient-to-t from-blue-900/50 to-transparent rounded-lg border border-blue-500/30 overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div
                  className={`text-6xl font-bold transition-all duration-300 ${
                    hasCrashed
                      ? "text-red-500 animate-pulse"
                      : isFlying
                        ? "text-green-400 animate-bounce"
                        : "text-white"
                  }`}
                >
                  {multiplier.toFixed(2)}x
                </div>
                {hasCrashed && <div className="text-red-400 text-xl font-semibold mt-2 animate-pulse">CRASHED!</div>}
                {cashedOut && (
                  <div className="text-green-400 text-xl font-semibold mt-2">
                    Cashed out at {cashOutMultiplier.toFixed(2)}x!
                  </div>
                )}
              </div>
            </div>

            {/* Airplane Animation */}
            <div
              className={`absolute transition-all duration-1000 ${
                isFlying
                  ? "bottom-4 right-4 animate-pulse"
                  : hasCrashed
                    ? "bottom-2 right-2 rotate-45"
                    : "bottom-4 left-4"
              }`}
            >
              <Plane className={`w-8 h-8 ${hasCrashed ? "text-red-500" : "text-blue-400"}`} />
            </div>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <label className="text-white text-sm mb-2 block">Valor da Aposta</label>
                <Input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(Number(e.target.value))}
                  className="bg-black/20 border-blue-500/30 text-white"
                  disabled={isFlying}
                  min="1"
                  max={balance}
                />
              </div>
              <Button
                onClick={startRound}
                disabled={isFlying || betAmount > balance || betAmount < 1}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
              >
                {isFlying ? "Voando..." : "Apostar"}
              </Button>
            </div>

            <div className="space-y-4">
              <div className="text-white">
                <div className="text-sm opacity-80">Saldo: {balance} pontos</div>
                <div className="text-sm opacity-80">Ganho potencial: {(betAmount * multiplier).toFixed(0)} pontos</div>
              </div>
              <Button
                onClick={cashOut}
                disabled={!hasActiveBet || cashedOut}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                Cash Out - {multiplier.toFixed(2)}x
              </Button>
            </div>
          </div>

          {/* Recent Results */}
          <div className="border-t border-blue-500/20 pt-4">
            <h3 className="text-white font-semibold mb-2">Últimos Resultados</h3>
            <div className="flex gap-2 flex-wrap">
              {[2.34, 1.56, 8.92, 1.23, 3.45, 1.89, 5.67, 2.11].map((result, index) => (
                <div
                  key={index}
                  className={`px-3 py-1 rounded text-sm font-semibold ${
                    result >= 2 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {result.toFixed(2)}x
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
