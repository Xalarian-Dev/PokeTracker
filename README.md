# PokeTracker 🎮✨

A modern, cloud-based Pokémon Shiny Tracker built with React, Clerk, and Supabase.

**Live Demo:** https://pokemonshinytracker.vercel.app/

---

## Features

- ✅ **Cloud Storage** - Your shiny collection synced across devices
- ✅ **Secure Authentication** - Powered by Clerk
- ✅ **Guest Mode** - Try it out without signing up (localStorage)
- ✅ **Multi-language** - English, French, Spanish, Japanese
- ✅ **Forms** - Track Pokémon forms (regional, gender...) as shiny or favorite
- ✅ **Trainer ID & Public Profile** - Each player can get a trainer ID and share a public profile page (`/u/<trainer-id>`)
- ✅ **Community Feed** - Public feed of the latest shinies caught by players
- ✅ **Advanced Filters** - By generation, region, game, and more
- ✅ **Random Hunt** - Get random Pokémon suggestions for your next hunt
- ✅ **Dark Theme** - Easy on the eyes during long hunting sessions
- ✅ **Responsive Design** - Works on desktop and mobile

---

## Tech Stack

- **Frontend:** React + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Authentication:** Clerk
- **Database:** Supabase (PostgreSQL)
- **Deployment:** Vercel
- **Real-time:** Supabase Realtime, used only for the community feed (the live sync of a player's own shinies is disabled)

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Xalarian-Dev/PokeTracker.git
cd PokeTracker

# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local
# Add your Clerk and Supabase keys

# Run development server (frontend only)
npm run dev

# OR run with Vercel CLI (includes API routes)
npm run vercel:dev
```

### Environment Variables

Create a `.env.local` file:

```env
# Frontend variables
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Backend variables (for Vercel deployment)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

---

## Security Architecture

**Authentication:** Clerk, with JWT verification on the server
**Data Isolation:** enforced server-side by the API (Vercel serverless functions)
**Row Level Security (RLS):** enabled on the tables, but **no access policy is defined** on the player data tables (see below)

### How it works

1. **Backend API Layer**
   - All reads and writes of player data go through the API endpoints in `api/`
   - The Clerk JWT token is verified on every request
   - The user ID is extracted from the verified token, not from client input
   - Inputs (Pokémon IDs, display name, owned games) are validated in `api/_lib/validate.ts`

2. **Row Level Security (RLS) without policies**
   - RLS is enabled on `shiny_pokemon` and `pokemon_forms` with **no policy**, and on `user_preferences` with per-user policies based on the Clerk JWT (see `supabase/migrations/20261017000000_baseline_schema.sql`)
   - Result: direct access with the public (anon) key is blocked on these tables
   - Only the backend can read and write them, because the service role key bypasses RLS
   - Data isolation per user is therefore done **in the API code** (filter on the user ID), not by the database
   - Exception: `community_feed` has a public read policy (`community_feed_read`, see the same baseline file), because the feed is public

3. **Service Role Isolation**
   - The backend uses the service role key (never exposed to the frontend)
   - The frontend uses the anon key, which gives no access to the player data tables

## Database structure and migrations

- The current structure of the Supabase database is in `supabase/migrations/20261017000000_baseline_schema.sql` (state of 2026-10-17, **already applied: do not re-run it**).
- The old loose scripts are archived in `supabase/legacy/` (history only; they may not match the database).
- To change the database, add one new numbered file in `supabase/migrations/` (e.g. `20261101000000_my_change.sql`), larger than the last one, wrapped in `begin;` / `commit;`.

---

## Deployment

Deployed on Vercel with automatic CI/CD from GitHub.

**Production URL:** https://pokemonshinytracker.vercel.app/

### Deploy Your Own

1. Fork this repository
2. Create accounts on:
   - [Clerk](https://clerk.com) - Authentication
   - [Supabase](https://supabase.com) - Database
   - [Vercel](https://vercel.com) - Hosting
3. Set up environment variables in Vercel
4. Deploy!

---

## Database Schema

The tables live in Supabase (PostgreSQL). Run the SQL files at the root of the repository in the Supabase SQL editor, in this order:

1. `supabase_setup.sql` - creates `shiny_pokemon` and `user_preferences`, enables RLS
2. `supabase_migrations.sql` - history of migrations (adds `display_name`, removes old policies, creates `pokemon_forms`). Read it before running: it is a log, not a single script
3. `supabase_migration_trainer_id.sql` - adds `trainer_id` to `user_preferences`
4. `supabase_community_feed.sql` - **documentation** of the `community_feed` table as it exists in the real database; do not run it as is on an existing database (some parts are marked "à compléter")

Tables:

| Table | Content |
|---|---|
| `shiny_pokemon` | Shiny Pokémon caught by each player (`user_id`, `pokemon_id`, `caught_at`) |
| `user_preferences` | Language, owned games, display name, trainer ID |
| `pokemon_forms` | Forms of a Pokémon marked shiny or favorite (`pokemon_id`, `form_id`) |
| `community_feed` | Public feed of the latest catches (`trainer_id`, `pokemon_id`, `caught_at`) |

**Note:** RLS is enabled, and there is no access policy on the player data tables: only the backend (service role key) can access them. See "Security Architecture".

---

## 📈 Roadmap Technique

### Phase 2 : Optimisation ✅ COMPLETE
- [x] Backend API (Vercel Functions)
- [x] RLS Supabase activé (sans politique : accès direct bloqué, seul le backend lit et écrit)
- [x] Authentification JWT sécurisée
- [x] Migration données localStorage → Supabase
- [ ] Sync temps réel (infrastructure prête)
- [ ] Tests automatisés

### Phase 3 : Scaling (Si succès)

- [ ] SEO optimisé
- [ ] Analytics avancées
- [ ] Rate limiting
- [ ] CDN pour sprites

---

## 🐛 Problèmes Connus

### Pas de Sync Temps Réel
- **Issue :** Changements nécessitent refresh manuel
- **Impact :** UX légèrement dégradée
- **Solution :** Infrastructure prête (Supabase Realtime), à activer dans Phase 3

### Erreurs de cookies sur .vercel.app
- **Issue :** Cookies `__clerk_test_etld` et `__cf_bm` rejetés dans la console
- **Impact :** Aucun - erreurs cosmétiques sans effet sur le fonctionnement
- **Cause :** `.vercel.app` est sur la Public Suffix List
- **Solution :** Utiliser un domaine personnalisé (optionnel)

---

## 📝 Notes de Développement

### Structure Actuelle
```
PokeTracker/
├── api/            (Vercel serverless functions)
│   ├── _lib/       (shared utilities: auth, supabase, validate)
│   ├── public/     (endpoints sans authentification: feed, profil public)
│   ├── shinies.ts  (shiny Pokemon CRUD)
│   ├── pokemon-forms.ts (formes de Pokémon)
│   ├── preferences.ts (user preferences)
│   ├── trainer-id.ts (identifiant de dresseur)
│   └── user-data.ts (GDPR deletion)
├── components/     (composants React)
├── contexts/       (contextes React)
├── data/          (données statiques)
├── hooks/         (React hooks)
├── i18n/          (traductions)
├── public/        (fichiers statiques: icônes, sitemap, assets)
├── scripts/       (scripts utilitaires de maintenance)
├── services/      (API client layer)
├── supabase_*.sql (scripts de base de données, voir Database Schema)
├── App.tsx        (composant principal)
├── index.tsx      (point d'entrée)
└── index.html     (HTML)
```

### Dépendances Principales
- React 19
- TypeScript
- Tailwind CSS (via PostCSS)
- Clerk (auth)
- Supabase (database)
- Vite (build tool)
- Vercel (serverless functions)

### Développement Local

**Frontend uniquement** (sans API):
```bash
npm run dev
```

**Avec API routes** (recommandé):
```bash
# Installer Vercel CLI globalement
npm install -g vercel

# Lier le projet et récupérer les variables d'environnement
vercel link
vercel env pull .env.local

# Lancer le serveur de développement
npm run vercel:dev
```

> **Note:** Les API routes (`/api/*`) nécessitent Vercel CLI pour fonctionner en local.

### Variables d'Environnement
```env
# Frontend
VITE_CLERK_PUBLISHABLE_KEY=...
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...

# Backend (Vercel only)
SUPABASE_SERVICE_ROLE_KEY=...
CLERK_SECRET_KEY=...
```

---

## 🎯 Pour Contribuer

1. Fork le projet
2. Créez une branche (`git checkout -b feature/AmazingFeature`)
3. Committez (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

---

---

## 🙏 Remerciements

- Sprites Pokémon : [PokéAPI](https://pokeapi.co/)
- Authentification : [Clerk](https://clerk.com)
- Base de données : [Supabase](https://supabase.com)
- Hébergement : [Vercel](https://vercel.com)
- Communauté Pokémon ❤️

---



---

**Bon Shiny Hunting! ✨**
