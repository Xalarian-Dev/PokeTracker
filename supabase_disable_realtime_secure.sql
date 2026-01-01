-- ============================================
-- SÉCURISATION RLS - Suppression Realtime
-- ============================================
-- Ce script supprime les politiques RLS permissives
-- et sécurise la base contre l'accès direct avec anon_key

-- ============================================
-- ÉTAPE 1: Supprimer toutes les politiques permissives
-- ============================================

DROP POLICY IF EXISTS "Allow SELECT for Realtime" ON shiny_pokemon;
DROP POLICY IF EXISTS "Allow DELETE for Realtime" ON shiny_pokemon;
DROP POLICY IF EXISTS "Users can view their own shinies" ON shiny_pokemon;
DROP POLICY IF EXISTS "Users can insert their own shinies" ON shiny_pokemon;
DROP POLICY IF EXISTS "Users can delete their own shinies" ON shiny_pokemon;

-- ============================================
-- ÉTAPE 2: Vérifier qu'il n'y a plus de politiques
-- ============================================

SELECT 
    tablename,
    policyname,
    cmd,
    qual as using_expression
FROM pg_policies 
WHERE tablename = 'shiny_pokemon'
ORDER BY policyname;

-- Résultat attendu: 0 lignes (aucune politique)

-- ============================================
-- ÉTAPE 3: Vérifier que RLS est toujours activé
-- ============================================

SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'shiny_pokemon';

-- rls_enabled devrait être 'true'

-- ============================================
-- RÉSULTAT FINAL
-- ============================================

/*
SÉCURITÉ MAXIMALE :

1. RLS activé sur la table
2. Aucune politique définie
3. Résultat : TOUT accès direct avec anon_key est BLOQUÉ

BACKEND API :
- Utilise service_role_key qui BYPASS RLS
- Continue de fonctionner normalement
- Sécurisé par Clerk JWT

REALTIME :
- Désactivé dans le code frontend
- Pas de synchronisation temps réel
- Il faut rafraîchir manuellement pour voir les changements

PROTECTION :
- Même si quelqu'un obtient votre anon_key depuis le code JavaScript
- Il ne peut PAS lire les données
- Il ne peut PAS modifier les données
- Il ne peut PAS supprimer les données

SEUL LE BACKEND API peut accéder aux données (via service_role_key)
*/
