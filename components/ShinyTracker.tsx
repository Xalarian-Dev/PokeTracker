import React, { useState, useEffect, useCallback } from 'react';
import type { Pokemon, User } from '../types';
import Header from './Header';
import LeftSidebar from './LeftSidebar';
import SearchBarWithProgress from './SearchBarWithProgress';
import PokemonGrid from './PokemonGrid';
import PokemonToolbar from './PokemonToolbar';
import ConfirmationModal from './ConfirmationModal';
import ScrollToTopButton from './ScrollToTopButton';
import { Toaster } from './ui';
import { SidebarProvider, Sidebar, SidebarContent, useSidebar } from './ui/sidebar';
import { useLanguage } from '../contexts/LanguageContext';
import { usePokemonData } from '../hooks/usePokemonData';
import { useFilters } from '../hooks/useFilters';
import { useIsMobile } from '../hooks/use-mobile';

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

interface ShinyTrackerProps {
  user: User | null;
  onLogout: () => void;
  onProfileClick?: () => void;
  pokemonList: Pokemon[];
}

const ShinyTracker: React.FC<ShinyTrackerProps> = ({ user, onLogout, onProfileClick, pokemonList }) => {
  const isMobile = useIsMobile();
  const { t } = useLanguage();

  const {
    shinyPokemons, setShinyPokemons, loading,
    ownedGames, displayName,
    validatedForms, shinyForms, favoriteForms,
    userId, toggleShiny, toggleForm, setFavoriteForm,
  } = usePokemonData({ username: user?.username ?? null });

  const {
    searchTerm, setSearchTerm,
    showOnlyShiny, setShowOnlyShiny,
    showMissingShiny, setShowMissingShiny,
    hideGrayedPokemon, setHideGrayedPokemon,
    hideShinyLocked, setHideShinyLocked,
    activeFilter, setActiveFilter,
    selectedGame, setSelectedGame,
    setScrollTrigger,
    displayedPokemon, activeCount,
    regionRefs, genRefs,
  } = useFilters({ pokemonList, shinyPokemons });

  const [showScrollTop, setShowScrollTop] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, message: '', onConfirm: () => { } });

  // Scroll detection with passive listener
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const shinyCount = shinyPokemons.size;
  const totalPokemon = pokemonList.length;
  const progress = totalPokemon > 0 ? (shinyCount / totalPokemon) * 100 : 0;

  const handleMarkAll = useCallback(() => {
    setConfirmModal({
      isOpen: true,
      message: t('mark_all_confirm') || "Are you sure?",
      onConfirm: () => {
        setShinyPokemons(prev => {
          const newSet = new Set(prev);
          displayedPokemon.normal
            .filter(p => !p.isGrayedOut)
            .forEach(p => newSet.add(p.id));
          Object.values(displayedPokemon.regional)
            .flat()
            .filter((p: any) => !p.isGrayedOut)
            .forEach((p: any) => newSet.add(p.id));
          return newSet;
        });
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  }, [t, displayedPokemon, setShinyPokemons]);

  const handleUnmarkAll = useCallback(() => {
    setConfirmModal({
      isOpen: true,
      message: t('unmark_all_confirm') || "Are you sure?",
      onConfirm: () => {
        setShinyPokemons(prev => {
          const newSet = new Set(prev);
          displayedPokemon.normal
            .filter(p => !p.isGrayedOut)
            .forEach(p => newSet.delete(p.id));
          Object.values(displayedPokemon.regional)
            .flat()
            .filter((p: any) => !p.isGrayedOut)
            .forEach((p: any) => newSet.delete(p.id));
          return newSet;
        });
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  }, [t, displayedPokemon, setShinyPokemons]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-900 text-white">
      <Header user={user} onLogout={onLogout} onProfileClick={onProfileClick} displayName={displayName} />

      <SidebarProvider defaultOpen={false}>
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
          <CustomSidebarToggle />
        </Sidebar>

        <MobileSidebarToggle />

        <main className="flex flex-1 flex-col pt-16 md:pt-0">
          <ConfirmationModal
            isOpen={confirmModal.isOpen}
            onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
            onConfirm={confirmModal.onConfirm}
            message={confirmModal.message}
          />

          <div className={`flex flex-1 overflow-hidden ${confirmModal.isOpen ? 'blur-sm select-none' : ''}`}>
            <div className="flex-1 overflow-y-auto overflow-x-hidden w-full">
              <div className="md:px-4 py-6 w-full">
                <SearchBarWithProgress
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  progress={progress}
                  shinyCount={shinyCount}
                  totalPokemon={totalPokemon}
                />

                <PokemonToolbar
                  activeCount={activeCount}
                  loading={loading}
                  onMarkAll={handleMarkAll}
                  onUnmarkAll={handleUnmarkAll}
                />

                <PokemonGrid
                  displayedPokemon={displayedPokemon}
                  shinyPokemons={shinyPokemons}
                  validatedForms={validatedForms}
                  shinyForms={shinyForms}
                  favoriteForms={favoriteForms}
                  selectedGame={selectedGame}
                  isMobile={isMobile}
                  activeCount={activeCount}
                  loading={loading}
                  onToggleShiny={toggleShiny}
                  onToggleForm={toggleForm}
                  onSetFavorite={setFavoriteForm}
                  genRefs={genRefs}
                  regionRefs={regionRefs}
                />
              </div>
            </div>

            <ScrollToTopButton
              show={showScrollTop}
              onClick={scrollToTop}
              ariaLabel="Scroll to top"
            />

            <Toaster />
          </div>
        </main>
      </SidebarProvider>
    </div>
  );
};

export default ShinyTracker;
