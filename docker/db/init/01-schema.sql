-- Schéma de PokeTracker pour un Postgres ordinaire (service « db » de docker-compose.yml).
-- Exécuté UNE SEULE FOIS, à la création du volume de données (dossier docker-entrypoint-initdb.d).
--
-- Équivalent du schéma Supabase du dossier supabase/migrations (état au 2026-11-01), sans ce qui
-- est propre à Supabase : pas de rôles anon/authenticated, pas de règles RLS, pas de droits par
-- colonne, pas de publication Realtime. Le site passe par le serveur (service « app »), seul client
-- de la base : il se connecte avec un seul rôle et filtre toujours par utilisateur authentifié.
--
-- Si vous restaurez une sauvegarde de la base Supabase (voir docker/README.md), n'exécutez pas ce
-- fichier : la restauration crée déjà les tables.

create table public.shiny_pokemon (
  id uuid not null default gen_random_uuid(),
  user_id text not null,
  pokemon_id text not null,
  caught_at timestamp with time zone default now(),
  game text,
  encounters integer,
  constraint shiny_pokemon_pkey primary key (id),
  constraint shiny_pokemon_user_id_pokemon_id_key unique (user_id, pokemon_id),
  constraint shiny_pokemon_game_format check (game is null or game ~ '^[A-Za-z0-9_-]{1,20}$'),
  constraint shiny_pokemon_encounters_range check (encounters is null or (encounters >= 0 and encounters <= 9999999))
);
comment on table public.shiny_pokemon is 'Tracks which Pokemon users have caught as shiny';

create table public.user_preferences (
  id uuid not null default gen_random_uuid(),
  user_id text not null,
  preferred_language text default 'fr'::text,
  owned_games text[] default '{}'::text[],
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  display_name text,
  trainer_id text,
  constraint user_preferences_pkey primary key (id),
  constraint user_preferences_user_id_key unique (user_id),
  constraint user_preferences_trainer_id_key unique (trainer_id)
);
comment on table public.user_preferences is 'User preferences for language and owned games';

create table public.pokemon_forms (
  id uuid not null default gen_random_uuid(),
  user_id text not null,
  pokemon_id text not null,
  form_id text not null,
  is_shiny boolean default false,
  is_favorite boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  constraint pokemon_forms_pkey primary key (id),
  constraint pokemon_forms_user_id_pokemon_id_form_id_key unique (user_id, pokemon_id, form_id)
);

create sequence public.community_feed_seq_seq;

create table public.community_feed (
  id uuid not null default gen_random_uuid(),
  user_id text not null,
  trainer_id text not null,
  pokemon_id text not null,
  caught_at timestamp with time zone not null default now(),
  seq bigint not null default nextval('community_feed_seq_seq'::regclass),
  game text,
  encounters integer,
  constraint community_feed_pkey primary key (id),
  constraint community_feed_game_format check (game is null or game ~ '^[A-Za-z0-9_-]{1,20}$'),
  constraint community_feed_encounters_range check (encounters is null or (encounters >= 0 and encounters <= 9999999))
);
alter sequence public.community_feed_seq_seq owned by public.community_feed.seq;

-- Index
create index community_feed_caught_at_idx on public.community_feed using btree (caught_at desc);
create index idx_pokemon_forms_user on public.pokemon_forms using btree (user_id);
create index idx_pokemon_forms_user_pokemon on public.pokemon_forms using btree (user_id, pokemon_id);
create index idx_shiny_pokemon_pokemon_id on public.shiny_pokemon using btree (pokemon_id);
create index idx_shiny_pokemon_user_id on public.shiny_pokemon using btree (user_id);
create unique index idx_user_preferences_trainer_id on public.user_preferences using btree (trainer_id) where (trainer_id is not null);
create index idx_user_preferences_user_id on public.user_preferences using btree (user_id);

-- Fil de la communauté : un seul exemplaire par joueur et par Pokémon…
create or replace function public.dedupe_community_feed()
 returns trigger
 language plpgsql
 set search_path = public, pg_temp
as $function$
begin
  delete from community_feed
  where user_id = new.user_id and pokemon_id = new.pokemon_id;
  return new;
end;
$function$;

-- … et seulement les 3 dernières entrées par joueur (décision du propriétaire, ticket #29).
create or replace function public.enforce_community_feed_cap()
 returns trigger
 language plpgsql
 set search_path = public, pg_temp
as $function$
begin
  delete from community_feed
  where user_id = new.user_id and id not in (
    select id from community_feed
    where user_id = new.user_id
    order by caught_at desc, seq desc
    limit 3
  );
  return new;
end;
$function$;

create trigger community_feed_dedupe_trigger before insert on public.community_feed
  for each row execute function dedupe_community_feed();

create trigger community_feed_cap_trigger after insert on public.community_feed
  for each row execute function enforce_community_feed_cap();
