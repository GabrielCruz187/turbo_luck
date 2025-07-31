"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  email: string
  username: string
  level: number
  xp: number
  totalWins: number
  totalLosses: number
  favoriteGame: string
  joinDate: string
  avatar: string
}

interface GameHistory {
  id: string
  game: string
  bet: number
  result: number
  multiplier: number
  timestamp: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, username: string, password: string) => Promise<boolean>
  logout: () => void
  updateProfile: (updates: Partial<User>) => void
  addGameHistory: (game: string, bet: number, result: number, multiplier: number) => void
  gameHistory: GameHistory[]
  addXP: (amount: number) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [gameHistory, setGameHistory] = useState<GameHistory[]>([])

  // Simular dados do localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("turboluck_user")
    const savedHistory = localStorage.getItem("turboluck_history")

    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    if (savedHistory) {
      setGameHistory(JSON.parse(savedHistory))
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simular autenticação
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Verificar se usuário existe no localStorage
    const users = JSON.parse(localStorage.getItem("turboluck_users") || "[]")
    const foundUser = users.find((u: any) => u.email === email && u.password === password)

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser
      setUser(userWithoutPassword)
      localStorage.setItem("turboluck_user", JSON.stringify(userWithoutPassword))
      return true
    }

    return false
  }

  const register = async (email: string, username: string, password: string): Promise<boolean> => {
    // Simular registro
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const users = JSON.parse(localStorage.getItem("turboluck_users") || "[]")

    // Verificar se email já existe
    if (users.some((u: any) => u.email === email)) {
      return false
    }

    const newUser: User & { password: string } = {
      id: Date.now().toString(),
      email,
      username,
      password,
      level: 1,
      xp: 0,
      totalWins: 0,
      totalLosses: 0,
      favoriteGame: "Aviãozinho",
      joinDate: new Date().toISOString(),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
    }

    users.push(newUser)
    localStorage.setItem("turboluck_users", JSON.stringify(users))

    const { password: _, ...userWithoutPassword } = newUser
    setUser(userWithoutPassword)
    localStorage.setItem("turboluck_user", JSON.stringify(userWithoutPassword))

    return true
  }

  const logout = () => {
    setUser(null)
    setGameHistory([])
    localStorage.removeItem("turboluck_user")
    localStorage.removeItem("turboluck_history")
  }

  const updateProfile = (updates: Partial<User>) => {
    if (!user) return

    const updatedUser = { ...user, ...updates }
    setUser(updatedUser)
    localStorage.setItem("turboluck_user", JSON.stringify(updatedUser))

    // Atualizar também na lista de usuários
    const users = JSON.parse(localStorage.getItem("turboluck_users") || "[]")
    const userIndex = users.findIndex((u: any) => u.id === user.id)
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updates }
      localStorage.setItem("turboluck_users", JSON.stringify(users))
    }
  }

  const addGameHistory = (game: string, bet: number, result: number, multiplier: number) => {
    const newHistory: GameHistory = {
      id: Date.now().toString(),
      game,
      bet,
      result,
      multiplier,
      timestamp: new Date().toISOString(),
    }

    const updatedHistory = [newHistory, ...gameHistory.slice(0, 49)] // Manter apenas 50 registros
    setGameHistory(updatedHistory)
    localStorage.setItem("turboluck_history", JSON.stringify(updatedHistory))

    // Atualizar estatísticas do usuário
    if (user) {
      const isWin = result > bet
      updateProfile({
        totalWins: isWin ? user.totalWins + 1 : user.totalWins,
        totalLosses: !isWin ? user.totalLosses + 1 : user.totalLosses,
        favoriteGame: game,
      })

      // Adicionar XP baseado no resultado
      const xpGain = isWin ? Math.floor(result * 0.1) : Math.floor(bet * 0.05)
      addXP(xpGain)
    }
  }

  const addXP = (amount: number) => {
    if (!user) return

    const newXP = user.xp + amount
    const newLevel = Math.floor(newXP / 1000) + 1 // 1000 XP por nível

    updateProfile({
      xp: newXP,
      level: newLevel,
    })
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
        addGameHistory,
        gameHistory,
        addXP,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
