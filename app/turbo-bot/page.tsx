"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import TurboBotDashboard from "@/components/turbo-bot-dashboard"
import { Bot, ArrowLeft, Zap, Brain, Target, TrendingUp } from "lucide-react"
import { useRouter } from "next/navigation"

export default function TurboBotPage() {
  const [selectedGame, setSelectedGame] = useState("aviator")
  const router = useRouter()

  const games = [
    { id: "aviator", name: "Aviãozinho", icon: "✈️", description: "Análise de crash patterns e multiplicadores" },
    { id: "mines", name: "Mines", icon: "💎", description: "Detecção de zonas seguras e padrões" },
    { id: "roulette", name: "Roleta", icon: "🎰", description: "Análise de tendências e sequências" },
    { id: "dice", name: "Dice", icon: "🎲", description: "Predição de números e probabilidades" },
  ]

  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Machine Learning",
      description: "Algoritmos avançados que aprendem com cada jogo",
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Predições Precisas",
      description: "Análise estatística com alta taxa de acerto",
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Padrões em Tempo Real",
      description: "Detecção instantânea de oportunidades",
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Alertas Inteligentes",
      description: "Notificações personalizadas para cada usuário",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            onClick={() => router.push("/games")}
            variant="outline"
            className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10 bg-transparent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar aos Jogos
          </Button>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center">
              <Bot className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-bold text-white">TurboBot IA</h1>
              <p className="text-purple-400 text-xl">Inteligência Artificial para Jogos</p>
            </div>
          </div>
          <p className="text-white/80 text-lg max-w-3xl mx-auto">
            O TurboBot utiliza algoritmos avançados de Machine Learning para analisar padrões, detectar oportunidades e
            fornecer insights inteligentes em tempo real.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="bg-black/40 border-purple-500/20 hover:border-purple-500/40 transition-all">
              <CardContent className="p-6 text-center">
                <div className="text-purple-400 mb-4 flex justify-center">{feature.icon}</div>
                <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                <p className="text-white/70 text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Game Selection */}
        <Card className="mb-8 bg-black/40 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="w-6 h-6 text-green-400" />
              Selecionar Jogo para Análise
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {games.map((game) => (
                <Button
                  key={game.id}
                  onClick={() => setSelectedGame(game.id)}
                  variant={selectedGame === game.id ? "default" : "outline"}
                  className={`h-auto p-4 flex flex-col items-center gap-2 ${
                    selectedGame === game.id
                      ? "bg-gradient-to-r from-purple-500 to-blue-500"
                      : "border-purple-500/30 text-purple-400 hover:bg-purple-500/10 bg-transparent"
                  }`}
                >
                  <span className="text-2xl">{game.icon}</span>
                  <div className="text-center">
                    <div className="font-semibold">{game.name}</div>
                    <div className="text-xs opacity-80">{game.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* TurboBot Dashboard */}
        <TurboBotDashboard gameType={selectedGame} userId="demo-user" />

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          <Card className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 border-green-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="w-6 h-6 text-green-400" />
                Como Funciona
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-white/80">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  1
                </div>
                <div>
                  <div className="font-semibold text-white">Coleta de Dados</div>
                  <div className="text-sm">Analisa milhares de jogos em tempo real</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  2
                </div>
                <div>
                  <div className="font-semibold text-white">Processamento IA</div>
                  <div className="text-sm">Algoritmos identificam padrões e tendências</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  3
                </div>
                <div>
                  <div className="font-semibold text-white">Insights Inteligentes</div>
                  <div className="text-sm">Fornece predições e recomendações precisas</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-blue-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Brain className="w-6 h-6 text-blue-400" />
                Tecnologias Utilizadas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-white/80">
              <div className="flex justify-between">
                <span>Machine Learning</span>
                <span className="text-blue-400 font-semibold">Neural Networks</span>
              </div>
              <div className="flex justify-between">
                <span>Análise Estatística</span>
                <span className="text-green-400 font-semibold">Tempo Real</span>
              </div>
              <div className="flex justify-between">
                <span>Detecção de Padrões</span>
                <span className="text-yellow-400 font-semibold">Algoritmos Avançados</span>
              </div>
              <div className="flex justify-between">
                <span>Cache Inteligente</span>
                <span className="text-purple-400 font-semibold">Redis</span>
              </div>
              <div className="flex justify-between">
                <span>Banco de Dados</span>
                <span className="text-pink-400 font-semibold">PostgreSQL</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
