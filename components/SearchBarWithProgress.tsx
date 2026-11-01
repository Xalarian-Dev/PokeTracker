import React from 'react';
import CircularProgress from './CircularProgress';
import { useLanguage } from '../contexts/LanguageContext';

interface SearchBarWithProgressProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    progress: number;
    shinyCount: number;
    totalPokemon: number;
}

/**
 * SearchBarWithProgress - Barre de recherche avec indicateur de progression
 * Combine CircularProgress et SearchBar en un seul composant
 */
export const SearchBarWithProgress: React.FC<SearchBarWithProgressProps> = ({
    searchTerm,
    onSearchChange,
    progress,
    shinyCount,
    totalPokemon
}) => {
    const { t } = useLanguage();

    return (
        <div className="w-full">
            <div className="flex items-center gap-3 md:gap-4">
                {/* CircularProgress with counter */}
                <div className="shrink-0 flex items-center gap-1 md:gap-3">
                    <CircularProgress
                        progress={progress}
                        shinyCount={shinyCount}
                        totalPokemon={totalPokemon}
                        size={50}
                    />
                    <div className="text-white">
                        <p className="text-xs md:text-sm font-semibold">{shinyCount} / {totalPokemon}</p>
                        <p className="text-xs md:text-xs text-gray-400">{Math.round(progress)}%</p>
                    </div>
                </div>

                {/* Search Input */}
                <div className="relative flex-1 min-w-0">
                    <div className="absolute inset-y-0 left-0 pl-2 md:pl-3 flex items-center pointer-events-none">
                        <svg aria-hidden="true" className="h-4 w-4 md:h-5 md:w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <input
                        type="search"
                        aria-label={t('search_placeholder')}
                        placeholder={t('search_placeholder')}
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="block w-full pl-8 md:pl-10 pr-10 py-2 md:py-3 text-base border border-gray-600 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-poke-yellow focus:border-transparent [&::-webkit-search-cancel-button]:appearance-none"
                    />
                    {searchTerm && (
                        <button
                            type="button"
                            onClick={() => onSearchChange('')}
                            aria-label={t('search_clear')}
                            className="absolute inset-y-0 right-0 w-10 flex items-center justify-center text-gray-400 hover:text-white"
                        >
                            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchBarWithProgress;
