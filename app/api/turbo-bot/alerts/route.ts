import { type NextRequest, NextResponse } from "next/server"
import { Database } from "@/lib/database"
import { TurboBot } from "@/lib/turbo-bot"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId || userId === "user-id") {
      // Retornar alertas de exemplo se não tiver userId válido
      return NextResponse.json({
        success: true,
        data: [
          {
            id: "1",
            alert_type: "opportunity",
            game_type: "aviator",
            message: "🎯 Oportunidade detectada! Multiplicadores baixos recentes sugerem reversão.",
            created_at: new Date().toISOString(),
            is_read: false,
          },
          {
            id: "2",
            alert_type: "pattern_detected",
            game_type: "mines",
            message: "📊 Padrão de zonas seguras identificado com 73% de sucesso.",
            created_at: new Date(Date.now() - 300000).toISOString(),
            is_read: false,
          },
        ],
      })
    }

    const alerts = await Database.getUserAlerts(userId)

    return NextResponse.json({
      success: true,
      data: alerts,
    })
  } catch (error) {
    console.error("Get alerts error:", error)
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
    const { userId } = body

    if (!userId || userId === "user-id") {
      return NextResponse.json({
        success: true,
        message: "Demo mode - alerts not generated for demo user",
      })
    }

    await TurboBot.generateAlerts(userId)

    return NextResponse.json({
      success: true,
      message: "Alerts generated successfully",
    })
  } catch (error) {
    console.error("Generate alerts error:", error)
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
