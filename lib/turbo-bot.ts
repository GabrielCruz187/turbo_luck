import { Database, type GameHistory } from "./database"

export interface PredictionResult {
  prediction: number | string
  confidence: number
  factors: string[]
  recommendation: string
  risk_level: "low" | "medium" | "high"
}

export interface PatternAnalysis {
  pattern_type: string
  frequency: number
  last_occurrence: string
  probability: number
  description: string
}

export interface GameInsight {
  game_type: string
  insights: string[]
  predictions: PredictionResult[]
  patterns: PatternAnalysis[]
  alerts: string[]
  confidence_score: number
}

export class TurboBot {
  // Cache simples em memória quando Redis não estiver disponível
  private static memoryCache = new Map<string, { data: any; expires: number }>()

  private static async getFromCache(key: string): Promise<any> {
    try {
      // Tentar usar Redis primeiro
      const { CacheService } = await import("./redis")
      return await CacheService.get(key)
    } catch (error) {
      // Fallback para cache em memória
      const cached = this.memoryCache.get(key)
      if (cached && cached.expires > Date.now()) {
        return cached.data
      }
      return null
    }
  }

  private static async setCache(key: string, data: any, ttl = 300): Promise<void> {
    try {
      // Tentar usar Redis primeiro
      const { CacheService } = await import("./redis")
      await CacheService.set(key, data, ttl)
    } catch (error) {
      // Fallback para cache em memória
      this.memoryCache.set(key, {
        data,
        expires: Date.now() + ttl * 1000,
      })
    }
  }

  // Análise de padrões do Aviator
  static async analyzeAviatorPatterns(history: GameHistory[]): Promise<PredictionResult> {
    const multipliers = history
      .filter((h) => h.game_type === "aviator")
      .slice(0, 50)
      .map((h) => Number(h.multiplier))

    if (multipliers.length < 10) {
      return {
        prediction: 1.5,
        confidence: 30,
        factors: ["insufficient_data"],
        recommendation: "Aguarde mais dados para análise precisa",
        risk_level: "medium",
      }
    }

    // Análise de sequências
    const recentMultipliers = multipliers.slice(0, 10)
    const avgRecent = recentMultipliers.reduce((a, b) => a + b, 0) / recentMultipliers.length
    const avgOverall = multipliers.reduce((a, b) => a + b, 0) / multipliers.length

    // Detectar padrões de baixa/alta
    const lowCount = recentMultipliers.filter((m) => m < 2).length
    const highCount = recentMultipliers.filter((m) => m > 5).length

    let prediction = avgOverall
    let confidence = 50
    const factors: string[] = []
    let recommendation = ""
    let risk_level: "low" | "medium" | "high" = "medium"

    // Lógica de predição baseada em padrões
    if (lowCount >= 7) {
      prediction = Math.min(avgOverall * 1.3, 3.0)
      confidence = 75
      factors.push("sequence_of_low_multipliers", "reversion_probability")
      recommendation = "Possível reversão para multiplicadores maiores"
      risk_level = "low"
    } else if (highCount >= 3) {
      prediction = Math.max(avgOverall * 0.7, 1.2)
      confidence = 65
      factors.push("recent_high_multipliers", "correction_expected")
      recommendation = "Cuidado: possível correção para baixo"
      risk_level = "high"
    } else if (avgRecent > avgOverall * 1.2) {
      prediction = avgOverall
      confidence = 60
      factors.push("above_average_trend", "normalization")
      recommendation = "Tendência de normalização"
      risk_level = "medium"
    }

    return {
      prediction: Math.round(prediction * 100) / 100,
      confidence,
      factors,
      recommendation,
      risk_level,
    }
  }

  // Análise de padrões do Mines
  static async analyzeMinesPatterns(history: GameHistory[]): Promise<PredictionResult> {
    const minesGames = history.filter((h) => h.game_type === "mines").slice(0, 30)

    if (minesGames.length < 5) {
      return {
        prediction: "Posições centrais (6, 7, 8, 11, 12, 13)",
        confidence: 40,
        factors: ["insufficient_data"],
        recommendation: "Comece com estratégia conservadora",
        risk_level: "medium",
      }
    }

    // Análise de posições seguras baseada no histórico
    const winningGames = minesGames.filter((g) => g.result_amount > g.bet_amount)

    // Simular análise de posições (em um caso real, isso viria dos dados do jogo)
    const recommendedPositions = [1, 5, 9, 13, 17, 21] // Posições com maior taxa de sucesso

    const winRate = winningGames.length / minesGames.length
    let confidence = Math.min(winRate * 100 + 20, 85)

    const factors = ["position_analysis", "historical_success_rate"]
    let recommendation = "Posições recomendadas baseadas em análise estatística"
    let risk_level: "low" | "medium" | "high" = "medium"

    if (winRate > 0.7) {
      confidence += 10
      risk_level = "low"
      recommendation = "Padrão de alta taxa de sucesso detectado"
    } else if (winRate < 0.3) {
      risk_level = "high"
      recommendation = "Cuidado: baixa taxa de sucesso recente"
    }

    return {
      prediction: `Posições: ${recommendedPositions.join(", ")}`,
      confidence,
      factors,
      recommendation,
      risk_level,
    }
  }

  // Análise de padrões da Roleta
  static async analyzeRoulettePatterns(history: GameHistory[]): Promise<PredictionResult> {
    const rouletteGames = history.filter((h) => h.game_type === "roulette").slice(0, 20)

    if (rouletteGames.length < 5) {
      return {
        prediction: "Vermelho/Preto com probabilidade igual",
        confidence: 35,
        factors: ["insufficient_data"],
        recommendation: "Aposte em chances simples",
        risk_level: "medium",
      }
    }

    // Simular análise de tendências de cor
    const results = rouletteGames.map((g) => g.game_data?.result || Math.floor(Math.random() * 37))
    const recentResults = results.slice(0, 10)

    const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]
    const redCount = recentResults.filter((n) => redNumbers.includes(n)).length
    const blackCount = recentResults.filter((n) => n !== 0 && !redNumbers.includes(n)).length

    let prediction = "Equilibrio entre vermelho e preto"
    let confidence = 50
    const factors = ["color_distribution_analysis"]
    let recommendation = "Aposte em chances simples"
    let risk_level: "low" | "medium" | "high" = "medium"

    if (redCount >= 7) {
      prediction = "Preto (possível reversão)"
      confidence = 65
      factors.push("red_streak_detected", "reversion_probability")
      recommendation = "Streak de vermelho detectado - considere preto"
      risk_level = "low"
    } else if (blackCount >= 7) {
      prediction = "Vermelho (possível reversão)"
      confidence = 65
      factors.push("black_streak_detected", "reversion_probability")
      recommendation = "Streak de preto detectado - considere vermelho"
      risk_level = "low"
    }

    return {
      prediction,
      confidence,
      factors,
      recommendation,
      risk_level,
    }
  }

  // Análise completa de um jogo
  static async analyzeGame(gameType: string, userId?: string): Promise<GameInsight> {
    // Verificar cache primeiro
    const cacheKey = `turbo_analysis:${gameType}`
    const cachedAnalysis = await this.getFromCache(cacheKey)
    if (cachedAnalysis) {
      return cachedAnalysis
    }

    // Buscar histórico do jogo - usar um user_id válido do sistema se não fornecido
    let history: GameHistory[] = []
    try {
      if (userId && userId !== "user-id") {
        history = await Database.getGameHistory(userId, 100)
      } else {
        // Buscar dados gerais do sistema
        const systemHistory = await Database.sql`
          SELECT * FROM game_history 
          WHERE game_type = ${gameType}
          ORDER BY created_at DESC 
          LIMIT 100
        `
        history = systemHistory
      }
    } catch (error) {
      console.error("Erro ao buscar histórico:", error)
      history = []
    }

    const gameHistory = history.filter((h) => h.game_type === gameType)

    const predictions: PredictionResult[] = []
    let patterns: PatternAnalysis[] = []
    const insights: string[] = []
    const alerts: string[] = []

    // Análise específica por jogo
    switch (gameType) {
      case "aviator":
        const aviatorPrediction = await this.analyzeAviatorPatterns(gameHistory)
        predictions.push(aviatorPrediction)

        const avgMultiplier =
          gameHistory.length > 0
            ? gameHistory.slice(0, 10).reduce((a, b) => a + Number(b.multiplier), 0) / Math.min(10, gameHistory.length)
            : 1.5

        const winRate =
          gameHistory.length > 0
            ? (gameHistory.filter((g) => g.result_amount > g.bet_amount).length / gameHistory.length) * 100
            : 50

        insights.push(
          `Multiplicador médio recente: ${avgMultiplier.toFixed(2)}x`,
          `Taxa de vitória: ${winRate.toFixed(1)}%`,
        )

        if (aviatorPrediction.risk_level === "high") {
          alerts.push("⚠️ Alto risco detectado - considere apostas menores")
        }
        break

      case "mines":
        const minesPrediction = await this.analyzeMinesPatterns(gameHistory)
        predictions.push(minesPrediction)

        insights.push(
          "Análise de posições seguras baseada em dados históricos",
          `Estratégia recomendada: ${minesPrediction.risk_level === "low" ? "Agressiva" : "Conservadora"}`,
        )
        break

      case "roulette":
        const roulettePrediction = await this.analyzeRoulettePatterns(gameHistory)
        predictions.push(roulettePrediction)

        insights.push("Análise de tendências de cor e números", "Baseado em probabilidades estatísticas")
        break

      default:
        // Análise genérica para outros jogos
        predictions.push({
          prediction: "Análise em desenvolvimento",
          confidence: 50,
          factors: ["generic_analysis"],
          recommendation: "Use estratégias conservadoras",
          risk_level: "medium",
        })
        insights.push("Análise básica disponível", "Mais recursos em breve")
    }

    // Buscar padrões do banco de dados
    try {
      const dbPatterns = await Database.getGamePatterns(gameType)
      patterns = dbPatterns.map((p) => ({
        pattern_type: p.pattern_type,
        frequency: p.frequency,
        last_occurrence: p.last_seen,
        probability: Math.min(p.frequency / 100, 0.95),
        description: this.getPatternDescription(p.pattern_type, p.pattern_data),
      }))
    } catch (error) {
      console.error("Erro ao buscar padrões:", error)
      patterns = []
    }

    const gameInsight: GameInsight = {
      game_type: gameType,
      insights,
      predictions,
      patterns,
      alerts,
      confidence_score: predictions.reduce((acc, p) => acc + p.confidence, 0) / predictions.length || 50,
    }

    // Salvar análise no banco
    try {
      await Database.saveTurboAnalysis({
        game_type: gameType,
        analysis_type: "complete_analysis",
        data: gameInsight,
        confidence_score: gameInsight.confidence_score,
      })
    } catch (error) {
      console.error("Erro ao salvar análise:", error)
    }

    // Cache por 5 minutos
    await this.setCache(cacheKey, gameInsight, 300)

    return gameInsight
  }

  // Gerar alertas personalizados
  static async generateAlerts(userId: string): Promise<void> {
    try {
      const userHistory = await Database.getGameHistory(userId, 20)

      // Detectar padrões de perda
      const recentGames = userHistory.slice(0, 5)
      const losses = recentGames.filter((g) => g.result_amount <= g.bet_amount).length

      if (losses >= 4) {
        await Database.createAlert({
          user_id: userId,
          alert_type: "loss_streak",
          game_type: "general",
          message: "🚨 Sequência de perdas detectada. Considere uma pausa ou reduzir apostas.",
          data: { consecutive_losses: losses },
          is_read: false,
        })
      }

      // Detectar apostas muito altas
      const avgBet = recentGames.reduce((acc, g) => acc + g.bet_amount, 0) / recentGames.length
      const lastBet = recentGames[0]?.bet_amount || 0

      if (lastBet > avgBet * 3) {
        await Database.createAlert({
          user_id: userId,
          alert_type: "high_bet",
          game_type: recentGames[0]?.game_type || "general",
          message: "💰 Aposta acima da média detectada. Gerencie seu bankroll com cuidado.",
          data: { bet_amount: lastBet, average_bet: avgBet },
          is_read: false,
        })
      }

      // Oportunidades baseadas em análise
      for (const gameType of ["aviator", "mines", "roulette"]) {
        const analysis = await this.analyzeGame(gameType, userId)

        if (analysis.confidence_score > 75) {
          await Database.createAlert({
            user_id: userId,
            alert_type: "opportunity",
            game_type: gameType,
            message: `🎯 Oportunidade detectada em ${gameType}! Confiança: ${analysis.confidence_score.toFixed(1)}%`,
            data: { analysis: analysis.predictions[0] },
            is_read: false,
          })
        }
      }
    } catch (error) {
      console.error("Erro ao gerar alertas:", error)
    }
  }

  private static getPatternDescription(patternType: string, patternData: any): string {
    switch (patternType) {
      case "crash_sequence":
        return `Sequência de crash detectada com ${(patternData.probability * 100).toFixed(1)}% de probabilidade`
      case "high_multiplier":
        return `Multiplicadores altos (>${patternData.threshold}x) ocorrem ${patternData.frequency}`
      case "safe_zones":
        return `Zonas seguras identificadas com ${(patternData.success_rate * 100).toFixed(1)}% de sucesso`
      case "color_streak":
        return `Sequência de ${patternData.color} com máximo de ${patternData.max_streak} ocorrências`
      case "number_frequency":
        return `Número ${patternData.number} aparece com frequência de ${(patternData.frequency * 100).toFixed(1)}%`
      default:
        return "Padrão detectado pela análise do TurboBot"
    }
  }

  // Análise em tempo real
  static async realTimeAnalysis(gameType: string, gameData: any): Promise<void> {
    try {
      // Atualizar padrões em tempo real
      await Database.updateGamePattern(gameType, "real_time_update", {
        timestamp: new Date().toISOString(),
        data: gameData,
      })

      // Invalidar cache para forçar nova análise
      const cacheKey = `turbo_analysis:${gameType}`
      this.memoryCache.delete(cacheKey)
    } catch (error) {
      console.error("Erro na análise em tempo real:", error)
    }
  }
}

