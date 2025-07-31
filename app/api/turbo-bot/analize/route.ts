import { type NextRequest, NextResponse } from "next/server"
import { TurboBot } from "@/lib/turbo-bot"
import { CacheService } from "@/lib/redis"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const gameType = searchParams.get("game")
    const userId = searchParams.get("userId")

    if (!gameType) {
      return NextResponse.json({ error: "Game type is required" }, { status: 400 })
    }

    // Se não tiver Redis configurado, pular rate limiting
    let canProceed = true
    try {
      const clientIP = request.headers.get("x-forwarded-for") || "unknown"
      canProceed = await CacheService.checkRateLimit(`analyze:${clientIP}`, 10, 60)
    } catch (error) {
      console.log("Redis não configurado, pulando rate limiting")
    }

    if (!canProceed) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
    }

    const analysis = await TurboBot.analyzeGame(gameType, userId || undefined)

    return NextResponse.json({
      success: true,
      data: analysis,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("TurboBot analysis error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { gameType, gameData, userId } = body

    if (!gameType || !gameData) {
      return NextResponse.json({ error: "Game type and data are required" }, { status: 400 })
    }

    // Análise em tempo real
    await TurboBot.realTimeAnalysis(gameType, gameData)

    // Gerar alertas se userId fornecido
    if (userId) {
      await TurboBot.generateAlerts(userId)
    }

    return NextResponse.json({
      success: true,
      message: "Real-time analysis completed",
    })
  } catch (error) {
    console.error("Real-time analysis error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
