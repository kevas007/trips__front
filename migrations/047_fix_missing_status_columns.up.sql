-- Migration pour ajouter les colonnes manquantes
-- Ajout de la colonne 'status' dans trip_members
ALTER TABLE trip_members ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';

-- Ajout de la colonne 'awarded_at' dans user_badges (alias de earned_at)
ALTER TABLE user_badges ADD COLUMN IF NOT EXISTS awarded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
