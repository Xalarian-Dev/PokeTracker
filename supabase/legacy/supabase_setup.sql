-- ============================================
-- POKETRACKER - SETUP COMPLET SUPABASE
-- ============================================
-- Ce script configure TOUT ce dont vous avez besoin pour démarrer
-- Exécutez-le une seule fois lors de la création du projet

-- ============================================
-- TABLES
-- ============================================

-- Table: shiny_pokemon
CREATE TABLE IF NOT EXISTS shiny_pokemon (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    pokemon_id TEXT NOT NULL,
    caught_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, pokemon_id)
);

CREATE INDEX IF NOT EXISTS idx_shiny_pokemon_user_id ON shiny_pokemon(user_id);

-- Table: user_preferences
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL UNIQUE,
    preferred_language TEXT DEFAULT 'en',
    owned_games TEXT[] DEFAULT '{}',
    display_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Activer RLS sur toutes les tables
ALTER TABLE shiny_pokemon ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- IMPORTANT: Aucune politique RLS définie
-- Le backend API utilise service_role_key qui BYPASS RLS
-- Résultat: Tout accès direct avec anon_key est BLOQUÉ
-- Seul le backend API peut accéder aux données

-- ============================================
-- REALTIME
-- ============================================

-- Ajouter les tables à la publication Realtime (optionnel, actuellement désactivé)
-- ALTER PUBLICATION supabase_realtime ADD TABLE shiny_pokemon;
-- ALTER PUBLICATION supabase_realtime ADD TABLE user_preferences;

-- Note: Realtime est désactivé dans le code pour des raisons de sécurité
-- Pour l'activer, décommentez les lignes ci-dessus et le code dans ShinyTracker.tsx

-- ============================================
-- VÉRIFICATION
-- ============================================

-- Vérifier que les tables existent
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('shiny_pokemon', 'user_preferences')
ORDER BY tablename;

-- Vérifier que RLS est activé
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('shiny_pokemon', 'user_preferences')
ORDER BY tablename;

-- Vérifier qu'il n'y a aucune politique (sécurité maximale)
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('shiny_pokemon', 'user_preferences')
ORDER BY tablename;

-- Résultat attendu: 0 lignes (aucune politique = accès direct bloqué)

-- ============================================
-- NOTES
-- ============================================

/*
SÉCURITÉ:
- RLS activé sur toutes les tables
- Aucune politique définie
- Tout accès direct avec anon_key est BLOQUÉ
- Seul le backend API (service_role_key) peut accéder aux données

BACKEND API:
- Utilise service_role_key qui BYPASS RLS
- Authentification Clerk JWT sur chaque requête
- Isolation des données par user_id dans le code

REALTIME:
- Désactivé pour maintenir la sécurité maximale
- Pour l'activer: voir supabase_migrations.sql
*/
