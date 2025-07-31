import { NextResponse } from "next/server"
import { Database } from "@/lib/database"
import { CacheService } from "@/lib/redis"

export async function GET() {
  try {
    const startTime = Date.now()

    // Verificar conexão com banco de dados
    let dbStatus = "ok"
    let dbLatency = 0
    try {
      const dbStart = Date.now()
      await Database.sql`SELECT 1`
      dbLatency = Date.now() - dbStart
    } catch (error) {
      dbStatus = "error"
      console.error("Database health check failed:", error)
    }

    // Verificar conexão com Redis
    let redisStatus = "ok"
    let redisLatency = 0
    try {
      const redisStart = Date.now()
      await CacheService.set("health_check", "ok", 10)
      await CacheService.get("health_check")
      redisLatency = Date.now() - redisStart
    } catch (error) {
      redisStatus = "error"
      console.error("Redis health check failed:", error)
    }

    const totalLatency = Date.now() - startTime
    const overallStatus = dbStatus === "ok" && redisStatus === "ok" ? "healthy" : "unhealthy"

    return NextResponse.json(
      {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        services: {
          database: {
            status: dbStatus,
            latency: `${dbLatency}ms`,
          },
          redis: {
            status: redisStatus,
            latency: `${redisLatency}ms`,
          },
        },
        response_time: `${totalLatency}ms`,
        version: "1.0.0",
      },
      {
        status: overallStatus === "healthy" ? 200 : 503,
      },
    )
  } catch (error) {
    console.error("Health check error:", error)
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        error: "Health check failed",
      },
      {
        status: 500,
      },
    )
  }
}
