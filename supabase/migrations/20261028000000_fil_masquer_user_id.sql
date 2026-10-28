-- Ticket #41 : l'identifiant de compte (user_id) de chaque joueur ne doit plus être lisible
-- avec la clé publique du site. Le site n'a besoin que de : id, pokemon_id, caught_at, trainer_id, seq.
-- Non destructive : aucune ligne n'est modifiée ni supprimée, seuls des droits de lecture changent.
-- Le serveur (clé de service, api/*) n'est pas concerné : il garde l'accès complet.
-- À appliquer après la fusion de la PR, puis à vérifier : le fil doit toujours s'afficher et se
-- mettre à jour en direct (essai sur l'aperçu avant fusion).
-- Annulation :
--   grant select on public.community_feed to anon, authenticated;

begin;

revoke select on public.community_feed from anon, authenticated;

grant select (id, pokemon_id, caught_at, trainer_id, seq)
  on public.community_feed to anon, authenticated;

commit;
