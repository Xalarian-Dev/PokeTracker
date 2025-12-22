import React, { useState, useCallback, useMemo } from 'react';
import { ClerkProvider, SignedIn, SignedOut, useUser } from '@clerk/clerk-react';
import LoginScreen from './components/LoginScreen';
import ShinyTracker from './components/ShinyTracker';
import { POKEMON_LIST as BASE_POKEMON_LIST } from './data/pokemon';
import type { Pokemon, User } from './types';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { clerkPublishableKey, clerkAppearance } from './clerk-config';

const AppContent = () => {
  const { user: clerkUser, isLoaded } = useUser();
  const [showLogin, setShowLogin] = useState(false);
  const { getPokemonName } = useLanguage();

  // Convert Clerk user to our User type
  const user: User | null = useMemo(() => {
    if (!clerkUser) return null;
    return {
      email: clerkUser.primaryEmailAddress?.emailAddress || '',
      username: clerkUser.username || clerkUser.firstName || clerkUser.id,
      passwordHash: '', // Not needed with Clerk
    };
  }, [clerkUser]);

  const pokemonList: Pokemon[] = useMemo(() => {
    return BASE_POKEMON_LIST.map(pokemon => ({
      ...pokemon,
      name: getPokemonName(pokemon.id),
    }));
  }, [getPokemonName]);

  const handleLogout = useCallback(() => {
    // Clerk handles logout via SignOutButton in Header
    setShowLogin(false);
  }, []);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <>
      <SignedOut>
        {showLogin ? (
          <LoginScreen onLogin={() => setShowLogin(false)} />
        ) : (
          <ShinyTracker
            user={null}
            onLogout={handleLogout}
            onLoginClick={() => setShowLogin(true)}
            pokemonList={pokemonList}
          />
        )}
      </SignedOut>

      <SignedIn>
        <ShinyTracker
          user={user}
          onLogout={handleLogout}
          onLoginClick={() => setShowLogin(true)}
          pokemonList={pokemonList}
        />
      </SignedIn>
    </>
  );
};


const App = () => {
  return (
    <ClerkProvider
      publishableKey={clerkPublishableKey}
      appearance={clerkAppearance}
    >
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ClerkProvider>
  );
};

export default App;