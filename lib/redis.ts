import { Redis } from "@upstash/redis"

if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
  throw new Error("Redis environment variables are required")
}

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
})

export class CacheService {
  static async get<T>(key: string): Promise<T | null> {
    try {
      const result = await redis.get(key)
      return result as T
    } catch (error) {
      console.error("Redis get error:", error)
      return null
    }
  }

  static async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      if (ttl) {
        await redis.setex(key, ttl, JSON.stringify(value))
      } else {
        await redis.set(key, JSON.stringify(value))
      }
    } catch (error) {
      console.error("Redis set error:", error)
    }
  }

  static async del(key: string): Promise<void> {
    try {
      await redis.del(key)
    } catch (error) {
      console.error("Redis del error:", error)
    }
  }

  static async exists(key: string): Promise<boolean> {
    try {
      const result = await redis.exists(key)
      return result === 1
    } catch (error) {
      console.error("Redis exists error:", error)
      return false
    }
  }

  static async incr(key: string): Promise<number> {
    try {
      return await redis.incr(key)
    } catch (error) {
      console.error("Redis incr error:", error)
      return 0
    }
  }

  static async expire(key: string, seconds: number): Promise<void> {
    try {
      await redis.expire(key, seconds)
    } catch (error) {
      console.error("Redis expire error:", error)
    }
  }

  // Cache específico para análises do TurboBot
  static async cacheAnalysis(gameType: string, analysis: any, ttl = 300): Promise<void> {
    const key = `turbo_analysis:${gameType}`
    await this.set(key, analysis, ttl)
  }

  static async getCachedAnalysis(gameType: string): Promise<any> {
    const key = `turbo_analysis:${gameType}`
    return await this.get(key)
  }

  // Cache para padrões de jogo
  static async cacheGamePatterns(gameType: string, patterns: any, ttl = 600): Promise<void> {
    const key = `game_patterns:${gameType}`
    await this.set(key, patterns, ttl)
  }

  static async getCachedGamePatterns(gameType: string): Promise<any> {
    const key = `game_patterns:${gameType}`
    return await this.get(key)
  }

  // Cache para estatísticas em tempo real
  static async cacheGameStats(gameType: string, stats: any, ttl = 60): Promise<void> {
    const key = `game_stats:${gameType}`
    await this.set(key, stats, ttl)
  }

  static async getCachedGameStats(gameType: string): Promise<any> {
    const key = `game_stats:${gameType}`
    return await this.get(key)
  }

  // Sistema de rate limiting
  static async checkRateLimit(identifier: string, limit: number, window: number): Promise<boolean> {
    const key = `rate_limit:${identifier}`
    const current = await this.incr(key)

    if (current === 1) {
      await this.expire(key, window)
    }

    return current <= limit
  }
}

export { redis }
