"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useGame } from "@/contexts/game-context"
import TurboBotDashboard from "@/components/turbo-bot-dashboard"
import { RotateCcw, Bot } from "lucide-react"

interface Bet {
  type: "number" | "color" | "even-odd" | "high-low"
  value: string | number
  amount: number
  payout: number
}

export default function RouletteGame() {
  const { balance, addToBalance, subtractFromBalance } = useGame()
  const [isSpinning, setIsSpinning] = useState(false)
  const [result, setResult] = useState<number | null>(null)
  const [bets, setBets] = useState<Bet[]>([])
  const [betAmount, setBetAmount] = useState(10)
  const [rotation, setRotation] = useState(0)
  const wheelRef = useRef<HTMLDivElement>(null)
  const [showTurboBot, setShowTurboBot] = useState(false)

  const rouletteNumbers = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29,
    7, 28, 12, 35, 3, 26,
  ]

  const getNumberColor = (num: number) => {
    if (num === 0) return "green"
    const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]
    return redNumbers.includes(num) ? "red" : "black"
  }

  const placeBet = (type: Bet["type"], value: string | number, payout: number) => {
    if (betAmount > balance || isSpinning) return

    const newBet: Bet = { type, value, amount: betAmount, payout }
    setBets([...bets, newBet])
    subtractFromBalance(betAmount)
  }

  const clearBets = () => {
    if (isSpinning) return

    // Devolve o dinheiro das apostas
    const totalBets = bets.reduce((sum, bet) => sum + bet.amount, 0)
    addToBalance(totalBets)
    setBets([])
  }

  const spin = () => {
    if (bets.length === 0 || isSpinning) return

    setIsSpinning(true)
    const winningNumber = Math.floor(Math.random() * 37)
    const spins = 5 + Math.random() * 5 // 5-10 voltas
    const finalRotation = rotation + spins * 360 + winningNumber * (360 / 37)

    setRotation(finalRotation)

    setTimeout(() => {
      setResult(winningNumber)
      setIsSpinning(false)
      calculateWinnings(winningNumber)
    }, 3000)
  }

  const calculateWinnings = (winningNumber: number) => {
    let totalWinnings = 0

    bets.forEach((bet) => {
      let isWinner = false

      switch (bet.type) {
        case "number":
          isWinner = bet.value === winningNumber
          break
        case "color":
          isWinner = bet.value === getNumberColor(winningNumber)
          break
        case "even-odd":
          if (winningNumber === 0) break
          isWinner = bet.value === (winningNumber % 2 === 0 ? "even" : "odd")
          break
        case "high-low":
          if (winningNumber === 0) break
          isWinner = bet.value === (winningNumber <= 18 ? "low" : "high")
          break
      }

      if (isWinner) {
        totalWinnings += bet.amount * bet.payout
      }
    })

    if (totalWinnings > 0) {
      addToBalance(totalWinnings)
    }

    setBets([])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 p-4">
      {showTurboBot && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 p-4 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-end mb-4">
              <Button
                onClick={() => setShowTurboBot(false)}
                variant="outline"
                className="border-red-500/30 text-red-400 hover:bg-red-500/10 bg-transparent"
              >
                Fechar TurboBot
              </Button>
            </div>
            <TurboBotDashboard gameType="roulette" userId="user-id" />
          </div>
        </div>
      )}
      <div className="fixed top-4 right-20 z-50">
        <Button
          onClick={() => setShowTurboBot(!showTurboBot)}
          className="bg-purple-600 hover:bg-purple-700 border border-purple-500/30 text-white"
        >
          <Bot className="w-4 h-4 mr-2" />
          TurboBot
        </Button>
      </div>
      <Card className="max-w-6xl mx-auto bg-black/40 border-red-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <RotateCcw className="w-6 h-6" />
            Roleta Europeia
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Roulette Wheel */}
          <div className="flex justify-center">
            <div className="relative">
              <div
                ref={wheelRef}
                className="w-64 h-64 rounded-full border-8 border-yellow-600 relative overflow-hidden transition-transform duration-3000 ease-out"
                style={{ transform: `rotate(${rotation}deg)` }}
              >
                {rouletteNumbers.map((num, index) => {
                  const angle = (index * 360) / 37
                  const color = getNumberColor(num)
                  return (
                    <div
                      key={num}
                      className={`absolute w-full h-full ${
                        color === "red" ? "bg-red-600" : color === "black" ? "bg-gray-900" : "bg-green-600"
                      }`}
                      style={{
                        clipPath: `polygon(50% 50%, ${50 + 45 * Math.cos(((angle - 5) * Math.PI) / 180)}% ${50 + 45 * Math.sin(((angle - 5) * Math.PI) / 180)}%, ${50 + 45 * Math.cos(((angle + 5) * Math.PI) / 180)}% ${50 + 45 * Math.sin(((angle + 5) * Math.PI) / 180)}%)`,
                      }}
                    >
                      <div
                        className="absolute text-white text-xs font-bold"
                        style={{
                          top: `${50 + 35 * Math.sin((angle * Math.PI) / 180)}%`,
                          left: `${50 + 35 * Math.cos((angle * Math.PI) / 180)}%`,
                          transform: "translate(-50%, -50%)",
                        }}
                      >
                        {num}
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-yellow-400"></div>
            </div>
          </div>

          {/* Result Display */}
          {result !== null && (
            <div className="text-center">
              <div
                className={`inline-block px-6 py-3 rounded-full text-2xl font-bold ${
                  getNumberColor(result) === "red"
                    ? "bg-red-600"
                    : getNumberColor(result) === "black"
                      ? "bg-gray-900"
                      : "bg-green-600"
                } text-white`}
              >
                {result}
              </div>
            </div>
          )}

          {/* Betting Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-white text-sm mb-2 block">Valor da Aposta</label>
                <Input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(Number(e.target.value))}
                  className="bg-black/20 border-red-500/30 text-white"
                  disabled={isSpinning}
                  min="1"
                  max={balance}
                />
              </div>

              <div className="space-y-2">
                <h3 className="text-white font-semibold">Apostas Simples</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => placeBet("color", "red", 2)}
                    disabled={isSpinning || betAmount > balance}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Vermelho (2x)
                  </Button>
                  <Button
                    onClick={() => placeBet("color", "black", 2)}
                    disabled={isSpinning || betAmount > balance}
                    className="bg-gray-800 hover:bg-gray-900"
                  >
                    Preto (2x)
                  </Button>
                  <Button
                    onClick={() => placeBet("even-odd", "even", 2)}
                    disabled={isSpinning || betAmount > balance}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Par (2x)
                  </Button>
                  <Button
                    onClick={() => placeBet("even-odd", "odd", 2)}
                    disabled={isSpinning || betAmount > balance}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Ímpar (2x)
                  </Button>
                  <Button
                    onClick={() => placeBet("high-low", "low", 2)}
                    disabled={isSpinning || betAmount > balance}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    1-18 (2x)
                  </Button>
                  <Button
                    onClick={() => placeBet("high-low", "high", 2)}
                    disabled={isSpinning || betAmount > balance}
                    className="bg-yellow-600 hover:bg-yellow-700"
                  >
                    19-36 (2x)
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-black/20 rounded-lg p-4 border border-red-500/20">
                <h3 className="text-white font-semibold mb-2">Suas Apostas</h3>
                {bets.length === 0 ? (
                  <p className="text-white/60">Nenhuma aposta feita</p>
                ) : (
                  <div className="space-y-2">
                    {bets.map((bet, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-white">
                          {bet.type === "color"
                            ? `Cor ${bet.value}`
                            : bet.type === "even-odd"
                              ? bet.value === "even"
                                ? "Par"
                                : "Ímpar"
                              : bet.type === "high-low"
                                ? bet.value === "low"
                                  ? "1-18"
                                  : "19-36"
                                : `Número ${bet.value}`}
                        </span>
                        <span className="text-yellow-400">{bet.amount} pts</span>
                      </div>
                    ))}
                    <div className="border-t border-red-500/20 pt-2 flex justify-between font-semibold">
                      <span className="text-white">Total:</span>
                      <span className="text-yellow-400">{bets.reduce((sum, bet) => sum + bet.amount, 0)} pts</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={spin}
                  disabled={bets.length === 0 || isSpinning}
                  className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                >
                  {isSpinning ? "Girando..." : "Girar Roleta"}
                </Button>
                <Button
                  onClick={clearBets}
                  disabled={isSpinning || bets.length === 0}
                  variant="outline"
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10 bg-transparent"
                >
                  Limpar
                </Button>
              </div>

              <div className="text-center text-white/80">
                <div className="text-sm">Saldo: {balance} pontos</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
