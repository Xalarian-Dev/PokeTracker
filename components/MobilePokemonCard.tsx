
import React, { useMemo } from 'react';
import type { Pokemon } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { SparklesIcon } from './Icons';
import { POKEMON_AVAILABILITY, SHINY_LOCKED_POKEMON } from '../data/games';

interface MobilePokemonCardProps {
    pokemon: Pokemon;
    isShiny: boolean;
    onToggleShiny: (id: string) => void;
    selectedGame: string | null;
    isGrayedOut?: boolean;
}

const gameColorMap: Record<string, { keys: [string | string[], string | string[]]; colors: [string, string] }> = {
    'rb': { keys: ['r', 'b'], colors: ['bg-red-900/50', 'bg-blue-900/50'] },
    'gs': { keys: ['g', 's'], colors: ['bg-yellow-600/50', 'bg-slate-500/50'] },
    'rs': { keys: ['ru', 'sa'], colors: ['bg-red-800/50', 'bg-blue-800/50'] },
    'frlg': { keys: ['fr', 'lg'], colors: ['bg-red-800/50', 'bg-green-800/50'] },
    'dp': { keys: ['d', 'p'], colors: ['bg-sky-800/50', 'bg-pink-800/50'] },
    'hgss': { keys: ['hg', 'ss'], colors: ['bg-yellow-600/50', 'bg-slate-500/50'] },
    'bw': { keys: ['bla', 'w'], colors: ['bg-black', 'bg-gray-400/50'] },
    'bw2': { keys: ['bla2', 'w2'], colors: ['bg-black', 'bg-gray-400/50'] },
    'xy': { keys: ['x', 'y'], colors: ['bg-blue-800/50', 'bg-red-800/50'] },
    'oras': { keys: ['or', 'as'], colors: ['bg-red-800/50', 'bg-blue-800/50'] },
    'sm': { keys: ['su', 'm'], colors: ['bg-orange-500/50', 'bg-purple-900/50'] },
    'usum': { keys: ['us', 'um'], colors: ['bg-orange-500/50', 'bg-purple-900/50'] },
    'lgpe': { keys: ['lgp', 'lge'], colors: ['bg-yellow-400/50', 'bg-amber-800/50'] },
    'swsh': {
        keys: [['sw', 'swdlc1', 'swdlc2'], ['sh', 'shdlc1', 'shdlc2']],
        colors: ['bg-cyan-600/50', 'bg-red-600/50']
    },
    'bdsp': { keys: ['bd', 'sp'], colors: ['bg-sky-800/50', 'bg-pink-800/50'] },
    'sv': {
        keys: [['sc', 'scdlc1', 'scdlc2'], ['v', 'vdlc1', 'vdlc2']],
        colors: ['bg-red-700/50', 'bg-purple-800/50']
    }
};

const MobilePokemonCard: React.FC<MobilePokemonCardProps> = ({ pokemon, isShiny, onToggleShiny, selectedGame, isGrayedOut = false }) => {
    const { t } = useLanguage();

    let formattedId: string;
    if (pokemon.id.includes('-')) {
        const [pokedexId] = pokemon.id.split('-');
        formattedId = `#${pokedexId.padStart(3, '0')}`;
    } else {
        formattedId = `#${pokemon.id.padStart(3, '0')}`;
    }

    const cardBgColor = useMemo(() => {
        if (selectedGame && gameColorMap[selectedGame]) {
            const { keys, colors } = gameColorMap[selectedGame];
            const availability = POKEMON_AVAILABILITY[pokemon.id] || [];

            const checkAvailability = (keyOrKeys: string | string[]) => {
                if (Array.isArray(keyOrKeys)) {
                    return keyOrKeys.some(k => availability.includes(k));
                }
                return availability.includes(keyOrKeys);
            };

            const inGame1 = checkAvailability(keys[0]);
            const inGame2 = checkAvailability(keys[1]);

            if (inGame1 && !inGame2) {
                return colors[0];
            }
            if (!inGame1 && inGame2) {
                return colors[1];
            }
        }
        return 'bg-gray-800';
    }, [pokemon.id, selectedGame]);

    const cardClasses = `
    relative group ${cardBgColor} rounded-sm p-1 flex flex-col items-center justify-center 
    cursor-pointer transition-all duration-200 select-none
    ${isShiny ? 'border-2 border-amber-400' : cardBgColor === 'bg-black' ? 'border-2 border-gray-700' : 'border-2 border-transparent'}
    overflow-hidden
  `;

    const shinyGlowStyle = isShiny ? {
        boxShadow: '0 0 8px 2px rgba(251, 191, 36, 0.3)'
    } : {};

    const isLocked = useMemo(() => {
        if (selectedGame && SHINY_LOCKED_POKEMON[selectedGame]) {
            return SHINY_LOCKED_POKEMON[selectedGame].includes(pokemon.id);
        }
        return false;
    }, [pokemon.id, selectedGame]);

    return (
        <div
            className={`${cardClasses} ${isGrayedOut ? 'opacity-40 grayscale' : ''}`}
            style={shinyGlowStyle}
            onClick={() => onToggleShiny(pokemon.id)}
        >
            {isShiny && (
                <div className="absolute top-0.5 right-0.5 text-amber-400">
                    <SparklesIcon className="w-3 h-3" />
                </div>
            )}

            <div className="w-8 h-8 flex items-center justify-center">
                <img
                    src={isShiny ? pokemon.shinySprite : pokemon.sprite}
                    alt={pokemon.name}
                    className="max-w-full max-h-full object-contain"
                    width="32"
                    height="32"
                    loading="lazy"
                />
            </div>
            <div className="text-center w-full overflow-hidden">
                <p className="text-[8px] font-bold text-white truncate px-0.5">{pokemon.name}</p>
                <p className="text-[6px] text-gray-400">{formattedId}</p>
            </div>
        </div>
    );
};

export default React.memo(MobilePokemonCard);
