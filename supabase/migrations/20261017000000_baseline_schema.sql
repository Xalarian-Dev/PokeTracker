-- État de la base Supabase de PokeTracker au 2026-10-17, relevé en LECTURE SEULE
-- (catalogue Postgres : tables, colonnes, contraintes, index, règles d'accès, fonctions,
-- déclencheurs, temps réel). Aucune donnée.
-- DÉJÀ APPLIQUÉ en production : NE PAS RÉ-EXÉCUTER sur la base existante.
-- Ce fichier sert de point de départ : les prochaines modifications sont de nouveaux
-- fichiers numérotés dans ce dossier.
--
-- Particularité : le site passe par le serveur (api/*, clé de service et authentification Clerk).
-- Les règles RLS ci-dessous ne sont donc pas la seule protection.

-- Tables
create table public.shiny_pokemon (
  id uuid not null default gen_random_uuid(),
  user_id text not null,
  pokemon_id text not null,
  caught_at timestamp with time zone default now(),
  constraint shiny_pokemon_pkey primary key (id),
  constraint shiny_pokemon_user_id_pokemon_id_key unique (user_id, pokemon_id)
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
  id uuid not null default extensions.uuid_generate_v4(),
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
  constraint community_feed_pkey primary key (id)
);
alter sequence public.community_feed_seq_seq owned by public.community_feed.seq;

-- Index (hors clés primaires et contraintes d'unicité déjà créées ci-dessus)
create index community_feed_caught_at_idx on public.community_feed using btree (caught_at desc);
create index idx_pokemon_forms_user on public.pokemon_forms using btree (user_id);
create index idx_pokemon_forms_user_pokemon on public.pokemon_forms using btree (user_id, pokemon_id);
create index idx_shiny_pokemon_pokemon_id on public.shiny_pokemon using btree (pokemon_id);
create index idx_shiny_pokemon_user_id on public.shiny_pokemon using btree (user_id);
create unique index idx_user_preferences_trainer_id on public.user_preferences using btree (trainer_id) where (trainer_id is not null);
create index idx_user_preferences_user_id on public.user_preferences using btree (user_id);

-- Fonctions
create or replace function public.dedupe_community_feed()
 returns trigger
 language plpgsql
as $function$
begin
  delete from community_feed
  where user_id = new.user_id and pokemon_id = new.pokemon_id;
  return new;
end;
$function$;

-- Présente dans la base mais reliée à AUCUN déclencheur (constat du 2026-10-17).
create or replace function public.enforce_community_feed_cap()
 returns trigger
 language plpgsql
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

-- Déclencheurs
create trigger community_feed_dedupe_trigger before insert on public.community_feed
  for each row execute function dedupe_community_feed();

-- Row Level Security
alter table public.shiny_pokemon enable row level security;   -- aucune règle : tout passe par le serveur
alter table public.pokemon_forms enable row level security;   -- aucune règle : tout passe par le serveur
alter table public.user_preferences enable row level security;
alter table public.community_feed enable row level security;

create policy community_feed_read on public.community_feed
  as permissive for select to public
  using (true);

create policy "Users can view their own preferences" on public.user_preferences
  as permissive for select to public
  using (user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text));

create policy "Users can insert their own preferences" on public.user_preferences
  as permissive for insert to public
  with check (user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text));

create policy "Users can update their own preferences" on public.user_preferences
  as permissive for update to public
  using (user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text))
  with check (user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text));

create policy "Users can delete their own preferences" on public.user_preferences
  as permissive for delete to public
  using (user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text));

-- Droits : les rôles « anon » et « authenticated » ont les droits par défaut de Supabase
-- (tous les droits) sur les quatre tables ; seules les règles RLS ci-dessus les limitent.

-- Temps réel (publication supabase_realtime)
alter publication supabase_realtime add table public.shiny_pokemon;
alter publication supabase_realtime add table public.community_feed;
