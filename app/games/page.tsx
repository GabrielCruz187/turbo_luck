"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GameProvider, useGame } from "@/contexts/game-context"
import AviatorGame from "@/games/aviator"
import MinesGame from "@/games/mines"
import RouletteGame from "@/games/roulette"
import { Plane, Bomb, RotateCcw, ArrowLeft, Wallet } from "lucide-react"

function GameSelector() {
  const [selectedGame, setSelectedGame] = useState<string | null>(null)
  const { balance } = useGame()

  const games = [
    {
      id: "aviator",
      name: "Aviãozinho",
      description: "Crash game com multiplicadores até 1000x",
      icon: <Plane className="w-8 h-8" />,
      color: "from-blue-500 to-cyan-500",
      component: AviatorGame,
    },
    {
      id: "mines",
      name: "Mines",
      description: "Campo minado estratégico com grandes prêmios",
      icon: <Bomb className="w-8 h-8" />,
      color: "from-green-500 to-emerald-500",
      component: MinesGame,
    },
    {
      id: "roulette",
      name: "Roleta",
      description: "Roleta europeia clássica",
      icon: <RotateCcw className="w-8 h-8" />,
      color: "from-red-500 to-pink-500",
      component: RouletteGame,
    },
  ]

  if (selectedGame) {
    const game = games.find((g) => g.id === selectedGame)
    if (game) {
      const GameComponent = game.component
      return (
        <div>
          <div className="fixed top-4 left-4 z-50">
            <Button
              onClick={() => setSelectedGame(null)}
              className="bg-black/40 backdrop-blur-md border border-white/20 text-white hover:bg-black/60"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar aos Jogos
            </Button>
          </div>
          <div className="fixed top-4 right-4 z-50">
            <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-lg px-4 py-2 text-white flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              {balance} pontos
            </div>
          </div>
          <GameComponent />
        </div>
      )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="container mx-auto">
        <div className="text-center mb-12 pt-8">
          <h1 className="text-5xl font-bold text-white mb-4">
            Turbo<span className="text-purple-400">Luck</span> Games
          </h1>
          <p className="text-white/80 text-lg">Escolha seu jogo favorito e teste sua sorte!</p>
          <div className="mt-4 flex items-center justify-center gap-2 text-white/60">
            <Wallet className="w-5 h-5" />
            <span>Saldo: {balance} pontos</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {games.map((game) => (
            <Card
              key={game.id}
              className="bg-black/40 border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:scale-105 group cursor-pointer"
              onClick={() => setSelectedGame(game.id)}
            >
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-3">
                  <div
                    className={`p-3 rounded-lg bg-gradient-to-r ${game.color} group-hover:scale-110 transition-transform`}
                  >
                    {game.icon}
                  </div>
                  {game.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/70 mb-4">{game.description}</p>
                <Button className={`w-full bg-gradient-to-r ${game.color} hover:opacity-90`}>Jogar Agora</Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Card className="max-w-md mx-auto bg-black/40 border-yellow-500/20">
            <CardContent className="p-6">
              <h3 className="text-white font-semibold mb-2">💡 Dica do TurboBot</h3>
              <p className="text-white/80 text-sm">
                Comece com apostas pequenas para entender a mecânica de cada jogo. Gerencie seu saldo com sabedoria!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function GamesPage() {
  return (
    <GameProvider>
      <GameSelector />
    </GameProvider>
  )
}
