
import React, { useState, useEffect, useMemo, useRef, useLayoutEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import type { Pokemon, User } from '../types';
import Header from './Header';
import SearchBar from './SearchBar';
import PokemonCard from './PokemonCard';
import RandomHuntSidePanel from './RandomHuntSidePanel';
import ConfirmationModal from './ConfirmationModal';
import { POKEMON_AVAILABILITY, GAME_GROUP_MAP } from '../data/games';
import { useLanguage } from '../contexts/LanguageContext';
import {
  fetchShinyPokemon,
  addShinyPokemon,
  removeShinyPokemon,
  subscribeToShinyChanges,
  migrateLocalStorageToSupabase,
  getUserPreferences
} from '../services/supabase';

interface ShinyTrackerProps {
  user: User | null;
  onLogout: () => void;
  onLoginClick?: () => void;
  onProfileClick?: () => void;
  pokemonList: Pokemon[];
}

const ShinyTracker: React.FC<ShinyTrackerProps> = ({ user, onLogout, onLoginClick, onProfileClick, pokemonList }) => {
  const { user: clerkUser } = useUser();
  const [shinyPokemons, setShinyPokemons] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyShiny, setShowOnlyShiny] = useState(false);
  const [showMissingShiny, setShowMissingShiny] = useState(false);
  const [hideRegionalForms, setHideRegionalForms] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<{ type: 'gen' | 'region'; value: string | number } | null>(null);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [scrollTrigger, setScrollTrigger] = useState(0);
  const [isRandomHuntOpen, setIsRandomHuntOpen] = useState(false);
  const [ownedGames, setOwnedGames] = useState<string[]>([]);
  const [displayName, setDisplayName] = useState<string | null>(null);

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, message: '', onConfirm: () => { } });

  const { t } = useLanguage();
  const didMount = useRef(false);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const searchBarInitialTop = useRef(0);
  const realtimeChannelRef = useRef<any>(null);

  const storageKey = user ? `shinyTrackerData_${user.username}` : null;
  const userId = clerkUser?.id;

  useLayoutEffect(() => {
    if (searchBarRef.current) {
      searchBarInitialTop.current = searchBarRef.current.offsetTop;
    }
  }, []);

  useLayoutEffect(() => {
    if (didMount.current) {
      if (searchBarInitialTop.current > 0) {
        const headerHeight = 64;
        const targetScrollY = searchBarInitialTop.current - headerHeight;
        const currentScrollY = window.scrollY || window.pageYOffset;

        // Only scroll if we're below the target position
        if (currentScrollY > targetScrollY) {
          window.scrollTo({
            top: targetScrollY,
            behavior: 'smooth',
          });
        }
      }
    } else {
      didMount.current = true;
    }
  }, [scrollTrigger]);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      if (!userId) {
        // Guest mode: use localStorage
        if (storageKey) {
          try {
            const storedData = localStorage.getItem(storageKey);
            if (storedData) {
              setShinyPokemons(new Set(JSON.parse(storedData)));
            }
          } catch (error) {
            console.error("Failed to load from localStorage", error);
          }
        }
        setLoading(false);
        return;
      }

      // Authenticated: use Supabase
      try {
        const shinies = await fetchShinyPokemon(userId);
        setShinyPokemons(shinies);

        // Load user preferences (owned games)
        const prefs = await getUserPreferences(userId);
        if (prefs && prefs.owned_games) {
          setOwnedGames(prefs.owned_games);
        }
        if (prefs && prefs.display_name) {
          setDisplayName(prefs.display_name);
        }

        // Check for localStorage migration
        if (storageKey) {
          const localData = localStorage.getItem(storageKey);
          if (localData) {
            const localShinyIds = JSON.parse(localData);
            if (localShinyIds.length > 0 && shinies.size === 0) {
              // Prompt for migration
              const shouldMigrate = window.confirm(
                t('migrate_local_data') ||
                "You have local data. Would you like to sync it to the cloud?"
              );

              if (shouldMigrate) {
                await migrateLocalStorageToSupabase(userId, localShinyIds);
                const updatedShinies = await fetchShinyPokemon(userId);
                setShinyPokemons(updatedShinies);
                localStorage.removeItem(storageKey);
              }
            }
          }
        }
      } catch (error) {
        console.error("Failed to load from Supabase", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId, storageKey]);

  // Real-time subscription for authenticated users
  useEffect(() => {
    if (!userId) return;

    const channel = subscribeToShinyChanges(userId, (payload) => {
      console.log('Real-time update:', payload);

      if (payload.eventType === 'INSERT') {
        setShinyPokemons(prev => new Set([...prev, payload.new.pokemon_id]));
      } else if (payload.eventType === 'DELETE') {
        setShinyPokemons(prev => {
          const newSet = new Set(prev);
          newSet.delete(payload.old.pokemon_id);
          return newSet;
        });
      }
    });

    realtimeChannelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, [userId]);

  // Save to localStorage for guests
  useEffect(() => {
    if (!loading && storageKey && !userId) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(Array.from(shinyPokemons)));
      } catch (error) {
        console.error("Failed to save to localStorage", error);
      }
    }
  }, [shinyPokemons, storageKey, loading, userId]);

  const toggleShiny = async (pokemonId: string) => {
    // Guest mode: Allow playing with localStorage
    if (!userId) {
      setShinyPokemons(prev => {
        const newSet = new Set(prev);
        if (newSet.has(pokemonId)) {
          newSet.delete(pokemonId);
        } else {
          newSet.add(pokemonId);
        }
        return newSet;
      });
      return;
    }

    // Authenticated: use Supabase
    try {
      const isCurrentlyShiny = shinyPokemons.has(pokemonId);

      if (isCurrentlyShiny) {
        // Optimistic update
        setShinyPokemons(prev => {
          const newSet = new Set(prev);
          newSet.delete(pokemonId);
          return newSet;
        });

        await removeShinyPokemon(userId, pokemonId);
      } else {
        // Optimistic update
        setShinyPokemons(prev => new Set([...prev, pokemonId]));

        await addShinyPokemon(userId, pokemonId);
      }
    } catch (error) {
      console.error('Error toggling shiny:', error);
      // Revert optimistic update on error
      const shinies = await fetchShinyPokemon(userId);
      setShinyPokemons(shinies);
    }
  };

  const filteredPokemon = useMemo(() => {
    return pokemonList.filter(pokemon => {
      const matchesFilter = !activeFilter ||
        (activeFilter.type === 'gen' && pokemon.generation === activeFilter.value) ||
        (activeFilter.type === 'region' && pokemon.region === activeFilter.value);

      const matchesSearch = pokemon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pokemon.id.includes(searchTerm);

      const matchesShiny = !showOnlyShiny || shinyPokemons.has(pokemon.id);

      const matchesMissing = !showMissingShiny || !shinyPokemons.has(pokemon.id);

      const matchesRegional = !hideRegionalForms || !pokemon.id.includes('-');

      const matchesGame = selectedGame === null ||
        (POKEMON_AVAILABILITY[pokemon.id] &&
          GAME_GROUP_MAP[selectedGame]?.some(gameKey =>
            POKEMON_AVAILABILITY[pokemon.id].includes(gameKey)
          ));

      return matchesFilter && matchesSearch && matchesShiny && matchesMissing && matchesRegional && matchesGame;
    });
  }, [pokemonList, searchTerm, showOnlyShiny, showMissingShiny, hideRegionalForms, shinyPokemons, activeFilter, selectedGame]);

  const shinyCount = shinyPokemons.size;
  const totalPokemon = pokemonList.length;
  const progress = totalPokemon > 0 ? (shinyCount / totalPokemon) * 100 : 0;

  const handleMarkAll = () => {
    setConfirmModal({
      isOpen: true,
      message: t('mark_all_confirm') || "Are you sure?",
      onConfirm: () => {
        setShinyPokemons(prev => {
          const newSet = new Set(prev);
          filteredPokemon.forEach(p => newSet.add(p.id));
          return newSet;
        });
        setConfirmModal(prev => ({ ...prev, isOpen: false })); // Close modal after action
      }
    });
  };

  const handleUnmarkAll = () => {
    setConfirmModal({
      isOpen: true,
      message: t('unmark_all_confirm') || "Are you sure?",
      onConfirm: () => {
        setShinyPokemons(prev => {
          const newSet = new Set(prev);
          filteredPokemon.forEach(p => newSet.delete(p.id));
          return newSet;
        });
        setConfirmModal(prev => ({ ...prev, isOpen: false })); // Close modal after action
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white relative">
      <Header user={user} onLogout={onLogout} onLoginClick={onLoginClick} onProfileClick={onProfileClick} displayName={displayName} />

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        message={confirmModal.message}
      />

      <RandomHuntSidePanel
        pokemonList={pokemonList}
        shinyPokemons={shinyPokemons}
        isOpen={isRandomHuntOpen}
        onOpen={() => setIsRandomHuntOpen(true)}
        onClose={() => setIsRandomHuntOpen(false)}
        userId={userId}
        ownedGames={ownedGames}
      />

      <main className={`container mx-auto px-4 py-8 transition-all duration-300 ${isRandomHuntOpen || confirmModal.isOpen ? 'blur-sm pointer-events-none select-none' : ''}`}>
        <div className="bg-gray-800 rounded-lg p-6 mb-8 shadow-lg">
          <h2 className="text-2xl font-bold">{t('shinydex_progress')}</h2>
          <p className="text-gray-400">{shinyCount} / {totalPokemon} {t('shiny_pokemon_caught')}</p>
          <div className="w-full bg-gray-700 rounded-full h-4 mt-4 overflow-hidden">
            <div
              className="bg-yellow-400 h-4 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <SearchBar
          ref={searchBarRef}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          showOnlyShiny={showOnlyShiny}
          setShowOnlyShiny={setShowOnlyShiny}
          showMissingShiny={showMissingShiny}
          setShowMissingShiny={setShowMissingShiny}
          hideRegionalForms={hideRegionalForms}
          setHideRegionalForms={setHideRegionalForms}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          selectedGame={selectedGame}
          setSelectedGame={setSelectedGame}
          onMajorFilterChange={() => setScrollTrigger(st => st + 1)}
        />

        {!loading && filteredPokemon.length > 0 && (
          <div className="mb-4 px-1 flex flex-col sm:flex-row justify-between items-end sm:items-center gap-4">
            <div className="text-gray-400 text-sm">
              {t('pokemon_shown', { count: filteredPokemon.length })}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleMarkAll}
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded shadow transition-colors"
              >
                {t('mark_all')}
              </button>
              <button
                onClick={handleUnmarkAll}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs font-bold rounded shadow transition-colors"
              >
                {t('unmark_all')}
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <p className="text-center mt-8">{t('trainer_data_loading')}</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {filteredPokemon.map(pokemon => (
              <PokemonCard
                key={pokemon.id}
                pokemon={pokemon}
                isShiny={shinyPokemons.has(pokemon.id)}
                onToggleShiny={toggleShiny}
                selectedGame={selectedGame}
              />
            ))}
          </div>
        )}

        {!loading && filteredPokemon.length === 0 && (
          <div className="text-center py-16">
            <p className="text-xl text-gray-500">{t('no_pokemon_found')}</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default ShinyTracker;
