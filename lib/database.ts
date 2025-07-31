import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required")
}

const sql = neon(process.env.DATABASE_URL)

export interface User {
  id: string
  email: string
  username: string
  level: number
  xp: number
  total_wins: number
  total_losses: number
  favorite_game: string
  avatar?: string
  balance: number
  created_at: string
  updated_at: string
}

export interface GameHistory {
  id: string
  user_id: string
  game_type: string
  bet_amount: number
  result_amount: number
  multiplier: number
  game_data: any
  created_at: string
}

export interface TurboAnalysis {
  id: string
  game_type: string
  analysis_type: string
  data: any
  confidence_score: number
  created_at: string
}

export interface GamePattern {
  id: string
  game_type: string
  pattern_type: string
  pattern_data: any
  frequency: number
  last_seen: string
  created_at: string
}

export interface TurboAlert {
  id: string
  user_id: string
  alert_type: string
  game_type: string
  message: string
  data?: any
  is_read: boolean
  created_at: string
}

export class Database {
  static async getUser(email: string): Promise<User | null> {
    const result = await sql`
      SELECT * FROM users WHERE email = ${email} LIMIT 1
    `
    return result[0] || null
  }

  static async createUser(userData: Omit<User, "id" | "created_at" | "updated_at">): Promise<User> {
    const result = await sql`
      INSERT INTO users (email, username, password_hash, level, xp, total_wins, total_losses, favorite_game, avatar, balance)
      VALUES (${userData.email}, ${userData.username}, ${userData.password_hash}, ${userData.level}, ${userData.xp}, 
              ${userData.total_wins}, ${userData.total_losses}, ${userData.favorite_game}, ${userData.avatar}, ${userData.balance})
      RETURNING *
    `
    return result[0]
  }

  static async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const setClause = Object.keys(updates)
      .map((key) => `${key} = $${Object.keys(updates).indexOf(key) + 2}`)
      .join(", ")

    const values = [id, ...Object.values(updates)]

    const result = await sql`
      UPDATE users SET ${sql.unsafe(setClause)}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `
    return result[0]
  }

  static async addGameHistory(historyData: Omit<GameHistory, "id" | "created_at">): Promise<GameHistory> {
    const result = await sql`
      INSERT INTO game_history (user_id, game_type, bet_amount, result_amount, multiplier, game_data)
      VALUES (${historyData.user_id}, ${historyData.game_type}, ${historyData.bet_amount}, 
              ${historyData.result_amount}, ${historyData.multiplier}, ${JSON.stringify(historyData.game_data)})
      RETURNING *
    `
    return result[0]
  }

  static async getGameHistory(userId: string, limit = 50): Promise<GameHistory[]> {
    const result = await sql`
      SELECT * FROM game_history 
      WHERE user_id = ${userId} 
      ORDER BY created_at DESC 
      LIMIT ${limit}
    `
    return result
  }

  static async getGameAnalytics(gameType: string, hours = 24): Promise<any> {
    const result = await sql`
      SELECT 
        COUNT(*) as total_games,
        AVG(multiplier) as avg_multiplier,
        MAX(multiplier) as max_multiplier,
        MIN(multiplier) as min_multiplier,
        AVG(bet_amount) as avg_bet,
        SUM(CASE WHEN result_amount > bet_amount THEN 1 ELSE 0 END) as wins,
        SUM(CASE WHEN result_amount <= bet_amount THEN 1 ELSE 0 END) as losses
      FROM game_history 
      WHERE game_type = ${gameType} 
      AND created_at >= NOW() - INTERVAL '${hours} hours'
    `
    return result[0]
  }

  static async getTurboAnalysis(gameType: string): Promise<TurboAnalysis[]> {
    const result = await sql`
      SELECT * FROM turbo_analysis 
      WHERE game_type = ${gameType} 
      ORDER BY created_at DESC 
      LIMIT 10
    `
    return result
  }

  static async saveTurboAnalysis(analysisData: Omit<TurboAnalysis, "id" | "created_at">): Promise<TurboAnalysis> {
    const result = await sql`
      INSERT INTO turbo_analysis (game_type, analysis_type, data, confidence_score)
      VALUES (${analysisData.game_type}, ${analysisData.analysis_type}, 
              ${JSON.stringify(analysisData.data)}, ${analysisData.confidence_score})
      RETURNING *
    `
    return result[0]
  }

  static async getGamePatterns(gameType: string): Promise<GamePattern[]> {
    const result = await sql`
      SELECT * FROM game_patterns 
      WHERE game_type = ${gameType} 
      ORDER BY frequency DESC
    `
    return result
  }

  static async updateGamePattern(gameType: string, patternType: string, patternData: any): Promise<void> {
    await sql`
      INSERT INTO game_patterns (game_type, pattern_type, pattern_data, frequency, last_seen)
      VALUES (${gameType}, ${patternType}, ${JSON.stringify(patternData)}, 1, CURRENT_TIMESTAMP)
      ON CONFLICT (game_type, pattern_type) 
      DO UPDATE SET 
        frequency = game_patterns.frequency + 1,
        last_seen = CURRENT_TIMESTAMP,
        pattern_data = ${JSON.stringify(patternData)}
    `
  }

  static async getUserAlerts(userId: string): Promise<TurboAlert[]> {
    const result = await sql`
      SELECT * FROM turbo_alerts 
      WHERE user_id = ${userId} 
      ORDER BY created_at DESC 
      LIMIT 20
    `
    return result
  }

  static async createAlert(alertData: Omit<TurboAlert, "id" | "created_at">): Promise<TurboAlert> {
    const result = await sql`
      INSERT INTO turbo_alerts (user_id, alert_type, game_type, message, data, is_read)
      VALUES (${alertData.user_id}, ${alertData.alert_type}, ${alertData.game_type}, 
              ${alertData.message}, ${JSON.stringify(alertData.data)}, ${alertData.is_read})
      RETURNING *
    `
    return result[0]
  }
}

export { sql }
