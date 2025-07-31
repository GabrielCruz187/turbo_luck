"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, TrendingUp, Play, Bot, BarChart3, Target, Gift } from "lucide-react"

export default function TurboLuckLanding() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const games = [
    {
      name: "Aviãozinho",
      description: "Crash Game com multiplicadores até 1000x",
      icon: "✈️",
      color: "from-purple-500 to-pink-500",
    },
    {
      name: "Mines",
      description: "Campo minado estratégico",
      icon: "💎",
      color: "from-green-500 to-emerald-500",
    },
    {
      name: "Roleta",
      description: "Roleta clássica com prêmios incríveis",
      icon: "🎰",
      color: "from-red-500 to-orange-500",
    },
    {
      name: "Plinko",
      description: "Deixe a sorte decidir seu destino",
      icon: "🎯",
      color: "from-blue-500 to-cyan-500",
    },
    {
      name: "Dice",
      description: "Dados com controle total",
      icon: "🎲",
      color: "from-yellow-500 to-orange-500",
    },
    {
      name: "Slots",
      description: "Caça-níqueis com jackpots progressivos",
      icon: "🍒",
      color: "from-purple-500 to-blue-500",
    },
  ]

  const features = [
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Análise em Tempo Real",
      description: "Monitora resultados e padrões instantaneamente",
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Dicas Inteligentes",
      description: "Sugestões baseadas em estatísticas avançadas",
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Alertas de Oportunidade",
      description: "Notificações quando detecta melhores chances",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-black/20 backdrop-blur-md border-b border-purple-500/20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">TurboLuck</span>
          </div>
          <nav className="hidden md:flex space-x-6">
            <a href="#games" className="text-white/80 hover:text-white transition-colors">
              Jogos
            </a>
            <a href="#turbobot" className="text-white/80 hover:text-white transition-colors">
              TurboBot
            </a>
            <a href="#about" className="text-white/80 hover:text-white transition-colors">
              Sobre
            </a>
          </nav>
          <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
            Entrar
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4">
        <div className="container mx-auto text-center">
          <div
            className={`transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            <Badge className="mb-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 px-4 py-2">
              <Bot className="w-4 h-4 mr-2" />
              Powered by TurboBot AI
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Jogue com
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {" "}
                Inteligência
              </span>
              <br />
              Vença com o
              <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                {" "}
                TurboBot
              </span>
            </h1>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              A primeira plataforma de jogos com IA integrada que analisa padrões em tempo real e oferece insights
              inteligentes para maximizar suas chances.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-lg px-8 py-4"
              >
                <Play className="w-5 h-5 mr-2" />
                Comece a jogar agora
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-purple-500 text-purple-400 hover:bg-purple-500/10 text-lg px-8 py-4 bg-transparent"
              >
                <Gift className="w-5 h-5 mr-2" />
                Ganhe R$20 grátis
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Games Section */}
      <section id="games" className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Jogos Populares</h2>
            <p className="text-white/80 text-lg">Experimente os jogos mais emocionantes com a ajuda do TurboBot</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game, index) => (
              <Card
                key={index}
                className="bg-black/40 border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:scale-105 group"
              >
                <CardContent className="p-6">
                  <div
                    className={`w-16 h-16 bg-gradient-to-r ${game.color} rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}
                  >
                    {game.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{game.name}</h3>
                  <p className="text-white/70 mb-4">{game.description}</p>
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                    Jogar Agora
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* TurboBot Section */}
      <section id="turbobot" className="py-16 px-4 bg-gradient-to-r from-purple-900/50 to-blue-900/50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 px-4 py-2">
              <Bot className="w-4 h-4 mr-2" />
              Inteligência Artificial
            </Badge>
            <h2 className="text-4xl font-bold text-white mb-4">Conheça o TurboBot</h2>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">
              Nosso bot inteligente revoluciona a forma como você joga, oferecendo análises em tempo real e insights
              baseados em dados.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-4 p-4 rounded-lg bg-black/20 border border-purple-500/20"
                >
                  <div className="text-purple-400 flex-shrink-0">{feature.icon}</div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-white/70">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative">
              <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl p-8 border border-purple-500/30">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Bot className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">TurboBot em Ação</h3>
                  <div className="space-y-3 text-left">
                    <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3">
                      <p className="text-green-400 text-sm">🎯 Oportunidade detectada no Aviãozinho</p>
                      <p className="text-white/80 text-xs">Multiplicador médio: 2.4x nos últimos 10 rounds</p>
                    </div>
                    <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3">
                      <p className="text-blue-400 text-sm">📊 Análise de padrões atualizada</p>
                      <p className="text-white/80 text-xs">Mines: 73% de sucesso em campos 3x3</p>
                    </div>
                    <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-3">
                      <p className="text-purple-400 text-sm">⚡ Dica inteligente disponível</p>
                      <p className="text-white/80 text-xs">Roleta: Aposte em vermelho (streak de 4)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">50K+</div>
              <div className="text-white/80">Jogadores Ativos</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-400 mb-2">R$ 2M+</div>
              <div className="text-white/80">Prêmios Pagos</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-400 mb-2">98%</div>
              <div className="text-white/80">Satisfação</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-pink-400 mb-2">24/7</div>
              <div className="text-white/80">Suporte Online</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-green-900/50 to-emerald-900/50">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Pronto para começar sua jornada?</h2>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
            Cadastre-se agora e ganhe R$20 para testar todos os recursos do TurboBot gratuitamente.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-lg px-8 py-4"
            >
              <Gift className="w-5 h-5 mr-2" />
              Cadastre-se e ganhe R$20
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 text-lg px-8 py-4 bg-transparent"
            >
              Saiba mais sobre o TurboBot
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-black/40 border-t border-purple-500/20">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">TurboLuck</span>
              </div>
              <p className="text-white/70">A plataforma de jogos mais inteligente do Brasil.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Jogos</h4>
              <ul className="space-y-2 text-white/70">
                <li>Aviãozinho</li>
                <li>Mines</li>
                <li>Roleta</li>
                <li>Plinko</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-white/70">
                <li>Central de Ajuda</li>
                <li>Chat ao Vivo</li>
                <li>FAQ</li>
                <li>Contato</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-white/70">
                <li>Termos de Uso</li>
                <li>Privacidade</li>
                <li>Jogo Responsável</li>
                <li>Licenças</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-purple-500/20 mt-8 pt-8 text-center text-white/70">
            <p>&copy; 2024 TurboLuck. Todos os direitos reservados.</p>
            <p className="text-sm mt-2">Jogue com responsabilidade. +18 anos.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
