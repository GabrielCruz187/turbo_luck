"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useGame } from "@/contexts/game-context"
import TurboBotDashboard from "@/components/turbo-bot-dashboard"
import { Bomb, Gem, Bot } from "lucide-react"

interface Cell {
  revealed: boolean
  isMine: boolean
  id: number
}

export default function MinesGame() {
  const { balance, addToBalance, subtractFromBalance } = useGame()
  const [grid, setGrid] = useState<Cell[]>([])
  const [mineCount, setMineCount] = useState(3)
  const [betAmount, setBetAmount] = useState(10)
  const [gameActive, setGameActive] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [revealedCount, setRevealedCount] = useState(0)
  const [currentMultiplier, setCurrentMultiplier] = useState(1)
  const [showTurboBot, setShowTurboBot] = useState(false)

  const initializeGrid = () => {
    const newGrid: Cell[] = Array.from({ length: 25 }, (_, index) => ({
      revealed: false,
      isMine: false,
      id: index,
    }))

    // Coloca minas aleatoriamente
    const minePositions = new Set<number>()
    while (minePositions.size < mineCount) {
      minePositions.add(Math.floor(Math.random() * 25))
    }

    minePositions.forEach((pos) => {
      newGrid[pos].isMine = true
    })

    setGrid(newGrid)
  }

  const startGame = () => {
    if (betAmount > balance) return

    subtractFromBalance(betAmount)
    setGameActive(true)
    setGameOver(false)
    setRevealedCount(0)
    setCurrentMultiplier(1)
    initializeGrid()
  }

  const revealCell = (cellId: number) => {
    if (!gameActive || gameOver) return

    const cell = grid[cellId]
    if (cell.revealed) return

    const newGrid = [...grid]
    newGrid[cellId].revealed = true
    setGrid(newGrid)

    if (cell.isMine) {
      // Game Over - hit mine
      setGameOver(true)
      setGameActive(false)
      // Revela todas as minas
      newGrid.forEach((c) => {
        if (c.isMine) c.revealed = true
      })
      setGrid(newGrid)
    } else {
      // Safe cell
      const newRevealedCount = revealedCount + 1
      setRevealedCount(newRevealedCount)

      // Calcula multiplicador baseado em células seguras reveladas
      const safeSpaces = 25 - mineCount
      const multiplier = 1 + (newRevealedCount / safeSpaces) * (mineCount * 0.5)
      setCurrentMultiplier(multiplier)
    }
  }

  const cashOut = () => {
    if (!gameActive || gameOver) return

    const winAmount = Math.floor(betAmount * currentMultiplier)
    addToBalance(winAmount)
    setGameActive(false)

    // Revela todas as células
    const newGrid = grid.map((cell) => ({ ...cell, revealed: true }))
    setGrid(newGrid)
  }

  useEffect(() => {
    initializeGrid()
  }, [mineCount])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 p-4">
      {showTurboBot && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 p-4 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-end mb-4">
              <Button
                onClick={() => setShowTurboBot(false)}
                variant="outline"
                className="border-green-500/30 text-green-400 hover:bg-green-500/10 bg-transparent"
              >
                Fechar TurboBot
              </Button>
            </div>
            <TurboBotDashboard gameType="mines" userId="user-id" />
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
      <Card className="max-w-4xl mx-auto bg-black/40 border-green-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Bomb className="w-6 h-6" />
            Mines - Campo Minado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Game Controls */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-white text-sm mb-2 block">Valor da Aposta</label>
              <Input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(Number(e.target.value))}
                className="bg-black/20 border-green-500/30 text-white"
                disabled={gameActive}
                min="1"
                max={balance}
              />
            </div>
            <div>
              <label className="text-white text-sm mb-2 block">Número de Minas</label>
              <Select
                value={mineCount.toString()}
                onValueChange={(value) => setMineCount(Number(value))}
                disabled={gameActive}
              >
                <SelectTrigger className="bg-black/20 border-green-500/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Mina</SelectItem>
                  <SelectItem value="3">3 Minas</SelectItem>
                  <SelectItem value="5">5 Minas</SelectItem>
                  <SelectItem value="10">10 Minas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col justify-end">
              <Button
                onClick={startGame}
                disabled={gameActive || betAmount > balance || betAmount < 1}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                {gameActive ? "Jogo Ativo" : "Iniciar Jogo"}
              </Button>
            </div>
            <div className="flex flex-col justify-end">
              <Button
                onClick={cashOut}
                disabled={!gameActive || gameOver || revealedCount === 0}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
              >
                Cash Out - {currentMultiplier.toFixed(2)}x
              </Button>
            </div>
          </div>

          {/* Game Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-black/20 rounded-lg p-3 border border-green-500/20">
              <div className="text-white text-sm opacity-80">Saldo</div>
              <div className="text-green-400 font-bold">{balance} pontos</div>
            </div>
            <div className="bg-black/20 rounded-lg p-3 border border-green-500/20">
              <div className="text-white text-sm opacity-80">Multiplicador</div>
              <div className="text-yellow-400 font-bold">{currentMultiplier.toFixed(2)}x</div>
            </div>
            <div className="bg-black/20 rounded-lg p-3 border border-green-500/20">
              <div className="text-white text-sm opacity-80">Ganho Potencial</div>
              <div className="text-blue-400 font-bold">{Math.floor(betAmount * currentMultiplier)} pontos</div>
            </div>
          </div>

          {/* Game Grid */}
          <div className="grid grid-cols-5 gap-2 max-w-md mx-auto">
            {grid.map((cell) => (
              <button
                key={cell.id}
                onClick={() => revealCell(cell.id)}
                disabled={!gameActive || cell.revealed || gameOver}
                className={`aspect-square rounded-lg border-2 transition-all duration-200 flex items-center justify-center text-2xl ${
                  cell.revealed
                    ? cell.isMine
                      ? "bg-red-500 border-red-600 animate-pulse"
                      : "bg-green-500 border-green-600"
                    : "bg-gray-700 border-gray-600 hover:bg-gray-600 hover:border-gray-500"
                }`}
              >
                {cell.revealed &&
                  (cell.isMine ? <Bomb className="w-6 h-6 text-white" /> : <Gem className="w-6 h-6 text-white" />)}
              </button>
            ))}
          </div>

          {/* Game Status */}
          {gameOver && (
            <div className="text-center">
              <div className="text-red-400 text-xl font-bold mb-2">💥 BOOM! Você acertou uma mina!</div>
              <div className="text-white/80">Tente novamente com uma estratégia diferente</div>
            </div>
          )}

          {!gameActive && !gameOver && revealedCount > 0 && (
            <div className="text-center">
              <div className="text-green-400 text-xl font-bold mb-2">🎉 Cash out realizado com sucesso!</div>
              <div className="text-white/80">Você ganhou {Math.floor(betAmount * currentMultiplier)} pontos</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
