"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"
import { useGame } from "@/contexts/game-context"
import { Trophy, History, Settings, Star, TrendingUp, Calendar, Gamepad2, LogOut, Edit } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
  const { user, logout, updateProfile, gameHistory } = useAuth()
  const { balance } = useGame()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [editUsername, setEditUsername] = useState(user?.username || "")

  if (!user) {
    router.push("/auth/login")
    return null
  }

  const handleSaveProfile = () => {
    updateProfile({ username: editUsername })
    setIsEditing(false)
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const totalGames = user.totalWins + user.totalLosses
  const winRate = totalGames > 0 ? ((user.totalWins / totalGames) * 100).toFixed(1) : "0"
  const xpToNextLevel = 1000 - (user.xp % 1000)
  const xpProgress = (user.xp % 1000) / 1000

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            onClick={() => router.push("/games")}
            variant="outline"
            className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10 bg-transparent"
          >
            ← Voltar aos Jogos
          </Button>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-red-500/30 text-red-400 hover:bg-red-500/10 bg-transparent"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>

        {/* Profile Header */}
        <Card className="mb-8 bg-black/40 border-purple-500/20">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-purple-500">
                <img src={user.avatar || "/placeholder.svg"} alt="Avatar" className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editUsername}
                        onChange={(e) => setEditUsername(e.target.value)}
                        className="bg-black/20 border-purple-500/30 text-white w-48"
                      />
                      <Button onClick={handleSaveProfile} size="sm" className="bg-green-600 hover:bg-green-700">
                        Salvar
                      </Button>
                      <Button
                        onClick={() => setIsEditing(false)}
                        size="sm"
                        variant="outline"
                        className="border-gray-500/30 text-gray-400 hover:bg-gray-500/10 bg-transparent"
                      >
                        Cancelar
                      </Button>
                    </div>
                  ) : (
                    <>
                      <h1 className="text-3xl font-bold text-white">{user.username}</h1>
                      <Button
                        onClick={() => setIsEditing(true)}
                        size="sm"
                        variant="ghost"
                        className="text-purple-400 hover:text-purple-300"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
                <p className="text-white/60 mb-4">{user.email}</p>

                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <div className="flex items-center gap-2 bg-purple-500/20 px-3 py-1 rounded-full">
                    <Star className="w-4 h-4 text-purple-400" />
                    <span className="text-white font-semibold">Nível {user.level}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-green-500/20 px-3 py-1 rounded-full">
                    <Trophy className="w-4 h-4 text-green-400" />
                    <span className="text-white font-semibold">{user.totalWins} Vitórias</span>
                  </div>
                  <div className="flex items-center gap-2 bg-blue-500/20 px-3 py-1 rounded-full">
                    <Gamepad2 className="w-4 h-4 text-blue-400" />
                    <span className="text-white font-semibold">{balance} Pontos</span>
                  </div>
                </div>

                {/* XP Progress */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-white/60 mb-1">
                    <span>XP: {user.xp}</span>
                    <span>{xpToNextLevel} XP para próximo nível</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${xpProgress * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="stats" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-black/40 border border-purple-500/20">
            <TabsTrigger value="stats" className="data-[state=active]:bg-purple-500/20">
              <TrendingUp className="w-4 h-4 mr-2" />
              Estatísticas
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-purple-500/20">
              <History className="w-4 h-4 mr-2" />
              Histórico
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-purple-500/20">
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </TabsTrigger>
          </TabsList>

          {/* Statistics Tab */}
          <TabsContent value="stats">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-black/40 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-white/80">Total de Jogos:</span>
                    <span className="text-white font-semibold">{totalGames}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/80">Vitórias:</span>
                    <span className="text-green-400 font-semibold">{user.totalWins}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/80">Derrotas:</span>
                    <span className="text-red-400 font-semibold">{user.totalLosses}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/80">Taxa de Vitória:</span>
                    <span className="text-blue-400 font-semibold">{winRate}%</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/40 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Star className="w-5 h-5 text-purple-400" />
                    Progressão
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-white/80">Nível Atual:</span>
                    <span className="text-purple-400 font-semibold">{user.level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/80">XP Total:</span>
                    <span className="text-yellow-400 font-semibold">{user.xp}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/80">Próximo Nível:</span>
                    <span className="text-cyan-400 font-semibold">{xpToNextLevel} XP</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/80">Jogo Favorito:</span>
                    <span className="text-pink-400 font-semibold">{user.favoriteGame}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/40 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-green-400" />
                    Informações
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-white/80">Membro desde:</span>
                    <span className="text-green-400 font-semibold">
                      {new Date(user.joinDate).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/80">Saldo Atual:</span>
                    <span className="text-blue-400 font-semibold">{balance} pontos</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/80">Status:</span>
                    <span className="text-green-400 font-semibold">Ativo</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card className="bg-black/40 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">Histórico de Jogos</CardTitle>
              </CardHeader>
              <CardContent>
                {gameHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <Gamepad2 className="w-12 h-12 text-white/40 mx-auto mb-4" />
                    <p className="text-white/60">Nenhum jogo registrado ainda</p>
                    <p className="text-white/40 text-sm">Comece a jogar para ver seu histórico aqui!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {gameHistory.slice(0, 20).map((game) => (
                      <div
                        key={game.id}
                        className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-purple-500/10"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                            <Gamepad2 className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="text-white font-semibold">{game.game}</div>
                            <div className="text-white/60 text-sm">
                              {new Date(game.timestamp).toLocaleString("pt-BR")}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white/80 text-sm">Aposta: {game.bet} pts</div>
                          <div
                            className={`font-semibold ${game.result > game.bet ? "text-green-400" : "text-red-400"}`}
                          >
                            {game.result > game.bet ? "+" : ""}
                            {game.result - game.bet} pts
                          </div>
                          <div className="text-white/60 text-xs">{game.multiplier.toFixed(2)}x</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-black/40 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Informações da Conta</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-white">Email</Label>
                    <Input value={user.email} disabled className="bg-black/20 border-purple-500/30 text-white/60" />
                  </div>
                  <div>
                    <Label className="text-white">Nome de usuário</Label>
                    <Input value={user.username} disabled className="bg-black/20 border-purple-500/30 text-white/60" />
                  </div>
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar Perfil
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-black/40 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Preferências</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white">Notificações</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-green-500/30 text-green-400 hover:bg-green-500/10 bg-transparent"
                    >
                      Ativado
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white">Som</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-green-500/30 text-green-400 hover:bg-green-500/10 bg-transparent"
                    >
                      Ativado
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white">Tema</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10 bg-transparent"
                    >
                      Escuro
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
