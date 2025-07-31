"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { useGame } from "@/contexts/game-context"
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from "lucide-react"

export default function DiceGame() {
  const { balance, addToBalance, subtractFromBalance } = useGame()
  const [betAmount, setBetAmount] = useState(10)
  const [prediction, setPrediction] = useState(50)
  const [isRolling, setIsRolling] = useState(false)
  const [lastRoll, setLastRoll] = useState<number | null>(null)
  const [betType, setBetType] = useState<"over" | "under">("over")
  const [rollHistory, setRollHistory] = useState<{ roll: number; win: boolean; multiplier: number }[]>([])
  const [currentDice, setCurrentDice] = useState<number[]>([1, 1])

  const calculateMultiplier = () => {
    const winChance = betType === "over" ? (100 - prediction) / 100 : prediction / 100
    return Math.max(1.01, 0.99 / winChance)
  }

  const rollDice = async () => {
    if (betAmount > balance || isRolling) return

    subtractFromBalance(betAmount)
    setIsRolling(true)

    // Animação dos dados
    const animationDuration = 2000
    const animationInterval = 100

    const animationTimer = setInterval(() => {
      setCurrentDice([Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1])
    }, animationInterval)

    setTimeout(() => {
      clearInterval(animationTimer)

      // Resultado final
      const dice1 = Math.floor(Math.random() * 6) + 1
      const dice2 = Math.floor(Math.random() * 6) + 1
      const total = dice1 + dice2

      setCurrentDice([dice1, dice2])
      setLastRoll(total)

      // Verificar se ganhou
      const won = betType === "over" ? total > prediction : total < prediction
      const multiplier = calculateMultiplier()

      if (won) {
        const winAmount = Math.floor(betAmount * multiplier)
        addToBalance(winAmount)
      }

      // Adicionar ao histórico
      setRollHistory((prev) => [{ roll: total, win: won, multiplier }, ...prev.slice(0, 9)])
      setIsRolling(false)
    }, animationDuration)
  }

  const getDiceIcon = (value: number) => {
    const icons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6]
    const IconComponent = icons[value - 1]
    return <IconComponent className="w-12 h-12 text-white" />
  }

  const winChance = betType === "over" ? 100 - prediction : prediction
  const multiplier = calculateMultiplier()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900 p-4">
      <Card className="max-w-4xl mx-auto bg-black/40 border-orange-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Dice1 className="w-6 h-6" />
            Dice - Dados Personalizáveis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Dice Display */}
          <div className="text-center">
            <div className="flex justify-center gap-4 mb-4">
              <div
                className={`w-20 h-20 bg-gradient-to-br from-red-500 to-red-700 rounded-lg flex items-center justify-center border-2 border-red-400 ${
                  isRolling ? "animate-spin" : ""
                }`}
              >
                {getDiceIcon(currentDice[0])}
              </div>
              <div
                className={`w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center border-2 border-blue-400 ${
                  isRolling ? "animate-spin" : ""
                }`}
              >
                {getDiceIcon(currentDice[1])}
              </div>
            </div>

            {lastRoll !== null && <div className="text-4xl font-bold text-white mb-2">Total: {lastRoll}</div>}

            {!isRolling && lastRoll !== null && (
              <div className={`text-xl font-semibold ${rollHistory[0]?.win ? "text-green-400" : "text-red-400"}`}>
                {rollHistory[0]?.win ? "🎉 Você ganhou!" : "😔 Você perdeu!"}
              </div>
            )}
          </div>

          {/* Betting Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-white text-sm mb-2 block">Valor da Aposta</label>
                <Input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(Number(e.target.value))}
                  className="bg-black/20 border-orange-500/30 text-white"
                  disabled={isRolling}
                  min="1"
                  max={balance}
                />
              </div>

              <div>
                <label className="text-white text-sm mb-2 block">
                  Predição: {prediction} ({betType === "over" ? "Maior que" : "Menor que"})
                </label>
                <Slider
                  value={[prediction]}
                  onValueChange={(value) => setPrediction(value[0])}
                  max={11}
                  min={2}
                  step={1}
                  disabled={isRolling}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-white/60 mt-1">
                  <span>2</span>
                  <span>6.5</span>
                  <span>11</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => setBetType("under")}
                  disabled={isRolling}
                  variant={betType === "under" ? "default" : "outline"}
                  className={
                    betType === "under"
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "border-blue-500/30 text-blue-400 hover:bg-blue-500/10 bg-transparent"
                  }
                >
                  Menor que {prediction}
                </Button>
                <Button
                  onClick={() => setBetType("over")}
                  disabled={isRolling}
                  variant={betType === "over" ? "default" : "outline"}
                  className={
                    betType === "over"
                      ? "bg-red-600 hover:bg-red-700"
                      : "border-red-500/30 text-red-400 hover:bg-red-500/10 bg-transparent"
                  }
                >
                  Maior que {prediction}
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-black/20 rounded-lg p-4 border border-orange-500/20">
                <h3 className="text-white font-semibold mb-3">Estatísticas da Aposta</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/80">Chance de Vitória:</span>
                    <span className="text-green-400 font-semibold">{winChance.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/80">Multiplicador:</span>
                    <span className="text-yellow-400 font-semibold">{multiplier.toFixed(2)}x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/80">Ganho Potencial:</span>
                    <span className="text-blue-400 font-semibold">{Math.floor(betAmount * multiplier)} pts</span>
                  </div>
                  <div className="flex justify-between border-t border-orange-500/20 pt-2">
                    <span className="text-white/80">Saldo Atual:</span>
                    <span className="text-white font-semibold">{balance} pts</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={rollDice}
                disabled={isRolling || betAmount > balance || betAmount < 1}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-lg py-3"
              >
                {isRolling ? "Rolando..." : "Rolar Dados"}
              </Button>
            </div>
          </div>

          {/* Roll History */}
          <div className="border-t border-orange-500/20 pt-4">
            <h3 className="text-white font-semibold mb-3">Histórico de Rolagens</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {rollHistory.map((roll, index) => (
                <div
                  key={index}
                  className={`p-2 rounded text-center text-sm font-semibold ${
                    roll.win
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : "bg-red-500/20 text-red-400 border border-red-500/30"
                  }`}
                >
                  <div>{roll.roll}</div>
                  <div className="text-xs opacity-80">{roll.multiplier.toFixed(2)}x</div>
                </div>
              ))}
            </div>
            {rollHistory.length === 0 && <p className="text-white/60 text-center py-4">Nenhuma rolagem ainda</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
