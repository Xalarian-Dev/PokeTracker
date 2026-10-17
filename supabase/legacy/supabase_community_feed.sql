-- Fil de la communauté (table `community_feed`) : état RELEVÉ dans la vraie base Supabase
-- le 2026-10-15 (ticket #2). Ce fichier sert de DOCUMENTATION versionnée.
-- La table existe déjà en production : NE PAS l'exécuter tel quel sur la base existante.
--
-- Ce qui est connu (résultats collés par le propriétaire dans le ticket #2) :
--   - colonnes et types ci-dessous ;
--   - un déclencheur BEFORE INSERT `community_feed_dedupe_trigger` ;
--   - une seule règle d'accès : lecture publique (`community_feed_read`).
--     Aucune règle d'écriture : les écritures passent par le serveur (api/shinies.ts,
--     api/user-data.ts) avec la clé de service.
--
-- Fonction du déclencheur (relevée le 2026-10-15, collée par le propriétaire dans le ticket #2).
-- Elle supprime l'ancienne entrée du même joueur pour le même Pokémon avant d'insérer la nouvelle.
--
-- À COMPLÉTER : valeurs par défaut des colonnes `id`, `caught_at`, `seq` (non relevées).

create table if not exists public.community_feed (
    id          uuid                     not null,  -- défaut : à compléter
    caught_at   timestamp with time zone not null,  -- défaut : à compléter
    seq         bigint                   not null,  -- défaut : à compléter
    user_id     text                     not null,  -- identifiant Clerk
    trainer_id  text                     not null,
    pokemon_id  text                     not null
);

alter table public.community_feed enable row level security;

drop policy if exists community_feed_read on public.community_feed;
create policy community_feed_read on public.community_feed
    for select using (true);

-- Fonction et déclencheur existants (documentation, déjà présents en production) :
--   CREATE OR REPLACE FUNCTION public.dedupe_community_feed()
--    RETURNS trigger
--    LANGUAGE plpgsql
--   AS $function$
--   BEGIN
--     DELETE FROM community_feed
--     WHERE user_id = NEW.user_id AND pokemon_id = NEW.pokemon_id;
--     RETURN NEW;
--   END;
--   $function$;
--
--   CREATE TRIGGER community_feed_dedupe_trigger BEFORE INSERT ON public.community_feed
--   FOR EACH ROW EXECUTE FUNCTION dedupe_community_feed();
