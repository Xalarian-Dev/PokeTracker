-- ============================================
-- POKETRACKER - HISTORIQUE DES MIGRATIONS
-- ============================================
-- Ce fichier garde la trace de toutes les migrations appliquées
-- Chaque migration est datée et documentée

-- ============================================
-- MIGRATION 1: Ajout de display_name
-- Date: 2025-12-XX
-- ============================================

-- Ajouter la colonne display_name à user_preferences
ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS display_name TEXT;

-- ============================================
-- MIGRATION 2: Sécurisation RLS (Désactivation Realtime)
-- Date: 2026-01-01
-- ============================================

-- Supprimer toutes les politiques RLS permissives
DROP POLICY IF EXISTS "Allow SELECT for Realtime" ON shiny_pokemon;
DROP POLICY IF EXISTS "Allow DELETE for Realtime" ON shiny_pokemon;
DROP POLICY IF EXISTS "Users can view their own shinies" ON shiny_pokemon;
DROP POLICY IF EXISTS "Users can insert their own shinies" ON shiny_pokemon;
DROP POLICY IF EXISTS "Users can delete their own shinies" ON shiny_pokemon;

-- Résultat: RLS activé + 0 politiques = Sécurité maximale
-- Tout accès direct avec anon_key est bloqué

-- ============================================
-- MIGRATION FUTURE: Réactivation Realtime (si besoin)
-- ============================================

-- Si vous migrez vers Supabase Auth (au lieu de Clerk), vous pouvez:
-- 1. Créer des politiques RLS strictes avec auth.uid()
-- 2. Réactiver Realtime
-- 3. Avoir sécurité ET synchronisation temps réel

-- Exemple de politiques RLS strictes (NE PAS EXÉCUTER maintenant):
/*
CREATE POLICY "Users can view their own shinies"
  ON shiny_pokemon
  FOR SELECT
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can delete their own shinies"
  ON shiny_pokemon
  FOR DELETE
  USING (user_id = auth.uid()::text);

ALTER PUBLICATION supabase_realtime ADD TABLE shiny_pokemon;
*/

-- ============================================
-- MIGRATION 3: Table pokemon_forms
-- Date: 2026-01-11
-- ============================================

-- Créer la table pour stocker les formes de Pokémon
CREATE TABLE IF NOT EXISTS pokemon_forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  pokemon_id TEXT NOT NULL,
  form_id TEXT NOT NULL,
  is_shiny BOOLEAN DEFAULT FALSE,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, pokemon_id, form_id)
);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_pokemon_forms_user ON pokemon_forms(user_id);
CREATE INDEX IF NOT EXISTS idx_pokemon_forms_user_pokemon ON pokemon_forms(user_id, pokemon_id);

-- Activer Row Level Security
ALTER TABLE pokemon_forms ENABLE ROW LEVEL SECURITY;

-- Politiques RLS (pas d'accès direct, uniquement via API)
-- Les politiques sont commentées car on utilise l'API backend avec service_role_key
-- Si vous migrez vers Supabase Auth, décommentez ces politiques:
/*
CREATE POLICY "Users can view their own pokemon forms"
  ON pokemon_forms FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own pokemon forms"
  ON pokemon_forms FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own pokemon forms"
  ON pokemon_forms FOR UPDATE
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own pokemon forms"
  ON pokemon_forms FOR DELETE
  USING (auth.uid()::text = user_id);
*/

-- ============================================
-- NOTES
-- ============================================

/*
COMMENT UTILISER CE FICHIER:

1. Les migrations sont appliquées dans l'ordre chronologique
2. Chaque migration est idempotente (peut être exécutée plusieurs fois)
3. Utilisez IF EXISTS / IF NOT EXISTS pour éviter les erreurs
4. Documentez toujours la raison de la migration

AJOUT D'UNE NOUVELLE MIGRATION:

-- ============================================
-- MIGRATION X: Description
-- Date: YYYY-MM-DD
-- ============================================

-- Votre code SQL ici
*/
