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
        <div className="mb-6 w-full max-w-[300px] px-2 md:max-w-[1200px] md:mx-auto md:px-4">
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
                        <p className="text-[10px] md:text-xs text-gray-400">{Math.round(progress)}%</p>
                    </div>
                </div>

                {/* Search Input */}
                <div className="relative flex-1 min-w-0">
                    <div className="absolute inset-y-0 left-0 pl-2 md:pl-3 flex items-center pointer-events-none">
                        <svg className="h-4 w-4 md:h-5 md:w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder={t('search_placeholder')}
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="block w-full pl-8 md:pl-10 pr-2 md:pr-3 py-2 md:py-3 text-xs md:text-base border border-gray-600 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-poke-yellow focus:border-transparent"
                    />
                </div>
            </div>
        </div>
    );
};

export default SearchBarWithProgress;
