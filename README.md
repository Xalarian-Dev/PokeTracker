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

## Roadmap

### MVP (Current) ✅
- [x] Basic shiny tracking
- [x] Cloud storage
- [x] Authentication
- [x] Multi-language support
- [x] Deployment

### Future Enhancements
- [ ] Backend API with proper RLS
- [ ] Real-time sync between tabs
- [ ] Statistics dashboard
- [ ] Import/Export data
- [ ] Social features (share collections)
- [ ] Mobile app (React Native)
- [ ] Shiny hunting guides integration

---

## Contributing

Contributions welcome! Please open an issue first to discuss proposed changes.

---

## License

MIT License - See LICENSE file for details

---

## Acknowledgments

- Pokémon sprites from [PokéAPI](https://pokeapi.co/)
- Built with ❤️ by the Pokémon community

---

## Support

For issues or questions:
- Open a GitHub issue
- Contact: [your-email@example.com]

**Happy Shiny Hunting! ✨**
