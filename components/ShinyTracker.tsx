
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';
import type { Pokemon, User } from '../types';
import Header from './Header';
import UnifiedSidePanel from './UnifiedSidePanel';
import PokemonCard from './PokemonCard';
import ConfirmationModal from './ConfirmationModal';
import ScrollToTopButton from './ScrollToTopButton';
import { Button } from './ui';
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
  onProfileClick?: () => void;
  pokemonList: Pokemon[];
}

const ShinyTracker: React.FC<ShinyTrackerProps> = ({ user, onLogout, onProfileClick, pokemonList }) => {
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
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, message: '', onConfirm: () => { } });

  const { t } = useLanguage();
  const didMount = useRef(false);
  const realtimeChannelRef = useRef<any>(null);

  const storageKey = user ? `shinyTrackerData_${user.username}` : null;
  const userId = clerkUser?.id;

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

  // Detect scroll position for scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      // Show button when scrolled down more than 300px
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Block body scroll when random hunt modal is open
  useEffect(() => {
    if (isRandomHuntOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isRandomHuntOpen]);

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

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };


  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <Header user={user} onLogout={onLogout} onProfileClick={onProfileClick} displayName={displayName} />

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        message={confirmModal.message}
      />

      {/* Unified Side Panel with Tabs */}
      <UnifiedSidePanel
        shinyCount={shinyCount}
        totalPokemon={totalPokemon}
        progress={progress}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        selectedGame={selectedGame}
        setSelectedGame={setSelectedGame}
        showOnlyShiny={showOnlyShiny}
        setShowOnlyShiny={setShowOnlyShiny}
        showMissingShiny={showMissingShiny}
        setShowMissingShiny={setShowMissingShiny}
        hideRegionalForms={hideRegionalForms}
        setHideRegionalForms={setHideRegionalForms}
        onMajorFilterChange={() => setScrollTrigger(st => st + 1)}
        pokemonList={pokemonList}
        shinyPokemons={shinyPokemons}
        userId={userId}
        ownedGames={ownedGames}
        isRandomHuntOpen={isRandomHuntOpen}
        onRandomHuntOpen={() => setIsRandomHuntOpen(true)}
        onRandomHuntClose={() => setIsRandomHuntOpen(false)}
      />

      {/* Main Layout: Full Width Content */}
      <div className={`flex flex-1 overflow-hidden ${confirmModal.isOpen ? 'blur-sm pointer-events-none select-none' : ''}`}>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 py-6">
            {/* Search Bar */}
            <div className="mb-6 max-w-[1200px] mx-auto px-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder={t('search_placeholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 text-base border border-gray-600 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-poke-yellow focus:border-transparent"
                />
              </div>
            </div>

            {/* Action Buttons */}
            {!loading && filteredPokemon.length > 0 && (
              <div className="mb-4 max-w-[1200px] mx-auto px-4">
                <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center gap-4">
                  <div className="text-gray-400 text-sm">
                    {t('pokemon_shown', { count: filteredPokemon.length })}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleMarkAll}
                      variant="secondary"
                      size="sm"
                    >
                      {t('mark_all')}
                    </Button>
                    <Button
                      onClick={handleUnmarkAll}
                      variant="ghost"
                      size="sm"
                    >
                      {t('unmark_all')}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Pokemon Grid */}
            {loading ? (
              <p className="text-center mt-8">{t('trainer_data_loading')}</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 max-w-[1200px] mx-auto px-4">
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

            <footer className="text-center py-8 mt-8 border-t border-gray-700">
              <p className="text-xs text-gray-500">{t('pokemon_copyright')}</p>
            </footer>
          </div>
        </main>
      </div>

      {/* Scroll to Top Button */}
      <ScrollToTopButton
        show={showScrollTop}
        onClick={scrollToTop}
        ariaLabel="Scroll to top"
      />

    </div>
  );
};

export default ShinyTracker;
