
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import LoginScreen from './components/LoginScreen';
import ShinyTracker from './components/ShinyTracker';
import { POKEMON_LIST as BASE_POKEMON_LIST } from './data/pokemon';
import type { Pokemon, User } from './types';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';

import { authService } from './services/auth';

const AppContent = () => {
  const [user, setUser] = useState<User | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { getPokemonName, t } = useLanguage();

  const pokemonList: Pokemon[] = useMemo(() => {
    return BASE_POKEMON_LIST.map(pokemon => ({
      ...pokemon,
      name: getPokemonName(pokemon.id),
    }));
  }, [getPokemonName]);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const handleLogin = useCallback((user: User) => {
    setUser(user);
    setShowLogin(false);
  }, []);

  const handleLogout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  if (showLogin) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <ShinyTracker
      user={user}
      onLogout={handleLogout}
      onLoginClick={() => setShowLogin(true)}
      pokemonList={pokemonList}
    />
  );
};


const App = () => {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
};

export default App;