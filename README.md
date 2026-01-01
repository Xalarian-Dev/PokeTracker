# PokeTracker 🎮✨

A modern, cloud-based Pokémon Shiny Tracker built with React, Clerk, and Supabase.

**Live Demo:** https://poke-tracker-omega.vercel.app/

---

## Features

- ✅ **Cloud Storage** - Your shiny collection synced across devices
- ✅ **Secure Authentication** - Powered by Clerk
- ✅ **Guest Mode** - Try it out without signing up (localStorage)
- ✅ **Multi-language** - English, French, Japanese
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
- **Real-time:** Supabase Realtime (disabled in MVP)

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/PokeTracker.git
cd PokeTracker

# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local
# Add your Clerk and Supabase keys

# Run development server
npm run dev
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

### Current Implementation (Production-Ready)

**Authentication:** ✅ Secured by Clerk with JWT verification  
**Data Isolation:** ✅ Server-side enforcement via backend API  
**Row Level Security (RLS):** ✅ Enabled on all Supabase tables  
**API Layer:** ✅ Vercel serverless functions with authentication

### Security Features

1. **Backend API Layer**
   - All database operations go through authenticated API endpoints
   - Clerk JWT tokens verified on every request
   - User ID extracted from verified token, not from client input

2. **Row Level Security (RLS)**
   - Enabled on `shiny_pokemon` and `user_preferences` tables
   - Defense-in-depth: Even if anon key is exposed, RLS prevents unauthorized access
   - Policies ensure users can only access their own data

3. **Service Role Isolation**
   - Backend uses service role key (never exposed to frontend)
   - Frontend uses anon key with RLS restrictions
   - Clear separation of concerns

---

## Deployment

Deployed on Vercel with automatic CI/CD from GitHub.

**Production URL:** https://poke-tracker-omega.vercel.app/

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

```sql
CREATE TABLE shiny_pokemon (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  pokemon_id TEXT NOT NULL,
  caught_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, pokemon_id)
);

CREATE INDEX idx_shiny_pokemon_user_id ON shiny_pokemon(user_id);
```

**Note:** RLS is currently disabled. See Security Considerations above.

---

## 📈 Roadmap Technique

### Phase 2 : Optimisation ✅ COMPLETE
- [x] Backend API (Vercel Functions)
- [x] RLS Supabase activé
- [ ] Sync temps réel
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

---

## 📝 Notes de Développement

### Structure Actuelle
```
PokeTracker/
├── api/            (Vercel serverless functions)
│   ├── _lib/       (shared utilities)
│   ├── shinies.ts  (shiny Pokemon CRUD)
│   ├── preferences.ts (user preferences)
│   └── user-data.ts (GDPR deletion)
├── components/     (composants React)
├── contexts/       (contextes React)
├── data/          (données statiques)
├── hooks/         (React hooks)
├── i18n/          (traductions)
├── services/      (API client layer)
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
