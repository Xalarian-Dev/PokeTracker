-- Page « Chasse » : bouton « Capturé ! ». Le jeu utilisé et le nombre de rencontres du compteur
-- sont enregistrés avec le shiny, et recopiés dans le fil de la communauté.
-- Non destructive : deux colonnes facultatives (NULL) ajoutées à chaque table ; aucune ligne
-- existante n'est modifiée ni supprimée. Les shiny déjà enregistrés gardent « jeu » et
-- « rencontres » vides.
-- Annulation :
--   alter table public.shiny_pokemon drop column game, drop column encounters;
--   alter table public.community_feed drop column game, drop column encounters;

begin;

alter table public.shiny_pokemon
  add column if not exists game text,
  add column if not exists encounters integer;

alter table public.shiny_pokemon
  add constraint shiny_pokemon_game_format check (game is null or game ~ '^[A-Za-z0-9_-]{1,20}$'),
  add constraint shiny_pokemon_encounters_range check (encounters is null or (encounters >= 0 and encounters <= 9999999));

alter table public.community_feed
  add column if not exists game text,
  add column if not exists encounters integer;

alter table public.community_feed
  add constraint community_feed_game_format check (game is null or game ~ '^[A-Za-z0-9_-]{1,20}$'),
  add constraint community_feed_encounters_range check (encounters is null or (encounters >= 0 and encounters <= 9999999));

-- Le fil est lu avec la clé publique, limitée aux colonnes autorisées (ticket #41) :
-- on autorise la lecture des deux nouvelles colonnes (le user_id reste masqué).
grant select (game, encounters) on public.community_feed to anon, authenticated;

commit;
