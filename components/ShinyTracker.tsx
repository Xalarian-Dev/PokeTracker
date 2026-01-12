
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import type { Pokemon, User } from '../types';
import Header from './Header';
import LeftSidebar from './LeftSidebar';
import SearchBarWithProgress from './SearchBarWithProgress';
import PokemonCard from './PokemonCard';
import MobilePokemonCard from './MobilePokemonCard';
import ConfirmationModal from './ConfirmationModal';
import ScrollToTopButton from './ScrollToTopButton';
import { Button } from './ui';
import { Toaster } from './ui';
import { SidebarProvider, Sidebar, SidebarContent, useSidebar } from './ui/sidebar';
import { POKEMON_AVAILABILITY, GAME_GROUP_MAP, SHINY_LOCKED_POKEMON } from '../data/games';
import { useLanguage } from '../contexts/LanguageContext';
import { loadPokemonForms, toggleFormShiny, setFavoriteForm as setFavoriteFormAPI } from '../services/pokemonFormsService';
import {
  fetchShinyPokemon,
  addShinyPokemon,
  removeShinyPokemon,
  subscribeToShinyChanges,
  migrateLocalStorageToSupabase,
  getUserPreferences
} from '../services/supabase';
import { useIsMobile } from '../hooks/use-mobile';

// Custom Sidebar Toggle Button Component
const CustomSidebarToggle = () => {
  const { open, toggleSidebar } = useSidebar();

  return (
    <button
      onClick={toggleSidebar}
      className="hidden md:flex absolute -right-12 top-1/2 -translate-y-1/2 h-24 w-12 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-r-lg items-center justify-center text-white shadow-lg transition-all"
      aria-label={open ? "Fermer le panneau" : "Ouvrir le panneau"}
    >
      <svg
        className={`w-6 h-6 transition-transform ${open ? 'rotate-180' : ''}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
};

// Mobile Sidebar Toggle Button - Fixed position
// Mobile Sidebar Toggle Button - Fixed position
const MobileSidebarToggle = () => {
  const { toggleSidebar } = useSidebar();

  return (
    <button
      onClick={toggleSidebar}
      className="md:hidden fixed left-0 top-1/2 -translate-y-1/2 h-16 w-10 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-r-lg flex items-center justify-center text-white shadow-lg transition-all z-30"
      aria-label="Toggle sidebar"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  );
};

// Premier Pokémon de chaque génération pour l'auto-scroll
const GENERATION_FIRST_POKEMON: Record<number, number> = {
  1: 1,    // Bulbasaur
  2: 152,  // Chikorita
  3: 252,  // Treecko
  4: 387,  // Turtwig
  5: 494,  // Victini
  6: 650,  // Chespin
  7: 722,  // Rowlet
  8: 810,  // Grookey
  9: 906   // Sprigatito
};

interface ShinyTrackerProps {
  user: User | null;
  onLogout: () => void;
  onProfileClick?: () => void;
  pokemonList: Pokemon[];
}

const ShinyTracker: React.FC<ShinyTrackerProps> = ({ user, onLogout, onProfileClick, pokemonList }) => {
  const { user: clerkUser } = useUser();
  const { getToken, isSignedIn } = useAuth();
  const isMobile = useIsMobile();
  const [shinyPokemons, setShinyPokemons] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyShiny, setShowOnlyShiny] = useState(false);
  const [showMissingShiny, setShowMissingShiny] = useState(false);
  const [hideGrayedPokemon, setHideGrayedPokemon] = useState(false);
  const [hideShinyLocked, setHideShinyLocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<{ type: 'gen' | 'region'; value: string | number } | null>(null);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [scrollTrigger, setScrollTrigger] = useState(0);
  const [isRandomHuntOpen, setIsRandomHuntOpen] = useState(false);
  const [ownedGames, setOwnedGames] = useState<string[]>([]);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // State for Pokémon forms (e.g., Furfrou, Oricorio, Paldean Tauros)
  // Structure: Map<pokemonId, Set<formId>>
  const [validatedForms, setValidatedForms] = useState<Map<string, Set<string>>>(new Map());
  const [shinyForms, setShinyForms] = useState<Map<string, Set<string>>>(new Map());
  // Favorite form to display in main list (Map<pokemonId, formId>)
  const [favoriteForms, setFavoriteForms] = useState<Map<string, string>>(new Map());

  // Refs pour auto-scroll vers sections régionales
  const regionRefs = useRef<Record<string, HTMLDivElement | null>>({
    Alola: null,
    Galar: null,
    Hisui: null,
    Paldea: null
  });

  // Refs pour auto-scroll vers générations
  const genRefs = useRef<Record<number, HTMLDivElement | null>>({
    1: null,
    2: null,
    3: null,
    4: null,
    5: null,
    6: null,
    7: null,
    8: null,
    9: null
  });

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, message: '', onConfirm: () => { } });

  const { t, language } = useLanguage();
  const didMount = useRef(false);
  const realtimeChannelRef = useRef<any>(null);

  const storageKey = user ? `shinyTrackerData_${user.username}` : null;
  const userId = clerkUser?.id;

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      if (!userId || !isSignedIn) {
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

      // Wait for token to be available
      try {
        const token = await getToken();
        if (!token) {
          console.warn('No token available yet, waiting...');
          setLoading(false);
          return;
        }

        // Store getToken function for API calls (always gets fresh token)
        (window as any).__clerk_getToken = getToken;

        // Authenticated: use Supabase
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

        // Load Pokemon forms data
        try {
          const formsData = await loadPokemonForms();

          // Convert shinyForms from Record to Map<string, Set<string>>
          const shinyFormsMap = new Map<string, Set<string>>();
          Object.entries(formsData.shinyForms).forEach(([pokemonId, formIds]) => {
            shinyFormsMap.set(pokemonId, new Set(formIds));
          });
          setShinyForms(shinyFormsMap);

          // Convert favoriteForms from Record to Map<string, string>
          const favoriteFormsMap = new Map<string, string>();
          Object.entries(formsData.favoriteForms).forEach(([pokemonId, formId]) => {
            favoriteFormsMap.set(pokemonId, formId);
          });
          setFavoriteForms(favoriteFormsMap);
        } catch (error) {
          console.error('Error loading Pokemon forms:', error);
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
  }, [userId, storageKey, getToken, isSignedIn]);

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

  // Real-time subscription DISABLED for security
  // Realtime requires permissive RLS policies which would allow anyone with anon_key
  // to read/delete all data. We prioritize security over real-time sync.
  // To re-enable: uncomment this code and apply permissive RLS policies

  // useEffect(() => {
  //   if (!userId) return;

  //   const channel = subscribeToShinyChanges(userId, (payload) => {
  //     console.log('Real-time update:', payload);

  //     if (payload.eventType === 'INSERT') {
  //       setShinyPokemons(prev => new Set([...prev, payload.new.pokemon_id]));
  //     } else if (payload.eventType === 'DELETE') {
  //       console.log('DELETE payload:', payload);
  //       console.log('payload.old:', payload.old);
  //       const pokemonId = payload.old?.pokemon_id;
  //       if (pokemonId) {
  //         setShinyPokemons(prev => {
  //           const newSet = new Set(prev);
  //           newSet.delete(pokemonId);
  //           console.log('Deleted pokemon_id:', pokemonId);
  //           return newSet;
  //         });
  //       } else {
  //         console.error('No pokemon_id in DELETE payload:', payload);
  //       }
  //     }
  //   });

  //   realtimeChannelRef.current = channel;

  //   return () => {
  //     channel.unsubscribe();
  //   };
  // }, [userId]);

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

  // Handler for toggling Pokémon forms (simple shiny toggle like main list)
  const toggleForm = async (pokemonId: string, formId: string, shouldBeShiny: boolean) => {
    const isCurrentlyShiny = shinyForms.get(pokemonId)?.has(formId) || false;

    setShinyForms(prev => {
      const newMap = new Map(prev);
      const existingShiny = newMap.get(pokemonId);
      const shinySet: Set<string> = existingShiny ? new Set(existingShiny as Set<string>) : new Set<string>();

      if (isCurrentlyShiny) {
        // Toggle OFF: remove from shiny
        shinySet.delete(formId);
        if (shinySet.size === 0) {
          newMap.delete(pokemonId);
        } else {
          newMap.set(pokemonId, shinySet);
        }
      } else {
        // Toggle ON: add to shiny
        shinySet.add(formId);
        newMap.set(pokemonId, shinySet);
      }

      return newMap;
    });

    // Persist to database
    await toggleFormShiny(pokemonId, formId, !isCurrentlyShiny);
  };

  // Handler for setting favorite form (which form to display in main list)
  const setFavoriteForm = async (pokemonId: string, formId: string) => {
    // Update local state
    setFavoriteForms(prev => {
      const newMap = new Map(prev);
      newMap.set(pokemonId, formId);
      return newMap;
    });

    // Persist to database
    await setFavoriteFormAPI(pokemonId, formId);
  };


  // Fonction pour déterminer si un Pokémon doit être grisé
  const isPokemonFiltered = React.useCallback((pokemon: Pokemon): boolean => {
    // Recherche par nom ou ID
    const matchesSearch = pokemon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pokemon.id.toString().includes(searchTerm);

    // Filtre par génération
    const matchesGen = !activeFilter || activeFilter.type !== 'gen' || pokemon.generation === activeFilter.value;

    // Filtre par région
    const matchesRegion = !activeFilter || activeFilter.type !== 'region' || pokemon.region === activeFilter.value;

    // Filtre par jeu
    const matchesGame = !selectedGame || (
      POKEMON_AVAILABILITY[pokemon.id] &&
      POKEMON_AVAILABILITY[pokemon.id].some(gameCode => {
        const groupGames = GAME_GROUP_MAP[selectedGame];
        return groupGames ? groupGames.includes(gameCode) : gameCode === selectedGame;
      })
    );

    // Filtre "Shiny uniquement"
    const matchesShinyFilter = !showOnlyShiny || shinyPokemons.has(pokemon.id);

    // Filtre "Manquants uniquement"
    const matchesMissingFilter = !showMissingShiny || !shinyPokemons.has(pokemon.id);

    // Filtre "Hide Shiny Locked"
    const matchesShinyLockedFilter = !hideShinyLocked || !selectedGame || !(SHINY_LOCKED_POKEMON[selectedGame] || []).includes(pokemon.id);

    // Retourne TRUE si le Pokémon doit être GRISÉ (ne matche PAS les filtres)
    return !(matchesSearch && matchesGen && matchesRegion && matchesGame && matchesShinyFilter && matchesMissingFilter && matchesShinyLockedFilter);
  }, [searchTerm, activeFilter, selectedGame, showOnlyShiny, showMissingShiny, shinyPokemons, hideShinyLocked]);

  // Organiser les Pokémon pour l'affichage
  const displayedPokemon = useMemo(() => {
    // Séparer normaux et régionaux
    const normalPokemon = pokemonList.filter(p => !p.region);
    const regionalPokemon = pokemonList.filter(p => p.region);

    // Grouper régionaux par région
    const regionalByRegion = {
      Alola: regionalPokemon.filter(p => p.region === 'Alola'),
      Galar: regionalPokemon.filter(p => p.region === 'Galar'),
      Hisui: regionalPokemon.filter(p => p.region === 'Hisui'),
      Paldea: regionalPokemon.filter(p => p.region === 'Paldea')
    };

    // Si searchTerm est actif, masquer les cartes au lieu de les griser
    const shouldHide = hideGrayedPokemon || searchTerm.trim() !== '';

    return {
      normal: normalPokemon.map(p => ({ ...p, isGrayedOut: isPokemonFiltered(p) })).filter(p => !shouldHide || !p.isGrayedOut),
      regional: {
        Alola: regionalByRegion.Alola.map(p => ({ ...p, isGrayedOut: isPokemonFiltered(p) })).filter(p => !shouldHide || !p.isGrayedOut),
        Galar: regionalByRegion.Galar.map(p => ({ ...p, isGrayedOut: isPokemonFiltered(p) })).filter(p => !shouldHide || !p.isGrayedOut),
        Hisui: regionalByRegion.Hisui.map(p => ({ ...p, isGrayedOut: isPokemonFiltered(p) })).filter(p => !shouldHide || !p.isGrayedOut),
        Paldea: regionalByRegion.Paldea.map(p => ({ ...p, isGrayedOut: isPokemonFiltered(p) })).filter(p => !shouldHide || !p.isGrayedOut)
      }
    };
  }, [pokemonList, searchTerm, activeFilter, selectedGame, showOnlyShiny, showMissingShiny, shinyPokemons, hideGrayedPokemon, isPokemonFiltered]);

  // Compter les Pokémon actifs (non-grisés)
  const activeCount = useMemo(() => {
    const normalActive = displayedPokemon.normal.filter(p => !p.isGrayedOut).length;
    const regionalActive = Object.values(displayedPokemon.regional)
      .flat()
      .filter((p: any) => !p.isGrayedOut).length;
    return normalActive + regionalActive;
  }, [displayedPokemon]);

  // Auto-scroll vers section régionale ou génération quand filtre est activé
  useEffect(() => {
    if (activeFilter && activeFilter.type === 'region') {
      // Attendre un tick pour que le DOM soit mis à jour
      setTimeout(() => {
        const element = regionRefs.current[activeFilter.value as string];
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest'
          });
        }
      }, 100);
    } else if (activeFilter && activeFilter.type === 'gen') {
      // Scroll vers le premier Pokémon de la génération
      setTimeout(() => {
        const element = genRefs.current[activeFilter.value as number];
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest'
          });
        }
      }, 100);
    }
  }, [activeFilter]);

  // Re-déclencher le scroll quand hideGrayedPokemon change avec un filtre actif
  useEffect(() => {
    if (activeFilter && (activeFilter.type === 'region' || activeFilter.type === 'gen')) {
      setTimeout(() => {
        if (activeFilter.type === 'region') {
          const element = regionRefs.current[activeFilter.value as string];
          if (element) {
            element.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
              inline: 'nearest'
            });
          }
        } else if (activeFilter.type === 'gen') {
          const element = genRefs.current[activeFilter.value as number];
          if (element) {
            element.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
              inline: 'nearest'
            });
          }
        }
      }, 100);
    }
  }, [hideGrayedPokemon]);

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
          // Pokémon normaux non-grisés
          displayedPokemon.normal
            .filter(p => !p.isGrayedOut)
            .forEach(p => newSet.add(p.id));
          // Pokémon régionaux non-grisés
          Object.values(displayedPokemon.regional)
            .flat()
            .filter((p: any) => !p.isGrayedOut)
            .forEach((p: any) => newSet.add(p.id));
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
          // Pokémon normaux non-grisés
          displayedPokemon.normal
            .filter(p => !p.isGrayedOut)
            .forEach(p => newSet.delete(p.id));
          // Pokémon régionaux non-grisés
          Object.values(displayedPokemon.regional)
            .flat()
            .filter((p: any) => !p.isGrayedOut)
            .forEach((p: any) => newSet.delete(p.id));
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
    <div className="flex min-h-screen w-full flex-col bg-gray-900 text-white">
      {/* Header - Full Width, Outside Sidebar */}
      <Header user={user} onLogout={onLogout} onProfileClick={onProfileClick} displayName={displayName} />

      <SidebarProvider defaultOpen={false}>
        {/* Collapsible Sidebar - Completely outside content flow */}
        <Sidebar side="left" collapsible="offcanvas" className="border-r border-gray-700">
          <SidebarContent className="bg-gray-800">
            <LeftSidebar
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
              selectedGame={selectedGame}
              setSelectedGame={setSelectedGame}
              showOnlyShiny={showOnlyShiny}
              setShowOnlyShiny={setShowOnlyShiny}
              showMissingShiny={showMissingShiny}
              setShowMissingShiny={setShowMissingShiny}
              hideGrayedPokemon={hideGrayedPokemon}
              setHideGrayedPokemon={setHideGrayedPokemon}
              hideShinyLocked={hideShinyLocked}
              setHideShinyLocked={setHideShinyLocked}
              onMajorFilterChange={() => setScrollTrigger(st => st + 1)}
              pokemonList={pokemonList}
              shinyPokemons={shinyPokemons}
              userId={userId}
              ownedGames={ownedGames}
            />
          </SidebarContent>

          {/* Custom Sidebar Toggle Button - Attached to sidebar edge */}
          <CustomSidebarToggle />
        </Sidebar>

        {/* Mobile Sidebar Toggle - Fixed on mobile */}
        <MobileSidebarToggle />

        {/* Main Content Area - Full Width, Independent of Sidebar */}
        <main className="flex flex-1 flex-col pt-16 md:pt-0">
          <ConfirmationModal
            isOpen={confirmModal.isOpen}
            onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
            onConfirm={confirmModal.onConfirm}
            message={confirmModal.message}
          />

          {/* Main Content */}
          <div className={`flex flex-1 overflow-hidden ${confirmModal.isOpen ? 'blur-sm select-none' : ''}`}>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden w-full">
              <div className="md:px-4 py-6 w-full">
                {/* Search Bar with Progress */}
                <SearchBarWithProgress
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  progress={progress}
                  shinyCount={shinyCount}
                  totalPokemon={totalPokemon}
                />


                {/* Mobile Counter - No buttons */}
                {activeCount > 0 && (
                  <div className="mb-4 px-2 block md:hidden">
                    <div className="text-gray-400 text-xs text-left">
                      {t('pokemon_shown', { count: activeCount })}
                    </div>
                  </div>
                )}

                {/* Desktop Action Buttons with Counter */}
                {!loading && activeCount > 0 && (
                  <div className="mb-4 w-full md:max-w-[1160px] md:mx-auto px-1 md:px-0 hidden md:block">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-4">
                      <div className="text-gray-400 text-xs md:text-sm">
                        {t('pokemon_shown', { count: activeCount })}
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
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-poke-yellow"></div>
                  </div>
                ) : (
                  <>
                    {/* Section: Pokémon Normaux */}
                    {/* Section: Pokémon Normaux */}
                    <div className="mobile-grid-6 grid grid-cols-6 gap-1 md:gap-4 md:max-w-[1160px] md:mx-auto w-full">
                      {displayedPokemon.normal.map((pokemon, index) => {
                        // Vérifier si c'est le premier Pokémon d'une génération
                        const pokemonNumId = parseInt(pokemon.id.split('-')[0]);
                        const isFirstOfGen = Object.entries(GENERATION_FIRST_POKEMON).find(
                          ([gen, firstId]) => firstId === pokemonNumId
                        );

                        return (
                          <div
                            key={pokemon.id}
                            ref={isFirstOfGen ? (el) => { genRefs.current[parseInt(isFirstOfGen[0])] = el; } : undefined}
                            style={{ scrollMarginTop: '80px' }}
                          >
                            {isMobile ? (
                              <MobilePokemonCard
                                pokemon={pokemon}
                                isShiny={shinyPokemons.has(pokemon.id)}
                                onToggleShiny={toggleShiny}
                                selectedGame={selectedGame}
                                isGrayedOut={pokemon.isGrayedOut}
                                validatedForms={validatedForms.get(pokemon.id) || new Set()}
                                shinyForms={shinyForms.get(pokemon.id) || new Set()}
                                onToggleForm={toggleForm}
                              />
                            ) : (
                              <PokemonCard
                                pokemon={pokemon}
                                isShiny={shinyPokemons.has(pokemon.id)}
                                onToggleShiny={toggleShiny}
                                selectedGame={selectedGame}
                                isGrayedOut={pokemon.isGrayedOut}
                                validatedForms={validatedForms.get(pokemon.id) || new Set()}
                                shinyForms={shinyForms.get(pokemon.id) || new Set()}
                                onToggleForm={toggleForm}
                                favoriteFormId={favoriteForms.get(pokemon.id)}
                                onSetFavorite={setFavoriteForm}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Sections: Formes Régionales */}
                    {(['Alola', 'Galar', 'Hisui', 'Paldea'] as const).map(region => {
                      const regionalPokemon = displayedPokemon.regional[region];
                      if (regionalPokemon.length === 0) return null;

                      return (
                        <div
                          key={region}
                          className="mt-12"
                          style={{ scrollMarginTop: '80px' }}
                          ref={(el) => { regionRefs.current[region] = el; }}
                        >
                          {/* Header de région */}
                          <div className="flex justify-center mb-4">
                            <div style={{ width: '1160px', maxWidth: '100%' }}>
                              <h2 className="text-2xl font-bold text-poke-yellow">
                                {region === 'Alola' ? t('regional_forms_alola') :
                                  region === 'Galar' ? t('regional_forms_galar') :
                                    region === 'Hisui' ? t('regional_forms_hisui') :
                                      t('regional_forms_paldea')}
                              </h2>
                            </div>
                          </div>

                          {/* Grille régionale */}
                          {/* Grille régionale */}
                          <div className="mobile-grid-6 grid grid-cols-6 gap-1 md:gap-4 md:max-w-[1160px] md:mx-auto w-full">
                            {regionalPokemon.map((pokemon, index) => (
                              <div key={pokemon.id}>
                                {isMobile ? (
                                  <MobilePokemonCard
                                    pokemon={pokemon}
                                    isShiny={shinyPokemons.has(pokemon.id)}
                                    onToggleShiny={toggleShiny}
                                    selectedGame={selectedGame}
                                    isGrayedOut={pokemon.isGrayedOut}
                                    validatedForms={validatedForms.get(pokemon.id) || new Set()}
                                    shinyForms={shinyForms.get(pokemon.id) || new Set()}
                                    onToggleForm={toggleForm}
                                  />
                                ) : (
                                  <PokemonCard
                                    pokemon={pokemon}
                                    isShiny={shinyPokemons.has(pokemon.id)}
                                    onToggleShiny={toggleShiny}
                                    selectedGame={selectedGame}
                                    isGrayedOut={pokemon.isGrayedOut}
                                    validatedForms={validatedForms.get(pokemon.id) || new Set()}
                                    shinyForms={shinyForms.get(pokemon.id) || new Set()}
                                    onToggleForm={toggleForm}
                                    favoriteFormId={favoriteForms.get(pokemon.id)}
                                    onSetFavorite={setFavoriteForm}
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}

                    {/* Message si aucun Pokémon actif */}
                    {activeCount === 0 && (
                      <div className="text-center py-16">
                        <p className="text-xl text-gray-500">{t('no_pokemon_found')}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Scroll to Top Button */}
            <ScrollToTopButton
              show={showScrollTop}
              onClick={scrollToTop}
              ariaLabel="Scroll to top"
            />

            {/* Toast Notifications */}
            <Toaster />
          </div>
        </main>
      </SidebarProvider>
    </div>
  );
};

export default ShinyTracker;
