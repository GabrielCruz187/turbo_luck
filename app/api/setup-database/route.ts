import { NextResponse } from "next/server"
import { sql } from "@/lib/database"
import crypto from "crypto"

export async function POST() {
  try {
    console.log("🚀 Iniciando setup do banco de dados...")

    // Script 1: Criar tabelas
    console.log("📋 Criando tabelas...")

    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`

    // Tabela de usuários
    await sql`
      CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          email VARCHAR(255) UNIQUE NOT NULL,
          username VARCHAR(100) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          level INTEGER DEFAULT 1,
          xp INTEGER DEFAULT 0,
          total_wins INTEGER DEFAULT 0,
          total_losses INTEGER DEFAULT 0,
          favorite_game VARCHAR(50) DEFAULT 'Aviãozinho',
          avatar TEXT,
          balance INTEGER DEFAULT 1000,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Tabela de histórico de jogos
    await sql`
      CREATE TABLE IF NOT EXISTS game_history (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          game_type VARCHAR(50) NOT NULL,
          bet_amount INTEGER NOT NULL,
          result_amount INTEGER NOT NULL,
          multiplier DECIMAL(10,2) NOT NULL,
          game_data JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Tabela de análises do TurboBot
    await sql`
      CREATE TABLE IF NOT EXISTS turbo_analysis (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          game_type VARCHAR(50) NOT NULL,
          analysis_type VARCHAR(50) NOT NULL,
          data JSONB NOT NULL,
          confidence_score DECIMAL(5,2) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Tabela de padrões detectados
    await sql`
      CREATE TABLE IF NOT EXISTS game_patterns (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          game_type VARCHAR(50) NOT NULL,
          pattern_type VARCHAR(100) NOT NULL,
          pattern_data JSONB NOT NULL,
          frequency INTEGER DEFAULT 1,
          last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Tabela de alertas do TurboBot
    await sql`
      CREATE TABLE IF NOT EXISTS turbo_alerts (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          alert_type VARCHAR(50) NOT NULL,
          game_type VARCHAR(50) NOT NULL,
          message TEXT NOT NULL,
          data JSONB,
          is_read BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    console.log("📊 Criando índices...")

    // Índices para performance
    await sql`CREATE INDEX IF NOT EXISTS idx_game_history_user_id ON game_history(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_game_history_game_type ON game_history(game_type)`
    await sql`CREATE INDEX IF NOT EXISTS idx_game_history_created_at ON game_history(created_at)`
    await sql`CREATE INDEX IF NOT EXISTS idx_turbo_analysis_game_type ON turbo_analysis(game_type)`
    await sql`CREATE INDEX IF NOT EXISTS idx_game_patterns_game_type ON game_patterns(game_type)`
    await sql`CREATE INDEX IF NOT EXISTS idx_turbo_alerts_user_id ON turbo_alerts(user_id)`

    console.log("🌱 Inserindo dados de exemplo...")

    // Primeiro, criar alguns usuários de exemplo
    const sampleUsers = await sql`
      INSERT INTO users (email, username, password_hash, level, xp, total_wins, total_losses, favorite_game, avatar, balance)
      VALUES 
        ('demo1@turboluck.com', 'TurboPlayer1', 'hashed_password_1', 5, 2500, 45, 23, 'aviator', 'https://api.dicebear.com/7.x/avataaars/svg?seed=TurboPlayer1', 1500),
        ('demo2@turboluck.com', 'LuckyGamer', 'hashed_password_2', 3, 1200, 28, 31, 'mines', 'https://api.dicebear.com/7.x/avataaars/svg?seed=LuckyGamer', 800),
        ('demo3@turboluck.com', 'BotMaster', 'hashed_password_3', 7, 4200, 67, 18, 'roulette', 'https://api.dicebear.com/7.x/avataaars/svg?seed=BotMaster', 2200),
        ('system@turboluck.com', 'SystemBot', 'system_hash', 1, 0, 0, 0, 'aviator', 'https://api.dicebear.com/7.x/avataaars/svg?seed=SystemBot', 1000)
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    `

    // Pegar os IDs dos usuários criados ou existentes
    const userIds = await sql`SELECT id FROM users WHERE email LIKE '%turboluck.com' LIMIT 4`

    if (userIds.length > 0) {
      // Inserir dados de exemplo para análise usando os IDs reais dos usuários
      for (let i = 0; i < 500; i++) {
        const randomUserId = userIds[Math.floor(Math.random() * userIds.length)].id
        const gameTypes = ["aviator", "mines", "roulette", "dice"]
        const randomGameType = gameTypes[Math.floor(Math.random() * gameTypes.length)]
        const betAmount = Math.floor(Math.random() * 100) + 10
        const multiplier = Math.random() * 10 + 0.1
        const resultAmount = Math.floor(betAmount * multiplier)

        await sql`
          INSERT INTO game_history (user_id, game_type, bet_amount, result_amount, multiplier, game_data) 
          VALUES (
            ${randomUserId},
            ${randomGameType},
            ${betAmount},
            ${resultAmount},
            ${multiplier},
            ${JSON.stringify({
              timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
              session_id: crypto.randomUUID(),
            })}
          )
          ON CONFLICT DO NOTHING
        `
      }
    }

    // Inserir padrões de exemplo
    await sql`
      INSERT INTO game_patterns (game_type, pattern_type, pattern_data, frequency) VALUES
      ('aviator', 'crash_sequence', '{"sequence": [1.2, 1.5, 2.1, 1.1], "probability": 0.15}', 45),
      ('aviator', 'high_multiplier', '{"threshold": 5.0, "frequency": "every_20_rounds"}', 23),
      ('mines', 'safe_zones', '{"positions": [0, 4, 8, 12], "success_rate": 0.73}', 67),
      ('roulette', 'color_streak', '{"color": "red", "max_streak": 7, "probability": 0.008}', 12),
      ('dice', 'number_frequency', '{"number": 7, "frequency": 0.167, "deviation": 0.02}', 89)
      ON CONFLICT DO NOTHING
    `

    // Inserir análises iniciais
    await sql`
      INSERT INTO turbo_analysis (game_type, analysis_type, data, confidence_score) VALUES
      ('aviator', 'crash_prediction', '{"next_crash": 2.3, "confidence": 0.75, "factors": ["recent_low", "pattern_match"]}', 75.0),
      ('mines', 'safe_prediction', '{"recommended_cells": [1, 5, 9], "risk_level": "medium"}', 82.5),
      ('roulette', 'color_trend', '{"trending_color": "black", "streak_count": 3, "reversal_probability": 0.45}', 68.0),
      ('dice', 'number_prediction', '{"hot_numbers": [6, 8], "cold_numbers": [2, 4], "next_roll_prediction": 7}', 71.2)
      ON CONFLICT DO NOTHING
    `

    console.log("✅ Setup do banco de dados concluído com sucesso!")

    return NextResponse.json({
      success: true,
      message: "🎉 Banco de dados configurado com sucesso!",
      details: {
        tables_created: ["users", "game_history", "turbo_analysis", "game_patterns", "turbo_alerts"],
        indexes_created: 6,
        sample_data: "500 registros de histórico + padrões + análises",
      },
    })
  } catch (error) {
    console.error("❌ Erro ao configurar banco:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao configurar banco de dados",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

// Endpoint GET para verificar status
export async function GET() {
  try {
    // Verificar se as tabelas existem
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'game_history', 'turbo_analysis', 'game_patterns', 'turbo_alerts')
    `

    const tableNames = tables.map((t) => t.table_name)
    const allTablesExist = ["users", "game_history", "turbo_analysis", "game_patterns", "turbo_alerts"].every((table) =>
      tableNames.includes(table),
    )

    return NextResponse.json({
      database_configured: allTablesExist,
      existing_tables: tableNames,
      missing_tables: ["users", "game_history", "turbo_analysis", "game_patterns", "turbo_alerts"].filter(
        (table) => !tableNames.includes(table),
      ),
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: "Erro ao verificar banco de dados",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
