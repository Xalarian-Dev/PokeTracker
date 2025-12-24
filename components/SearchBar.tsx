import React, { useState, forwardRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { FilterChip } from './ui';

interface SearchBarProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    showOnlyShiny: boolean;
    setShowOnlyShiny: (show: boolean) => void;
    showMissingShiny: boolean;
    setShowMissingShiny: (show: boolean) => void;
    hideRegionalForms: boolean;
    setHideRegionalForms: (show: boolean) => void;
    activeFilter: { type: 'gen' | 'region'; value: string | number } | null;
    setActiveFilter: (filter: { type: 'gen' | 'region'; value: string | number } | null) => void;
    selectedGame: string | null;
    setSelectedGame: (game: string | null) => void;
    onMajorFilterChange: () => void;
}

const SearchBar: React.ForwardRefRenderFunction<HTMLDivElement, SearchBarProps> = ({
    searchTerm, setSearchTerm,
    showOnlyShiny, setShowOnlyShiny,
    showMissingShiny, setShowMissingShiny,
    hideRegionalForms, setHideRegionalForms,
    activeFilter, setActiveFilter,
    selectedGame, setSelectedGame,
    onMajorFilterChange
}, ref) => {
    const { t, getGameList, getRegionName } = useLanguage();
    const gameList = getGameList();
    const [isFiltersExpanded, setIsFiltersExpanded] = useState(true);

    const handleGameClick = (event: React.MouseEvent<HTMLButtonElement>, gameId: string) => {
        event.preventDefault();
        (event.currentTarget as HTMLButtonElement).blur();
        setSelectedGame(selectedGame === gameId ? null : gameId);
        onMajorFilterChange();
    };

    const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>, type: 'gen' | 'region', value: number | string) => {
        event.preventDefault();
        (event.currentTarget as HTMLButtonElement).blur();
        if (activeFilter?.type === type && activeFilter?.value === value) {
            setActiveFilter(null);
        } else {
            setActiveFilter({ type, value });
        }
        onMajorFilterChange();
    };

    return (
        <div ref={ref} className="md:sticky md:top-16 z-40 mb-4 w-full max-w-full">
            <div className="flex flex-col bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-lg w-full max-w-full box-border">
                <div className="p-2 flex flex-col gap-2">
                    {/* Search Input */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                            <svg className="h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder={t('search_placeholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-8 pr-3 py-1.5 text-sm border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-transparent"
                        />
                    </div>

                    {/* Checkboxes */}
                    <div className="flex flex-wrap gap-2 text-xs">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={showMissingShiny}
                                onChange={(e) => setShowMissingShiny(e.target.checked)}
                                className="h-3 w-3 text-blue-400 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-gray-300">{t('show_missing_shiny')}</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={showOnlyShiny}
                                onChange={(e) => setShowOnlyShiny(e.target.checked)}
                                className="h-3 w-3 text-yellow-400 bg-gray-700 border-gray-600 rounded focus:ring-yellow-500"
                            />
                            <span className="text-gray-300">{t('show_only_shiny')}</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={hideRegionalForms}
                                onChange={(e) => setHideRegionalForms(e.target.checked)}
                                className="h-3 w-3 text-green-400 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
                            />
                            <span className="text-gray-300">{t('hide_regional_forms')}</span>
                        </label>
                    </div>

                    {/* Filters Section */}
                    <div className="pt-2 border-t border-gray-700">
                        {/* Generation Filters */}
                        <div className="mb-2">
                            <h3 className="text-xs font-semibold text-gray-300 mb-1 text-center">
                                {t('filter_by_generation')}
                            </h3>
                            <div className="flex flex-wrap gap-1 justify-center">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(gen => (
                                    <FilterChip
                                        key={gen}
                                        label={`${t('gen')} ${gen}`}
                                        isActive={activeFilter?.type === 'gen' && activeFilter?.value === gen}
                                        variant="filter"
                                        onClick={(e) => handleFilterClick(e, 'gen', gen)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Region Filters */}
                        <div className="mb-2">
                            <h3 className="text-xs font-semibold text-gray-300 mb-1 text-center">
                                {t('filter_by_region')}
                            </h3>
                            <div className="flex flex-wrap gap-1 justify-center">
                                {['Alola', 'Galar', 'Hisui', 'Paldea'].map(region => (
                                    <FilterChip
                                        key={region}
                                        label={getRegionName(region)}
                                        isActive={activeFilter?.type === 'region' && activeFilter?.value === region}
                                        variant="filter"
                                        onClick={(e) => handleFilterClick(e, 'region', region)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Game Filters */}
                        <div>
                            <h3 className="text-xs font-semibold text-gray-300 mb-1 text-center">
                                {t('filter_by_game')}
                            </h3>
                            <div className="flex flex-wrap gap-1 justify-center">
                                {Object.entries(gameList).map(([gameId, gameName]) => (
                                    <FilterChip
                                        key={gameId}
                                        label={gameName}
                                        isActive={selectedGame === gameId}
                                        variant="game"
                                        onClick={(e) => handleGameClick(e, gameId)}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Collapse Button - Desktop Only */}
                    <div className="hidden md:block pt-0.5 border-t border-gray-700 cursor-pointer group" onClick={() => setIsFiltersExpanded(false)}>
                        <div className="flex justify-center w-full">
                            <button
                                className="text-gray-400 group-hover:text-white transition-colors p-0.5 w-full flex justify-center"
                                aria-label="Collapse filters"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default forwardRef(SearchBar);
