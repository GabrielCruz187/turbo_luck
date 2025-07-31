"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Database, Loader2, Play, Eye } from "lucide-react"

export default function SetupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [setupResult, setSetupResult] = useState<any>(null)
  const [dbStatus, setDbStatus] = useState<any>(null)

  const checkDatabaseStatus = async () => {
    try {
      const response = await fetch("/api/setup-database", { method: "GET" })
      const data = await response.json()
      setDbStatus(data)
    } catch (error) {
      console.error("Erro ao verificar status:", error)
    }
  }

  const setupDatabase = async () => {
    setIsLoading(true)
    setSetupResult(null)

    try {
      const response = await fetch("/api/setup-database", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()
      setSetupResult(data)

      // Atualizar status após setup
      if (data.success) {
        await checkDatabaseStatus()
      }
    } catch (error) {
      setSetupResult({
        success: false,
        error: "Erro de conexão",
        details: error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">🚀 Setup do TurboLuck</h1>
          <p className="text-white/80 text-lg">Configure o banco de dados e inicialize o TurboBot IA</p>
        </div>

        {/* Status do Banco */}
        <Card className="mb-6 bg-black/40 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Database className="w-6 h-6 text-blue-400" />
              Status do Banco de Dados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button
                onClick={checkDatabaseStatus}
                variant="outline"
                className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 bg-transparent"
              >
                <Eye className="w-4 h-4 mr-2" />
                Verificar Status
              </Button>
            </div>

            {dbStatus && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {dbStatus.database_configured ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400" />
                  )}
                  <span className="text-white">
                    Banco de dados {dbStatus.database_configured ? "configurado" : "não configurado"}
                  </span>
                </div>

                {dbStatus.existing_tables && dbStatus.existing_tables.length > 0 && (
                  <div>
                    <div className="text-white/80 text-sm mb-2">Tabelas existentes:</div>
                    <div className="flex flex-wrap gap-2">
                      {dbStatus.existing_tables.map((table: string) => (
                        <Badge key={table} className="bg-green-500/20 text-green-400 border-green-500/30">
                          {table}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {dbStatus.missing_tables && dbStatus.missing_tables.length > 0 && (
                  <div>
                    <div className="text-white/80 text-sm mb-2">Tabelas faltando:</div>
                    <div className="flex flex-wrap gap-2">
                      {dbStatus.missing_tables.map((table: string) => (
                        <Badge key={table} className="bg-red-500/20 text-red-400 border-red-500/30">
                          {table}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Setup do Banco */}
        <Card className="mb-6 bg-black/40 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Play className="w-6 h-6 text-green-400" />
              Configurar Banco de Dados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <h3 className="text-blue-400 font-semibold mb-2">O que será criado:</h3>
              <ul className="text-white/80 text-sm space-y-1">
                <li>• Tabelas: users, game_history, turbo_analysis, game_patterns, turbo_alerts</li>
                <li>• Índices para otimização de performance</li>
                <li>• 500 registros de exemplo para análise</li>
                <li>• Padrões iniciais do TurboBot</li>
                <li>• Análises pré-configuradas</li>
              </ul>
            </div>

            <Button
              onClick={setupDatabase}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-lg py-3"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Configurando banco...
                </>
              ) : (
                <>
                  <Database className="w-5 h-5 mr-2" />
                  Executar Setup Completo
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Resultado do Setup */}
        {setupResult && (
          <Card className={`mb-6 bg-black/40 ${setupResult.success ? "border-green-500/20" : "border-red-500/20"}`}>
            <CardHeader>
              <CardTitle
                className={`flex items-center gap-2 ${setupResult.success ? "text-green-400" : "text-red-400"}`}
              >
                {setupResult.success ? <CheckCircle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                {setupResult.success ? "Setup Concluído!" : "Erro no Setup"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className={`text-lg font-semibold ${setupResult.success ? "text-green-400" : "text-red-400"}`}>
                  {setupResult.message}
                </div>

                {setupResult.success && setupResult.details && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                    <h4 className="text-green-400 font-semibold mb-2">Detalhes:</h4>
                    <div className="text-white/80 text-sm space-y-1">
                      <div>📋 Tabelas criadas: {setupResult.details.tables_created?.join(", ")}</div>
                      <div>📊 Índices criados: {setupResult.details.indexes_created}</div>
                      <div>🌱 Dados de exemplo: {setupResult.details.sample_data}</div>
                    </div>
                  </div>
                )}

                {!setupResult.success && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <h4 className="text-red-400 font-semibold mb-2">Erro:</h4>
                    <div className="text-white/80 text-sm">{setupResult.details || setupResult.error}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Próximos Passos */}
        {setupResult?.success && (
          <Card className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">🎉 Próximos Passos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-white/80">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Banco de dados configurado</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>TurboBot IA inicializado</span>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Dados de exemplo inseridos</span>
                </div>

                <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                  <div className="text-purple-400 font-semibold mb-1">Agora você pode:</div>
                  <div className="text-sm space-y-1">
                    <div>• Configurar as variáveis de ambiente do Redis (Upstash)</div>
                    <div>• Testar os jogos com TurboBot integrado</div>
                    <div>• Acessar as análises em tempo real</div>
                    <div>• Explorar os padrões detectados</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
