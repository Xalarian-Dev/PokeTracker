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
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## Security Considerations

### Current Implementation (MVP)

**Authentication:** ✅ Secured by Clerk  
**Data Isolation:** ⚠️ Client-side filtering by `user_id`  
**Row Level Security (RLS):** ❌ Disabled for MVP simplicity

### Known Limitations

- **Theoretical Risk:** A malicious user with browser console access could modify requests to access other users' data
- **Practical Risk:** Very low - requires technical knowledge, effort disproportionate to gain (Pokémon shiny data)
- **Acceptable for:** Personal use, small communities, non-sensitive data
- **Not acceptable for:** Banking, e-commerce, medical records, PII

### Why This Is OK for MVP

1. **Non-sensitive data** - Just Pokémon IDs, no personal information
2. **Niche audience** - Pokémon players, not a target for attacks
3. **Clerk authentication** - Only authenticated users can access the app
4. **Low incentive** - No financial or privacy gain from exploiting

### Future Security Improvements

When scaling to production:

1. **Add Backend API** (Vercel Serverless Functions)
   ```
   Client → Vercel Function → Validate Clerk JWT → Supabase
   ```

2. **Enable Row Level Security (RLS)**
   - Validate user identity server-side
   - Enforce data isolation at database level

3. **Rate Limiting**
   - Prevent abuse and DDoS

4. **Audit Logging**
   - Track suspicious activity

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

## 🚀 Prochaines étapes (optionnel)

### Court terme
- Partagez avec des amis pour tester
- Récoltez des retours utilisateurs
- Corrigez les bugs éventuels

### Moyen terme
- Migrez vers Vite propre (voir [MIGRATION.md](./MIGRATION.md))
- Activez RLS avec backend Vercel Functions
- Ajoutez des statistiques (graphiques, historique)

### Long terme
- Passez à Next.js pour SEO + backend intégré
- Ajoutez des fonctionnalités sociales
- Créez une app mobile (React Native)

---

## 📈 Roadmap Technique

### Phase 1 : MVP (Actuel) ✅
- [x] Authentification Clerk
- [x] Base de données Supabase
- [x] Déploiement Vercel
- [x] Multi-langue (FR/EN/JP)
- [x] Filtres avancés
- [x] Random Hunt

### Phase 2 : Optimisation (Futur)
- [ ] Migration Vite propre (retire CDN Tailwind)
- [ ] Backend API (Vercel Functions)
- [ ] RLS Supabase activé
- [ ] Sync temps réel
- [ ] Tests automatisés

### Phase 3 : Scaling (Si succès)
- [ ] Migration Next.js
- [ ] SEO optimisé
- [ ] Analytics avancées
- [ ] Rate limiting
- [ ] CDN pour sprites

---

## 🔧 Guide de Migration Vite

**Quand migrer ?** Quand vous voulez retirer le CDN Tailwind et avoir un build optimisé.

**Durée estimée :** 2-3 heures

**Guide complet :** Voir [VITE_MIGRATION_GUIDE.md](./.gemini/antigravity/brain/3d93079d-4368-4fc7-a27b-7e00999947e1/vite_migration_guide.md)

**Résumé des étapes :**
1. Créer nouveau projet Vite
2. Installer dépendances (Tailwind, Clerk, Supabase)
3. Copier votre code
4. Configurer Tailwind proprement
5. Tester et déployer

**Bénéfices :**
- ✅ CSS optimisé (~10 KB vs 3 MB)
- ✅ Pas de warning CDN
- ✅ Structure standard
- ✅ Meilleur DX

---

## 🐛 Problèmes Connus

### Tailwind CDN
- **Issue :** Warning "CDN should not be used in production"
- **Impact :** Cosmétique uniquement, pas d'impact performance réel
- **Solution :** Acceptable pour MVP, migrer vers Vite plus tard

### RLS Désactivé
- **Issue :** Row Level Security désactivé dans Supabase
- **Impact :** Sécurité côté client uniquement
- **Risque :** Très faible (données non-sensibles, petit public)
- **Solution :** Acceptable pour MVP, activer avec backend plus tard

### Pas de Sync Temps Réel
- **Issue :** Changements nécessitent refresh manuel
- **Impact :** UX légèrement dégradée
- **Solution :** Acceptable pour usage personnel/petit groupe

---

## 📝 Notes de Développement

### Structure Actuelle
```
PokeTracker/
├── components/       (composants React)
├── contexts/        (contextes React)
├── data/           (données statiques)
├── i18n/           (traductions)
├── services/       (API Clerk/Supabase)
├── App.tsx         (composant principal)
├── index.tsx       (point d'entrée)
└── index.html      (HTML + CDN Tailwind)
```

### Dépendances Principales
- React 19
- TypeScript
- Tailwind CSS (via CDN)
- Clerk (auth)
- Supabase (database)
- Vite (build tool)

### Variables d'Environnement
```env
VITE_CLERK_PUBLISHABLE_KEY=...
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

---

## 🎯 Pour Contribuer

1. Fork le projet
2. Créez une branche (`git checkout -b feature/AmazingFeature`)
3. Committez (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

---

## 📄 License

MIT License - Voir [LICENSE](LICENSE) pour détails

---

## 🙏 Remerciements

- Sprites Pokémon : [PokéAPI](https://pokeapi.co/)
- Authentification : [Clerk](https://clerk.com)
- Base de données : [Supabase](https://supabase.com)
- Hébergement : [Vercel](https://vercel.com)
- Communauté Pokémon ❤️

---

**Bon Shiny Hunting! ✨**
