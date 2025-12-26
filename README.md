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

## 📊 Vérification des Données Pokémon

### Génération 1
**Paires de jeux :**
- [x] **Rouge/Bleu** - Vérifier Pokédex Kanto (151)
- [x] **Rouge/Bleu** - Vérifier exclusifs de version

**Standalone :**
- [ ] **Jaune** - Vérifier Pokédex Kanto (151)

### Génération 2
**Paires de jeux :**
- [ ] **Or/Argent** - Vérifier Pokédex Johto (251)
- [ ] **Or/Argent** - Vérifier exclusifs de version

**Standalone :**
- [ ] **Cristal** - Vérifier Pokédex Johto (251)
- [ ] **Cristal** - Vérifier Pokémon exclusifs

### Génération 3
**Paires de jeux :**
- [ ] **Rubis/Saphir** - Vérifier Pokédex Hoenn (386)
- [ ] **Rubis/Saphir** - Vérifier exclusifs de version
- [ ] **Rouge Feu/Vert Feuille** - Vérifier Pokédex Kanto (386)
- [ ] **Rouge Feu/Vert Feuille** - Vérifier exclusifs de version
- [ ] **Rouge Feu/Vert Feuille** - Vérifier Pokémon post-game (Îles Sevii)

**Standalone :**
- [ ] **Émeraude** - Vérifier Pokédex Hoenn (386)
- [ ] **Émeraude** - Vérifier Pokémon exclusifs

### Génération 4
**Paires de jeux :**
- [ ] **Diamant/Perle** - Vérifier Pokédex Sinnoh (493)
- [ ] **Diamant/Perle** - Vérifier exclusifs de version
- [ ] **Or HeartGold/Argent SoulSilver** - Vérifier Pokédex Johto (493)
- [ ] **HGSS** - Vérifier exclusifs de version
- [ ] **HGSS** - Vérifier légendaires post-game (Kanto)

**Standalone :**
- [ ] **Platine** - Vérifier Pokédex Sinnoh (493)
- [ ] **Platine** - Vérifier Pokémon exclusifs
- [ ] **Platine** - Vérifier légendaires post-game (Giratina, etc.)

### Génération 5
**Paires de jeux :**
- [ ] **Noir/Blanc** - Vérifier Pokédex Unys (649)
- [ ] **Noir/Blanc** - Vérifier exclusifs de version
- [ ] **Noir 2/Blanc 2** - Vérifier Pokédex Unys étendu (649)
- [ ] **Noir 2/Blanc 2** - Vérifier exclusifs de version
- [ ] **Noir 2/Blanc 2** - Vérifier légendaires post-game

### Génération 6
**Paires de jeux :**
- [ ] **X/Y** - Vérifier Pokédex Kalos (721)
- [ ] **X/Y** - Vérifier exclusifs de version
- [ ] **X/Y** - Vérifier légendaires post-game
- [ ] **Rubis Oméga/Saphir Alpha** - Vérifier Pokédex Hoenn (721)
- [ ] **ROSA** - Vérifier exclusifs de version
- [ ] **ROSA** - Vérifier légendaires post-game (Portails dimensionnels)

### Génération 7
**Paires de jeux :**
- [ ] **Soleil/Lune** - Vérifier Pokédex Alola (802)
- [ ] **Soleil/Lune** - Vérifier exclusifs de version
- [ ] **Soleil/Lune** - Vérifier Ultra-Chimères post-game
- [ ] **Ultra-Soleil/Ultra-Lune** - Vérifier Pokédex Alola étendu (807)
- [ ] **USUL** - Vérifier exclusifs de version
- [ ] **USUL** - Vérifier légendaires (Ultra-Brèche)

**Standalone :**
- [ ] **Let's Go Pikachu/Évoli** - Vérifier Pokédex Kanto (153)
- [ ] **LGPE** - Vérifier exclusifs de version

### Génération 8
**Paires de jeux :**
- [ ] **Épée/Bouclier** - Vérifier Pokédex Galar base (400)
- [ ] **Épée/Bouclier** - Vérifier exclusifs de version
- [ ] **Épée/Bouclier** - Vérifier légendaires post-game
- [ ] **Diamant Étincelant/Perle Scintillante** - Vérifier Pokédex Sinnoh (493)
- [ ] **DEPS** - Vérifier exclusifs de version

**DLC :**
- [ ] **Épée/Bouclier - Isolarmure** - Vérifier nouveaux Pokémon DLC1
- [ ] **Isolarmure** - Vérifier exclusifs DLC1
- [ ] **Épée/Bouclier - Couronneige** - Vérifier nouveaux Pokémon DLC2
- [ ] **Couronneige** - Vérifier exclusifs DLC2
- [ ] **Couronneige** - Vérifier légendaires (Dynamax Adventures)

**Standalone :**
- [ ] **Légendes Pokémon : Arceus** - Vérifier Pokédex Hisui (242)

### Génération 9
**Paires de jeux :**
- [ ] **Écarlate/Violet** - Vérifier Pokédex Paldea base (400)
- [ ] **Écarlate/Violet** - Vérifier exclusifs de version
- [ ] **Écarlate/Violet** - Vérifier légendaires/paradoxes

**DLC :**
- [ ] **Écarlate/Violet - Trésor Enfoui** - Vérifier nouveaux Pokémon DLC1
- [ ] **Trésor Enfoui** - Vérifier exclusifs DLC1
- [ ] **Écarlate/Violet - Indigo** - Vérifier nouveaux Pokémon DLC2
- [ ] **Indigo** - Vérifier exclusifs DLC2

---

## 📈 Roadmap Technique


### Phase 2 : Optimisation
- [ ] Backend API (Vercel Functions)
- [ ] RLS Supabase activé
- [ ] Sync temps réel
- [ ] Tests automatisés

### Phase 3 : Scaling (Si succès)

- [ ] SEO optimisé
- [ ] Analytics avancées
- [ ] Rate limiting
- [ ] CDN pour sprites





---



## 🐛 Problèmes Connus

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
└── index.html      (HTML)
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



---

**Bon Shiny Hunting! ✨**
