

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import LoginScreen from './components/LoginScreen';
import ShinyTracker from './components/ShinyTracker';
import { POKEMON_LIST as BASE_POKEMON_LIST } from './data/pokemon';
import type { Pokemon, User } from './types';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';

const AppContent = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { getPokemonName, t } = useLanguage();

  const pokemonList: Pokemon[] = useMemo(() => {
    return BASE_POKEMON_LIST.map(pokemon => ({
        ...pokemon,
        name: getPokemonName(pokemon.id),
    }));
  }, [getPokemonName]);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('shinyTrackerUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('shinyTrackerUser');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogin = useCallback((username: string) => {
    const newUser: User = { username };
    try {
      localStorage.setItem('shinyTrackerUser', JSON.stringify(newUser));
      setUser(newUser);
    } catch (error) {
      console.error("Failed to save user to localStorage", error);
    }
  }, []);

  const handleLogout = useCallback(() => {
    try {
      localStorage.removeItem('shinyTrackerUser');
      setUser(null);
    } catch (error) {
      console.error("Failed to remove user from localStorage", error);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-2xl font-bold text-yellow-400">{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {user ? (
        <ShinyTracker user={user} onLogout={handleLogout} pokemonList={pokemonList} />
      ) : (
        <LoginScreen onLogin={handleLogin} />
      )}
    </div>
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