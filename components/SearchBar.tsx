
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
        <button onClick={(e) => onClick(e, gameId)} className={`${baseClasses} ${isSelected ? activeClasses : inactiveClasses}`}>
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
        <div ref={ref} className="sticky top-16 z-40 mb-6 flex flex-col bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-lg">
            <div className="p-3 flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="relative flex-grow w-full sm:w-auto">
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
                            className="w-full pl-10 pr-4 py-1.5 text-sm bg-gray-700 border border-gray-600 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5 w-full sm:w-64">
                        <div className="flex items-center justify-between">
                            <label htmlFor="missing-shiny-filter" className="text-sm text-gray-300">{t('show_missing_shiny')}</label>
                            <input
                                type="checkbox"
                                id="missing-shiny-filter"
                                checked={showMissingShiny}
                                onChange={(e) => setShowMissingShiny(e.target.checked)}
                                className="h-4 w-4 text-blue-400 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 flex-shrink-0"
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <label htmlFor="shiny-filter" className="text-sm text-gray-300">{t('show_only_shiny')}</label>
                            <input
                                type="checkbox"
                                id="shiny-filter"
                                checked={showOnlyShiny}
                                onChange={(e) => setShowOnlyShiny(e.target.checked)}
                                className="h-4 w-4 text-yellow-400 bg-gray-700 border-gray-600 rounded focus:ring-yellow-500 flex-shrink-0"
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <label htmlFor="regional-forms-filter" className="text-sm text-gray-300">{t('hide_regional_forms')}</label>
                            <input
                                type="checkbox"
                                id="regional-forms-filter"
                                checked={hideRegionalForms}
                                onChange={(e) => setHideRegionalForms(e.target.checked)}
                                className="h-4 w-4 text-green-400 bg-gray-700 border-gray-600 rounded focus:ring-green-500 flex-shrink-0"
                            />
                        </div>
                    </div>
                </div>

                <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isFiltersExpanded ? 'max-h-[500px]' : 'max-h-0'}`}>
                    <div className="flex flex-col gap-3 pt-3 border-t border-gray-700">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                            {[...Array(9)].map((_, i) => {
                                const gen = i + 1;
                                return (
                                    <FilterButton
                                        key={`gen-${gen}`}
                                        label={`${t('generation_short')} ${gen}`}
                                        isActive={activeFilter?.type === 'gen' && activeFilter?.value === gen}
                                        onClick={(e) => handleFilterClick(e, 'gen', gen)}
                                    />
                                );
                            })}
                            {['Alola', 'Galar', 'Hisui', 'Paldea'].map(region => (
                                <FilterButton
                                    key={`region-${region}`}
                                    label={getRegionName(region)}
                                    isActive={activeFilter?.type === 'region' && activeFilter?.value === region}
                                    onClick={(e) => handleFilterClick(e, 'region', region)}
                                />
                            ))}
                        </div>
                        <hr className="border-gray-700" />
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-xs font-semibold text-gray-300">{t('filter_by_game')}</h3>
                            </div>
                            <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                {Object.entries(gameList).map(([id, name]) => (
                                    <GameButton
                                        key={id}
                                        gameId={id}
                                        label={name}
                                        isSelected={selectedGame === id}
                                        onClick={handleGameClick}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <button
                onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
                className="w-full h-5 bg-gray-900/50 hover:bg-gray-700/80 rounded-b-lg flex items-center justify-center text-white focus:outline-none"
                aria-label={isFiltersExpanded ? t('collapse_filters') : t('expand_filters')}
            >
                <svg
                    className={`w-4 h-4 transition-transform duration-300 ${isFiltersExpanded ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
            </button>
        </div>
    );
};

export default forwardRef(SearchBar);
