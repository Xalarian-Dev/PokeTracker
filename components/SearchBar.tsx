
import React, { useState, forwardRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

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

const FilterButton: React.FC<{
    label: string;
    isActive: boolean;
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}> = ({ label, isActive, onClick }) => {
    const baseClasses = "px-2 py-1 sm:px-3 sm:py-1.5 text-xs font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-yellow-500";
    const activeClasses = "bg-yellow-400 text-gray-900";
    const inactiveClasses = "bg-gray-700 hover:bg-gray-600 text-white";

    return (
        <button
            onClick={onClick}
            onMouseDown={(e) => e.preventDefault()}
            className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
        >
            {label}
        </button>
    );
};

const GameButton: React.FC<{
    gameId: string;
    label: string;
    isSelected: boolean;
    onClick: (event: React.MouseEvent<HTMLButtonElement>, gameId: string) => void;
}> = ({ gameId, label, isSelected, onClick }) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500";
    const activeClasses = "bg-blue-500 text-white";
    const inactiveClasses = "bg-gray-700 hover:bg-gray-600 text-white";
    return (
        <button
            onClick={(e) => onClick(e, gameId)}
            onMouseDown={(e) => e.preventDefault()}
            className={`${baseClasses} ${isSelected ? activeClasses : inactiveClasses}`}
        >
            {label}
        </button>
    )
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
        <div ref={ref} className="sticky top-16 z-40 mb-4">
            {/* Collapsed state - only show expand button */}
            {!isFiltersExpanded && (
                <div className="bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-lg p-0.5 relative group cursor-pointer" onClick={() => setIsFiltersExpanded(true)}>
                    <div className="flex justify-center w-full">
                        <button
                            className="text-gray-400 group-hover:text-white transition-colors p-0.5 w-full flex justify-center"
                            aria-label="Expand filters"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Expanded state - full search bar */}
            {isFiltersExpanded && (
                <div className="flex flex-col bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-lg">
                    <div className="p-2 flex flex-col gap-2">
                        {/* Search input */}
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

                        {/* Checkboxes below search */}
                        <div className="flex flex-wrap gap-3 text-xs">
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

                        {/* Filters section */}
                        <div className="pt-2 border-t border-gray-700">
                            {/* Generation Filters */}
                            <div className="mb-2">
                                <h3 className="text-xs font-semibold text-gray-300 mb-1 text-center">{t('filter_by_generation')}</h3>
                                <div className="flex flex-wrap gap-1 justify-center">
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(gen => (
                                        <FilterButton
                                            key={gen}
                                            label={`${t('gen')} ${gen}`}
                                            isActive={activeFilter?.type === 'gen' && activeFilter?.value === gen}
                                            onClick={(e) => handleFilterClick(e, 'gen', gen)}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Region Filters */}
                            <div className="mb-2">
                                <h3 className="text-xs font-semibold text-gray-300 mb-1 text-center">{t('filter_by_region')}</h3>
                                <div className="flex flex-wrap gap-1 justify-center">
                                    {['Alola', 'Galar', 'Hisui', 'Paldea'].map(region => (
                                        <FilterButton
                                            key={region}
                                            label={getRegionName(region)}
                                            isActive={activeFilter?.type === 'region' && activeFilter?.value === region}
                                            onClick={(e) => handleFilterClick(e, 'region', region)}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Game Filters */}
                            <div>
                                <h3 className="text-xs font-semibold text-gray-300 mb-1 text-center">{t('filter_by_game')}</h3>
                                <div className="flex flex-wrap gap-1 justify-center">
                                    {Object.entries(gameList).map(([gameId, gameName]) => (
                                        <GameButton
                                            key={gameId}
                                            gameId={gameId}
                                            label={gameName}
                                            isSelected={selectedGame === gameId}
                                            onClick={handleGameClick}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Collapse button */}
                        <div className="pt-0.5 border-t border-gray-700 cursor-pointer group" onClick={() => setIsFiltersExpanded(false)}>
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
            )}
        </div>
    );
};

export default forwardRef(SearchBar);
