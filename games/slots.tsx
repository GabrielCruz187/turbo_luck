"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useGame } from "@/contexts/game-context"
import { Cherry, Zap } from "lucide-react"

interface SlotSymbol {
  symbol: string
  value: number
  color: string
}

export default function SlotsGame() {
  const { balance, addToBalance, subtractFromBalance } = useGame()
  const [betAmount, setBetAmount] = useState(10)
  const [isSpinning, setIsSpinning] = useState(false)
  const [reels, setReels] = useState<string[]>(["🍒", "🍒", "🍒"])
  const [lastWin, setLastWin] = useState<{ amount: number; combination: string } | null>(null)
  const [spinHistory, setSpinHistory] = useState<{ reels: string[]; win: number }[]>([])
  const reelRefs = useRef<HTMLDivElement[]>([])

  const symbols: SlotSymbol[] = [
    { symbol: "🍒", value: 2, color: "text-red-400" },
    { symbol: "🍋", value: 3, color: "text-yellow-400" },
    { symbol: "🍊", value: 4, color: "text-orange-400" },
    { symbol: "🍇", value: 5, color: "text-purple-400" },
    { symbol: "🔔", value: 8, color: "text-blue-400" },
    { symbol: "💎", value: 15, color: "text-cyan-400" },
    { symbol: "⭐", value: 25, color: "text-yellow-300" },
    { symbol: "🎰", value: 100, color: "text-green-400" },
  ]

  const getRandomSymbol = () => {
    const weights = [30, 25, 20, 15, 8, 5, 3, 1] // Probabilidades decrescentes
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
    let random = Math.random() * totalWeight

    for (let i = 0; i < symbols.length; i++) {
      random -= weights[i]
      if (random <= 0) {
        return symbols[i].symbol
      }
    }

    return symbols[0].symbol
  }

  const calculateWin = (reels: string[]) => {
    // Três símbolos iguais
    if (reels[0] === reels[1] && reels[1] === reels[2]) {
      const symbol = symbols.find((s) => s.symbol === reels[0])
      return symbol ? betAmount * symbol.value : 0
    }

    // Dois símbolos iguais
    const symbolCounts = reels.reduce(
      (acc, symbol) => {
        acc[symbol] = (acc[symbol] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    for (const [symbol, count] of Object.entries(symbolCounts)) {
      if (count === 2) {
        const symbolData = symbols.find((s) => s.symbol === symbol)
        return symbolData ? Math.floor(betAmount * (symbolData.value * 0.3)) : 0
      }
    }

    return 0
  }

  const spin = async () => {
    if (betAmount > balance || isSpinning) return

    subtractFromBalance(betAmount)
    setIsSpinning(true)
    setLastWin(null)

    // Animação dos rolos
    const spinDuration = 2000
    const spinInterval = 100

    // Animar cada rolo com delays diferentes
    const reelPromises = reels.map((_, index) => {
      return new Promise<string>((resolve) => {
        let spinCount = 0
        const maxSpins = 20 + index * 5 // Cada rolo para em momentos diferentes

        const reelTimer = setInterval(() => {
          const newReels = [...reels]
          newReels[index] = getRandomSymbol()
          setReels(newReels)

          spinCount++
          if (spinCount >= maxSpins) {
            clearInterval(reelTimer)
            const finalSymbol = getRandomSymbol()
            resolve(finalSymbol)
          }
        }, spinInterval)
      })
    })

    // Aguardar todos os rolos pararem
    const finalReels = await Promise.all(reelPromises)
    setReels(finalReels)

    // Calcular ganhos
    const winAmount = calculateWin(finalReels)
    if (winAmount > 0) {
      addToBalance(winAmount)
      setLastWin({
        amount: winAmount,
        combination: finalReels.join(" "),
      })
    }

    // Adicionar ao histórico
    setSpinHistory((prev) => [{ reels: finalReels, win: winAmount }, ...prev.slice(0, 9)])
    setIsSpinning(false)
  }

  const getSymbolColor = (symbol: string) => {
    const symbolData = symbols.find((s) => s.symbol === symbol)
    return symbolData?.color || "text-white"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-yellow-900 to-slate-900 p-4">
      <Card className="max-w-4xl mx-auto bg-black/40 border-yellow-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Cherry className="w-6 h-6" />
            Slots - Caça-Níqueis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Slot Machine Display */}
          <div className="bg-gradient-to-b from-yellow-600 to-yellow-800 p-6 rounded-2xl border-4 border-yellow-400">
            <div className="bg-black rounded-lg p-4 mb-4">
              <div className="flex justify-center gap-4">
                {reels.map((symbol, index) => (
                  <div
                    key={index}
                    ref={(el) => {
                      if (el) reelRefs.current[index] = el
                    }}
                    className={`w-24 h-24 bg-white rounded-lg flex items-center justify-center text-5xl border-2 border-gray-300 ${
                      isSpinning ? "animate-pulse" : ""
                    }`}
                  >
                    <span className={getSymbolColor(symbol)}>{symbol}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Win Display */}
            {lastWin && (
              <div className="text-center mb-4">
                <div className="bg-green-600 text-white px-6 py-3 rounded-full inline-block animate-pulse">
                  <div className="text-lg font-bold">🎉 GANHOU! 🎉</div>
                  <div className="text-2xl font-bold">{lastWin.amount} pontos</div>
                  <div className="text-sm opacity-90">{lastWin.combination}</div>
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="flex justify-center gap-4">
              <div className="bg-black/50 rounded-lg p-3 text-white text-center">
                <div className="text-sm opacity-80">Aposta</div>
                <div className="font-bold">{betAmount}</div>
              </div>
              <Button
                onClick={spin}
                disabled={isSpinning || betAmount > balance || betAmount < 1}
                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-xl px-8 py-4"
              >
                <Zap className="w-6 h-6 mr-2" />
                {isSpinning ? "GIRANDO..." : "GIRAR"}
              </Button>
              <div className="bg-black/50 rounded-lg p-3 text-white text-center">
                <div className="text-sm opacity-80">Saldo</div>
                <div className="font-bold">{balance}</div>
              </div>
            </div>
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
                  className="bg-black/20 border-yellow-500/30 text-white"
                  disabled={isSpinning}
                  min="1"
                  max={balance}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => setBetAmount(Math.min(balance, 10))}
                  disabled={isSpinning}
                  variant="outline"
                  className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 bg-transparent"
                >
                  Min (10)
                </Button>
                <Button
                  onClick={() => setBetAmount(Math.min(balance, 50))}
                  disabled={isSpinning}
                  variant="outline"
                  className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 bg-transparent"
                >
                  50
                </Button>
                <Button
                  onClick={() => setBetAmount(Math.min(balance, 100))}
                  disabled={isSpinning}
                  variant="outline"
                  className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 bg-transparent"
                >
                  100
                </Button>
                <Button
                  onClick={() => setBetAmount(balance)}
                  disabled={isSpinning || balance === 0}
                  variant="outline"
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10 bg-transparent"
                >
                  Max
                </Button>
              </div>
            </div>

            <div className="bg-black/20 rounded-lg p-4 border border-yellow-500/20">
              <h3 className="text-white font-semibold mb-3">Tabela de Pagamentos</h3>
              <div className="space-y-1 text-xs">
                {symbols.map((symbol) => (
                  <div key={symbol.symbol} className="flex justify-between">
                    <span className="flex items-center gap-1">
                      <span className={symbol.color}>{symbol.symbol}</span>
                      <span className={symbol.color}>{symbol.symbol}</span>
                      <span className={symbol.color}>{symbol.symbol}</span>
                    </span>
                    <span className="text-yellow-400 font-semibold">{symbol.value}x</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-yellow-500/20 mt-2 pt-2 text-xs text-white/60">
                2 símbolos iguais = 30% do valor
              </div>
            </div>
          </div>

          {/* Spin History */}
          <div className="border-t border-yellow-500/20 pt-4">
            <h3 className="text-white font-semibold mb-3">Histórico de Giros</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {spinHistory.map((spin, index) => (
                <div
                  key={index}
                  className={`p-3 rounded text-center border ${
                    spin.win > 0
                      ? "bg-green-500/20 text-green-400 border-green-500/30"
                      : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                  }`}
                >
                  <div className="text-lg mb-1">{spin.reels.join(" ")}</div>
                  <div className="text-sm font-semibold">{spin.win > 0 ? `+${spin.win} pts` : "Sem ganho"}</div>
                </div>
              ))}
            </div>
            {spinHistory.length === 0 && <p className="text-white/60 text-center py-4">Nenhum giro ainda</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
