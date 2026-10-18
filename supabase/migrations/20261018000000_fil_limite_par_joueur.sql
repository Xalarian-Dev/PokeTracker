-- Ticket #29 : brancher la limite « 3 dernières captures par joueur » dans le fil de la communauté.
-- Décision du propriétaire (2026-10-17) : la limite est voulue, pour qu'un nouvel arrivant qui saisit
-- ses 130 shiny ne remplisse pas le fil à lui seul.
-- Non destructive : cette migration ne supprime ni ne modifie aucune ligne. Elle crée un déclencheur
-- et fixe le chemin de recherche de la fonction. Ensuite, à chaque nouvelle entrée du fil, le
-- déclencheur retire les plus anciennes ENTRÉES DU FIL du même joueur (jamais des lignes de shiny_pokemon).
-- Le déclencheur est « after insert » pour que la nouvelle entrée compte dans les 3 gardées.
-- Appliquée automatiquement par le dev après la fusion de la PR (vérifications + annulation prévues).
-- Annulation :
--   drop trigger if exists community_feed_cap_trigger on public.community_feed;
--   alter function public.enforce_community_feed_cap() reset search_path;

begin;

alter function public.enforce_community_feed_cap() set search_path = public, pg_temp;

create trigger community_feed_cap_trigger after insert on public.community_feed
  for each row execute function public.enforce_community_feed_cap();

commit;
