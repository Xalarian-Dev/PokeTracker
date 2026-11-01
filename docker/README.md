# Déployer PokeTracker avec Docker Compose

Deux services :

| Service | Rôle |
|---|---|
| **app** | Sert le site et exécute les fonctions `api/*` (le même code que sur Vercel). Seul client de la base. |
| **db** | Postgres 16. Aucun port publié : joignable uniquement par `app`, sur le réseau interne de Compose. |

La connexion des joueurs reste **Clerk** (service externe) : la machine doit pouvoir joindre internet.
Le déploiement Vercel + Supabase actuel n'est pas modifié ; ce dossier est une alternative.

## 1. Démarrage

```bash
cp .env.docker.example .env      # remplir POSTGRES_PASSWORD, VITE_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY
docker compose up -d --build
docker compose ps                 # les deux services doivent être « healthy »
```

- Au **premier** démarrage, la base est créée vide avec le schéma (`docker/db/init/01-schema.sql`).
- Le site répond sur `http://<machine>:3000` (`APP_PORT` pour changer le port). Test : `curl http://localhost:3000/healthz` → `{"status":"ok"}`.
- Mot de passe de la base : lettres et chiffres (`openssl rand -hex 24`).

## 2. HTTPS et domaine (obligatoire en production)

`app` parle en HTTP : placez devant lui un proxy HTTPS (Caddy, Traefik, Nginx Proxy Manager…).
Exemple Caddy (`Caddyfile`), si le proxy tourne sur la même machine :

```
poketracker.exemple.fr {
    reverse_proxy 127.0.0.1:3000
}
```

Pensez à publier `app` seulement en local (`"127.0.0.1:${APP_PORT:-3000}:3000"` dans `docker-compose.yml`).

**Clerk** : dans le tableau de bord Clerk, ajoutez votre domaine aux domaines autorisés du projet
(avec des clés de production, Clerk est lié à un domaine précis ; avec des clés de développement, `localhost` suffit).

## 3. Reprendre les données de Supabase

À faire **avant** d'ouvrir le site aux joueurs (ou en coupant l'écriture un instant). Il faut la chaîne de connexion
Postgres de Supabase (tableau de bord Supabase > *Project Settings* > *Database* > *Connection string*, mode « session »).
Ne la partagez pas et ne l'écrivez dans aucun fichier du dépôt.

```bash
# 1. Sauvegarde des DONNÉES de Supabase (le schéma est déjà créé par le service db)
pg_dump "$SUPABASE_DB_URL" --data-only --no-owner --no-privileges \
  -t public.shiny_pokemon -t public.user_preferences -t public.pokemon_forms \
  -t public.community_feed -t public.community_feed_seq_seq \
  -Fc -f supabase-donnees.dump

# 2. Restauration dans le conteneur (les déclencheurs du fil sont suspendus pendant la restauration,
#    pour ne rien modifier : --disable-triggers)
docker compose exec -T db pg_restore -U poketracker -d poketracker \
  --data-only --disable-triggers < supabase-donnees.dump

# 3. Contrôle : mêmes nombres de lignes qu'avant
docker compose exec db psql -U poketracker -d poketracker -c \
  "select 'shiny_pokemon', count(*) from shiny_pokemon union all select 'user_preferences', count(*) from user_preferences \
   union all select 'pokemon_forms', count(*) from pokemon_forms union all select 'community_feed', count(*) from community_feed;"
```

Les identifiants de joueurs sont ceux de Clerk (`user_…`) : si vous gardez le **même projet Clerk**, les comptes retrouvent leurs données.
Avec un **nouveau** projet Clerk, les anciens identifiants ne correspondront plus : ne changez pas de projet Clerk sans plan de reprise.

## 4. Sauvegardes (indispensable)

Le volume `db_data` est la seule copie des données. Sauvegarde manuelle :

```bash
docker compose exec -T db pg_dump -U poketracker -Fc poketracker > sauvegarde-$(date +%F).dump
```

Planifiez-la (cron, tous les jours) et **copiez le fichier hors du serveur**. Restauration sur une base vide :

```bash
docker compose exec -T db pg_restore -U poketracker -d poketracker --clean --if-exists < sauvegarde-AAAA-MM-JJ.dump
```

Testez une restauration au moins une fois.

## 5. Mises à jour

```bash
git pull
docker compose up -d --build        # reconstruit l'image « app » ; la base et ses données sont conservées
```

Un changement de schéma arrive sous forme d'un nouveau fichier dans `supabase/migrations/` : appliquez-le à la main avec
`docker compose exec -T db psql -U poketracker -d poketracker < supabase/migrations/<fichier>.sql`
(retirez les lignes propres à Supabase : `grant … to anon, authenticated`, règles RLS, publication Realtime).

## Ce qui diffère de Vercel + Supabase

- **Fil de la communauté** : rafraîchi toutes les 10 secondes (pas de Realtime instantané).
- **Règles d'accès (RLS)** : inutiles ici, le navigateur ne lit jamais la base directement ; `app` filtre toujours par joueur authentifié.
- **Sécurité** : la base n'est pas exposée ; seuls les ports de `app` (derrière HTTPS) le sont. Gardez Docker et les images à jour.
- Les variables `VITE_SUPABASE_*` et `SUPABASE_SERVICE_ROLE_KEY` ne servent pas ici.
