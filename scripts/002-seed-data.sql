-- Inserir dados de exemplo para análise
INSERT INTO game_history (user_id, game_type, bet_amount, result_amount, multiplier, game_data) 
SELECT 
    uuid_generate_v4(),
    CASE (random() * 4)::int 
        WHEN 0 THEN 'aviator'
        WHEN 1 THEN 'mines'
        WHEN 2 THEN 'roulette'
        ELSE 'dice'
    END,
    (random() * 100 + 10)::int,
    (random() * 500)::int,
    (random() * 10 + 0.1)::decimal(10,2),
    jsonb_build_object(
        'timestamp', NOW() - (random() * interval '30 days'),
        'session_id', uuid_generate_v4()
    )
FROM generate_series(1, 1000);

-- Inserir padrões de exemplo
INSERT INTO game_patterns (game_type, pattern_type, pattern_data, frequency) VALUES
('aviator', 'crash_sequence', '{"sequence": [1.2, 1.5, 2.1, 1.1], "probability": 0.15}', 45),
('aviator', 'high_multiplier', '{"threshold": 5.0, "frequency": "every_20_rounds"}', 23),
('mines', 'safe_zones', '{"positions": [0, 4, 8, 12], "success_rate": 0.73}', 67),
('roulette', 'color_streak', '{"color": "red", "max_streak": 7, "probability": 0.008}', 12),
('dice', 'number_frequency', '{"number": 7, "frequency": 0.167, "deviation": 0.02}', 89);

-- Inserir análises iniciais
INSERT INTO turbo_analysis (game_type, analysis_type, data, confidence_score) VALUES
('aviator', 'crash_prediction', '{"next_crash": 2.3, "confidence": 0.75, "factors": ["recent_low", "pattern_match"]}', 75.0),
('mines', 'safe_prediction', '{"recommended_cells": [1, 5, 9], "risk_level": "medium"}', 82.5),
('roulette', 'color_trend', '{"trending_color": "black", "streak_count": 3, "reversal_probability": 0.45}', 68.0),
('dice', 'number_prediction', '{"hot_numbers": [6, 8], "cold_numbers": [2, 4], "next_roll_prediction": 7}', 71.2);
