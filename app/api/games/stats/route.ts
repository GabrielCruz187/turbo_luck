import { type NextRequest, NextResponse } from "next/server"
import { Database } from "@/lib/database"
import { CacheService } from "@/lib/redis"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const gameType = searchParams.get("game")
    const hours = Number.parseInt(searchParams.get("hours") || "24")

    if (!gameType) {
      return NextResponse.json({ error: "Game type is required" }, { status: 400 })
    }

    // Verificar cache primeiro
    const cacheKey = `game_stats:${gameType}:${hours}`
    const cachedStats = await CacheService.get(cacheKey)

    if (cachedStats) {
      return NextResponse.json({
        success: true,
        data: cachedStats,
        cached: true,
      })
    }

    const stats = await Database.getGameAnalytics(gameType, hours)

    // Calcular estatísticas adicionais
    const winRate = stats.total_games > 0 ? ((stats.wins / stats.total_games) * 100).toFixed(1) : "0.0"

    const enhancedStats = {
      ...stats,
      win_rate: Number.parseFloat(winRate),
      loss_rate: Number.parseFloat((100 - Number.parseFloat(winRate)).toFixed(1)),
      avg_multiplier: Number.parseFloat(stats.avg_multiplier || 0).toFixed(2),
      max_multiplier: Number.parseFloat(stats.max_multiplier || 0).toFixed(2),
      min_multiplier: Number.parseFloat(stats.min_multiplier || 0).toFixed(2),
      avg_bet: Number.parseFloat(stats.avg_bet || 0).toFixed(0),
    }

    // Cache por 2 minutos
    await CacheService.set(cacheKey, enhancedStats, 120)

    return NextResponse.json({
      success: true,
      data: enhancedStats,
      cached: false,
    })
  } catch (error) {
    console.error("Game stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
