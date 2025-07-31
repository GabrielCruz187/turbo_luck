"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bot, TrendingUp, AlertTriangle, Target, Brain, Zap, Activity, BarChart3, Eye, Clock } from "lucide-react"

interface TurboBotDashboardProps {
  gameType: string
  userId?: string
}

export default function TurboBotDashboard({ gameType, userId }: TurboBotDashboardProps) {
  const [analysis, setAnalysis] = useState<any>(null)
  const [alerts, setAlerts] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  useEffect(() => {
    loadTurboBotData()
    const interval = setInterval(loadTurboBotData, 30000) // Atualizar a cada 30s
    return () => clearInterval(interval)
  }, [gameType, userId])

  const loadTurboBotData = async () => {
    try {
      setLoading(true)

      // Carregar análise
      const analysisResponse = await fetch(`/api/turbo-bot/analyze?game=${gameType}&userId=${userId || ""}`)
      const analysisData = await analysisResponse.json()

      if (analysisData.success) {
        setAnalysis(analysisData.data)
      }

      // Carregar alertas se userId fornecido
      if (userId) {
        const alertsResponse = await fetch(`/api/turbo-bot/alerts?userId=${userId}`)
        const alertsData = await alertsResponse.json()

        if (alertsData.success) {
          setAlerts(alertsData.data.slice(0, 5)) // Últimos 5 alertas
        }
      }

      // Carregar estatísticas
      const statsResponse = await fetch(`/api/games/stats?game=${gameType}&hours=24`)
      const statsData = await statsResponse.json()

      if (statsData.success) {
        setStats(statsData.data)
      }

      setLastUpdate(new Date())
    } catch (error) {
      console.error("Erro ao carregar dados do TurboBot:", error)
    } finally {
      setLoading(false)
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 75) return "text-green-400"
    if (confidence >= 50) return "text-yellow-400"
    return "text-red-400"
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "high":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  if (loading && !analysis) {
    return (
      <Card className="bg-black/40 border-purple-500/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Bot className="w-8 h-8 text-purple-400 animate-spin mr-3" />
            <span className="text-white">TurboBot analisando...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <div>TurboBot IA - {gameType.charAt(0).toUpperCase() + gameType.slice(1)}</div>
              <div className="text-sm text-white/60 font-normal flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Última atualização: {lastUpdate.toLocaleTimeString("pt-BR")}
              </div>
            </div>
            <Button
              onClick={loadTurboBotData}
              disabled={loading}
              size="sm"
              className="ml-auto bg-purple-600 hover:bg-purple-700"
            >
              <Activity className="w-4 h-4 mr-2" />
              {loading ? "Atualizando..." : "Atualizar"}
            </Button>
          </CardTitle>
        </CardHeader>
      </Card>

      <Tabs defaultValue="analysis" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-black/40 border border-purple-500/20">
          <TabsTrigger value="analysis" className="data-[state=active]:bg-purple-500/20">
            <Brain className="w-4 h-4 mr-2" />
            Análise
          </TabsTrigger>
          <TabsTrigger value="predictions" className="data-[state=active]:bg-purple-500/20">
            <Target className="w-4 h-4 mr-2" />
            Predições
          </TabsTrigger>
          <TabsTrigger value="patterns" className="data-[state=active]:bg-purple-500/20">
            <TrendingUp className="w-4 h-4 mr-2" />
            Padrões
          </TabsTrigger>
          <TabsTrigger value="alerts" className="data-[state=active]:bg-purple-500/20">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Alertas
          </TabsTrigger>
        </TabsList>

        {/* Análise Geral */}
        <TabsContent value="analysis">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-black/40 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                  Estatísticas do Jogo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">{stats.win_rate}%</div>
                        <div className="text-sm text-white/60">Taxa de Vitória</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400">{stats.avg_multiplier}x</div>
                        <div className="text-sm text-white/60">Multiplicador Médio</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-yellow-400">{stats.total_games}</div>
                        <div className="text-sm text-white/60">Jogos (24h)</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-400">{stats.avg_bet}</div>
                        <div className="text-sm text-white/60">Aposta Média</div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-white/60">Carregando estatísticas...</div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Eye className="w-5 h-5 text-green-400" />
                  Insights do TurboBot
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analysis?.insights ? (
                  <div className="space-y-3">
                    {analysis.insights.map((insight: string, index: number) => (
                      <div key={index} className="flex items-start gap-2">
                        <Zap className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                        <span className="text-white/80 text-sm">{insight}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-white/60">Gerando insights...</div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Predições */}
        <TabsContent value="predictions">
          <div className="space-y-4">
            {analysis?.predictions?.map((prediction: any, index: number) => (
              <Card key={index} className="bg-black/40 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-green-400" />
                      Predição do TurboBot
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${getRiskColor(prediction.risk_level)} border`}>
                        {prediction.risk_level === "low"
                          ? "Baixo Risco"
                          : prediction.risk_level === "medium"
                            ? "Médio Risco"
                            : "Alto Risco"}
                      </Badge>
                      <Badge
                        className={`${getConfidenceColor(prediction.confidence)} bg-black/20 border border-current`}
                      >
                        {prediction.confidence}% confiança
                      </Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg p-4 border border-purple-500/20">
                    <div className="text-lg font-semibold text-white mb-2">Predição:</div>
                    <div className="text-xl text-green-400 font-bold">{prediction.prediction}</div>
                  </div>

                  <div>
                    <div className="text-sm font-semibold text-white mb-2">Recomendação:</div>
                    <div className="text-white/80">{prediction.recommendation}</div>
                  </div>

                  <div>
                    <div className="text-sm font-semibold text-white mb-2">Fatores Analisados:</div>
                    <div className="flex flex-wrap gap-2">
                      {prediction.factors.map((factor: string, i: number) => (
                        <Badge key={i} className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                          {factor.replace(/_/g, " ")}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Padrões */}
        <TabsContent value="patterns">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysis?.patterns?.map((pattern: any, index: number) => (
              <Card key={index} className="bg-black/40 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-orange-400" />
                      {pattern.pattern_type.replace(/_/g, " ").toUpperCase()}
                    </div>
                    <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                      {(pattern.probability * 100).toFixed(1)}%
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-white/80 text-sm">{pattern.description}</div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Frequência:</span>
                    <span className="text-yellow-400 font-semibold">{pattern.frequency}x</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Última ocorrência:</span>
                    <span className="text-blue-400">
                      {new Date(pattern.last_occurrence).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Alertas */}
        <TabsContent value="alerts">
          <div className="space-y-4">
            {alerts.length > 0 ? (
              alerts.map((alert: any, index: number) => (
                <Card key={index} className="bg-black/40 border-yellow-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                            {alert.alert_type.replace(/_/g, " ").toUpperCase()}
                          </Badge>
                          <span className="text-white/60 text-sm">
                            {new Date(alert.created_at).toLocaleString("pt-BR")}
                          </span>
                        </div>
                        <div className="text-white">{alert.message}</div>
                        {alert.game_type !== "general" && (
                          <div className="text-white/60 text-sm mt-1">Jogo: {alert.game_type}</div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="bg-black/40 border-purple-500/20">
                <CardContent className="p-8 text-center">
                  <AlertTriangle className="w-12 h-12 text-white/40 mx-auto mb-4" />
                  <div className="text-white/60">Nenhum alerta no momento</div>
                  <div className="text-white/40 text-sm mt-2">
                    O TurboBot está monitorando e enviará alertas quando detectar oportunidades
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
