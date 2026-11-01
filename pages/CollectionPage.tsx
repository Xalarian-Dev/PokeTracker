import React, { useCallback, useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCollection } from '../contexts/CollectionContext';
import { useFilters } from '../hooks/useFilters';
import { useIsMobile } from '../hooks/use-mobile';
import FilterBar from '../components/FilterBar';
import PokemonGrid from '../components/PokemonGrid';
import PokemonToolbar from '../components/PokemonToolbar';
import ConfirmationModal from '../components/ConfirmationModal';
import ScrollToTopButton from '../components/ScrollToTopButton';

/** Page principale : recherche, filtres et grille de la collection */
const CollectionPage: React.FC = () => {
    const { t } = useLanguage();
    const isMobile = useIsMobile();
    const {
        pokemonList, shinyPokemons, setShinyPokemons, loading,
        validatedForms, shinyForms, favoriteForms, toggleShiny, toggleForm, setFavoriteForm,
    } = useCollection();

    const filters = useFilters({ pokemonList, shinyPokemons });
    const { displayedPokemon, activeCount } = filters;

    const [showScrollTop, setShowScrollTop] = useState(false);
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        message: string;
        confirmLabel?: string;
        onConfirm: () => void;
    }>({ isOpen: false, message: '', onConfirm: () => { } });

    useEffect(() => {
        const onScroll = () => setShowScrollTop(window.scrollY > 300);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const shinyCount = shinyPokemons.size;
    const totalPokemon = pokemonList.length;
    const progress = totalPokemon > 0 ? (shinyCount / totalPokemon) * 100 : 0;

    const applyToDisplayed = useCallback((apply: (next: Set<string>, id: string) => void) => {
        setShinyPokemons(prev => {
            const next = new Set(prev);
            displayedPokemon.normal.filter(p => !p.isGrayedOut).forEach(p => apply(next, p.id));
            Object.values(displayedPokemon.regional).flat().filter(p => !p.isGrayedOut).forEach(p => apply(next, p.id));
            return next;
        });
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
    }, [displayedPokemon, setShinyPokemons]);

    const handleMarkAll = useCallback(() => {
        setConfirmModal({
            isOpen: true,
            message: t('mark_all_confirm'),
            confirmLabel: t('mark_all'),
            onConfirm: () => applyToDisplayed((set, id) => set.add(id)),
        });
    }, [t, applyToDisplayed]);

    const handleUnmarkAll = useCallback(() => {
        setConfirmModal({
            isOpen: true,
            message: t('unmark_all_confirm'),
            confirmLabel: t('unmark_all'),
            onConfirm: () => applyToDisplayed((set, id) => set.delete(id)),
        });
    }, [t, applyToDisplayed]);

    return (
        <>
            <h1 className="sr-only">{t('shiny_tracker_title')}</h1>

            <FilterBar
                {...filters}
                onSearchChange={filters.setSearchTerm}
                onMajorFilterChange={() => filters.setScrollTrigger(n => n + 1)}
                progress={progress}
                shinyCount={shinyCount}
                totalPokemon={totalPokemon}
                activeCount={activeCount}
            />

            <div className="px-2 md:px-4 py-4">
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
                    selectedGame={filters.selectedGame}
                    isMobile={isMobile}
                    activeCount={activeCount}
                    loading={loading}
                    onToggleShiny={toggleShiny}
                    onToggleForm={toggleForm}
                    onSetFavorite={setFavoriteForm}
                    onResetFilters={filters.resetFilters}
                    genRefs={filters.genRefs}
                    regionRefs={filters.regionRefs}
                />
            </div>

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                message={confirmModal.message}
                confirmLabel={confirmModal.confirmLabel}
            />

            <ScrollToTopButton
                show={showScrollTop}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                ariaLabel={t('scroll_to_top')}
            />
        </>
    );
};

export default CollectionPage;
