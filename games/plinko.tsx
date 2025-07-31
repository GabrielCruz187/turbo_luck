"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useGame } from "@/contexts/game-context"
import { Circle, Play } from "lucide-react"

interface Ball {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  color: string
}

interface Peg {
  x: number
  y: number
  radius: number
}

export default function PlinkoGame() {
  const { balance, addToBalance, subtractFromBalance } = useGame()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const [balls, setBalls] = useState<Ball[]>([])
  const [betAmount, setBetAmount] = useState(10)
  const [riskLevel, setRiskLevel] = useState("medium")
  const [isDropping, setIsDropping] = useState(false)
  const [lastResult, setLastResult] = useState<{ slot: number; multiplier: number } | null>(null)

  const CANVAS_WIDTH = 600
  const CANVAS_HEIGHT = 500
  const ROWS = 12
  const SLOTS = 13

  // Multiplicadores baseados no nível de risco
  const multipliers = {
    low: [1.5, 1.2, 1.1, 1.0, 0.5, 0.3, 0.5, 1.0, 1.1, 1.2, 1.5],
    medium: [5.6, 2.1, 1.1, 1.0, 0.5, 0.3, 0.5, 1.0, 1.1, 2.1, 5.6],
    high: [29, 8.4, 3.0, 1.3, 0.3, 0.2, 0.3, 1.3, 3.0, 8.4, 29],
  }

  // Gerar pegs (pinos)
  const generatePegs = (): Peg[] => {
    const pegs: Peg[] = []
    const pegRadius = 4
    const startY = 80
    const rowHeight = 35

    for (let row = 0; row < ROWS; row++) {
      const pegsInRow = row + 3
      const startX = (CANVAS_WIDTH - (pegsInRow - 1) * 40) / 2

      for (let col = 0; col < pegsInRow; col++) {
        pegs.push({
          x: startX + col * 40,
          y: startY + row * rowHeight,
          radius: pegRadius,
        })
      }
    }

    return pegs
  }

  const pegs = generatePegs()

  const dropBall = () => {
    if (betAmount > balance || isDropping) return

    subtractFromBalance(betAmount)
    setIsDropping(true)
    setLastResult(null)

    const newBall: Ball = {
      id: Date.now(),
      x: CANVAS_WIDTH / 2 + (Math.random() - 0.5) * 20,
      y: 20,
      vx: (Math.random() - 0.5) * 2,
      vy: 0,
      radius: 6,
      color: `hsl(${Math.random() * 360}, 70%, 60%)`,
    }

    setBalls([newBall])
  }

  const updatePhysics = () => {
    setBalls((prevBalls) => {
      const updatedBalls = prevBalls.map((ball) => {
        const newBall = { ...ball }

        // Gravidade
        newBall.vy += 0.3

        // Atualizar posição
        newBall.x += newBall.vx
        newBall.y += newBall.vy

        // Colisão com pegs
        pegs.forEach((peg) => {
          const dx = newBall.x - peg.x
          const dy = newBall.y - peg.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < newBall.radius + peg.radius) {
            // Calcular ângulo de colisão
            const angle = Math.atan2(dy, dx)
            const speed = Math.sqrt(newBall.vx * newBall.vx + newBall.vy * newBall.vy)

            // Aplicar nova velocidade após colisão
            newBall.vx = Math.cos(angle) * speed * 0.7 + (Math.random() - 0.5) * 2
            newBall.vy = Math.sin(angle) * speed * 0.7

            // Separar bola do peg
            const overlap = newBall.radius + peg.radius - distance
            newBall.x += (dx / distance) * overlap
            newBall.y += (dy / distance) * overlap
          }
        })

        // Colisão com paredes laterais
        if (newBall.x - newBall.radius < 0) {
          newBall.x = newBall.radius
          newBall.vx = Math.abs(newBall.vx)
        }
        if (newBall.x + newBall.radius > CANVAS_WIDTH) {
          newBall.x = CANVAS_WIDTH - newBall.radius
          newBall.vx = -Math.abs(newBall.vx)
        }

        // Verificar se chegou ao fundo
        if (newBall.y > CANVAS_HEIGHT - 60) {
          const slotWidth = CANVAS_WIDTH / SLOTS
          const slot = Math.floor(newBall.x / slotWidth)
          const clampedSlot = Math.max(0, Math.min(SLOTS - 1, slot))
          const multiplier = multipliers[riskLevel as keyof typeof multipliers][clampedSlot] || 0

          setLastResult({ slot: clampedSlot, multiplier })
          setIsDropping(false)

          const winAmount = Math.floor(betAmount * multiplier)
          if (winAmount > 0) {
            addToBalance(winAmount)
          }

          return null // Remove a bola
        }

        return newBall
      })

      return updatedBalls.filter((ball) => ball !== null) as Ball[]
    })
  }

  const draw = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Limpar canvas
    ctx.fillStyle = "#1a1a2e"
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Desenhar pegs
    ctx.fillStyle = "#ffd700"
    pegs.forEach((peg) => {
      ctx.beginPath()
      ctx.arc(peg.x, peg.y, peg.radius, 0, Math.PI * 2)
      ctx.fill()
    })

    // Desenhar slots no fundo
    const slotWidth = CANVAS_WIDTH / SLOTS
    const currentMultipliers = multipliers[riskLevel as keyof typeof multipliers]

    for (let i = 0; i < SLOTS; i++) {
      const x = i * slotWidth
      const multiplier = currentMultipliers[i]

      // Cor baseada no multiplicador
      let color = "#4a5568"
      if (multiplier >= 10) color = "#f56565"
      else if (multiplier >= 2) color = "#ed8936"
      else if (multiplier >= 1) color = "#48bb78"
      else color = "#4299e1"

      ctx.fillStyle = color
      ctx.fillRect(x, CANVAS_HEIGHT - 50, slotWidth - 2, 50)

      // Texto do multiplicador
      ctx.fillStyle = "white"
      ctx.font = "12px Arial"
      ctx.textAlign = "center"
      ctx.fillText(`${multiplier}x`, x + slotWidth / 2, CANVAS_HEIGHT - 25)
    }

    // Desenhar bolas
    balls.forEach((ball) => {
      ctx.fillStyle = ball.color
      ctx.beginPath()
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2)
      ctx.fill()

      // Efeito de brilho
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)"
      ctx.beginPath()
      ctx.arc(ball.x - 2, ball.y - 2, ball.radius / 2, 0, Math.PI * 2)
      ctx.fill()
    })
  }

  const gameLoop = () => {
    updatePhysics()
    draw()
    animationRef.current = requestAnimationFrame(gameLoop)
  }

  useEffect(() => {
    gameLoop()
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [balls, riskLevel])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <Card className="max-w-4xl mx-auto bg-black/40 border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Circle className="w-6 h-6" />
            Plinko - Física das Bolas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Game Canvas */}
          <div className="flex justify-center">
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className="border border-purple-500/30 rounded-lg bg-slate-800"
            />
          </div>

          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-white text-sm mb-2 block">Valor da Aposta</label>
              <Input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(Number(e.target.value))}
                className="bg-black/20 border-purple-500/30 text-white"
                disabled={isDropping}
                min="1"
                max={balance}
              />
            </div>
            <div>
              <label className="text-white text-sm mb-2 block">Nível de Risco</label>
              <Select value={riskLevel} onValueChange={setRiskLevel} disabled={isDropping}>
                <SelectTrigger className="bg-black/20 border-purple-500/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixo (max 1.5x)</SelectItem>
                  <SelectItem value="medium">Médio (max 5.6x)</SelectItem>
                  <SelectItem value="high">Alto (max 29x)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col justify-end">
              <Button
                onClick={dropBall}
                disabled={isDropping || betAmount > balance || betAmount < 1}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <Play className="w-4 h-4 mr-2" />
                {isDropping ? "Caindo..." : "Soltar Bola"}
              </Button>
            </div>
          </div>

          {/* Game Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-black/20 rounded-lg p-3 border border-purple-500/20">
              <div className="text-white text-sm opacity-80">Saldo</div>
              <div className="text-purple-400 font-bold">{balance} pontos</div>
            </div>
            <div className="bg-black/20 rounded-lg p-3 border border-purple-500/20">
              <div className="text-white text-sm opacity-80">Último Resultado</div>
              <div className="text-yellow-400 font-bold">{lastResult ? `${lastResult.multiplier}x` : "---"}</div>
            </div>
            <div className="bg-black/20 rounded-lg p-3 border border-purple-500/20">
              <div className="text-white text-sm opacity-80">Ganho Potencial</div>
              <div className="text-green-400 font-bold">
                {lastResult ? Math.floor(betAmount * lastResult.multiplier) : betAmount * 5.6} pts
              </div>
            </div>
          </div>

          {/* Result Display */}
          {lastResult && (
            <div className="text-center">
              <div
                className={`inline-block px-6 py-3 rounded-full text-xl font-bold ${
                  lastResult.multiplier >= 2
                    ? "bg-green-600 text-white"
                    : lastResult.multiplier >= 1
                      ? "bg-yellow-600 text-white"
                      : "bg-red-600 text-white"
                }`}
              >
                {lastResult.multiplier >= 1 ? "🎉" : "😔"} {lastResult.multiplier}x -{" "}
                {Math.floor(betAmount * lastResult.multiplier)} pontos
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
