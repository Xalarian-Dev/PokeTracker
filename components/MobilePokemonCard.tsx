import React, { useMemo, useState, useCallback } from 'react';
import type { Pokemon } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { SparklesIcon } from './Icons';
import { POKEMON_AVAILABILITY, SHINY_LOCKED_POKEMON } from '../data/games';
import { POKEMON_WITH_MULTIPLE_FORMS } from '../data/pokemon';
import FormsModal from './FormsModal';

interface MobilePokemonCardProps {
    pokemon: Pokemon;
    isShiny: boolean;
    onToggleShiny: (id: string) => void;
    selectedGame: string | null;
    isGrayedOut?: boolean;
    validatedForms?: Set<string>;
    shinyForms?: Set<string>;
    onToggleForm?: (pokemonId: string, formId: string, shouldBeShiny: boolean) => void;
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

const MobilePokemonCard: React.FC<MobilePokemonCardProps> = ({
    pokemon, isShiny, onToggleShiny, selectedGame,
    isGrayedOut = false, validatedForms, shinyForms = new Set(), onToggleForm
}) => {
    const { t } = useLanguage();
    const [isFormsModalOpen, setIsFormsModalOpen] = useState(false);

    const formattedId = pokemon.id.includes('-')
        ? `#${pokemon.id.split('-')[0].padStart(3, '0')}`
        : `#${pokemon.id.padStart(3, '0')}`;

    const cardBgColor = useMemo(() => {
        if (selectedGame && gameColorMap[selectedGame]) {
            const { keys, colors } = gameColorMap[selectedGame];
            const availability = POKEMON_AVAILABILITY[pokemon.id] || [];
            const check = (k: string | string[]) =>
                Array.isArray(k) ? k.some(c => availability.includes(c)) : availability.includes(k);
            const in1 = check(keys[0]);
            const in2 = check(keys[1]);
            if (in1 && !in2) return colors[0];
            if (!in1 && in2) return colors[1];
        }
        return 'bg-gray-800';
    }, [pokemon.id, selectedGame]);

    const isLocked = useMemo(() => {
        if (selectedGame && SHINY_LOCKED_POKEMON[selectedGame]) {
            return SHINY_LOCKED_POKEMON[selectedGame].includes(pokemon.id);
        }
        return false;
    }, [pokemon.id, selectedGame]);

    const multiFormData = useMemo(() => POKEMON_WITH_MULTIPLE_FORMS[pokemon.id], [pokemon.id]);
    const hasMultipleForms = !!multiFormData;

    const formCounter = useMemo(() => {
        if (!hasMultipleForms || !multiFormData) return null;
        return `${shinyForms.size}/${multiFormData.forms.length}`;
    }, [hasMultipleForms, multiFormData, shinyForms]);

    const handlePlusClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setIsFormsModalOpen(true);
    }, []);

    const handleToggleForm = useCallback((formId: string, shouldBeShiny: boolean) => {
        onToggleForm?.(pokemon.id, formId, shouldBeShiny);
    }, [onToggleForm, pokemon.id]);

    const favoriteFormId = validatedForms ? Array.from(validatedForms)[0] ?? null : null;

    const cardClasses = `relative group ${cardBgColor} rounded-sm p-1 flex flex-col items-center justify-center
    cursor-pointer transition-all duration-200 select-none
    ${isShiny ? 'border-2 border-amber-400' : cardBgColor === 'bg-black' ? 'border-2 border-gray-700' : 'border-2 border-transparent'}
    overflow-hidden`;

    return (
        <>
            <div
                className={`${cardClasses} ${isGrayedOut ? 'opacity-40 grayscale' : ''}`}
                style={isShiny ? { boxShadow: '0 0 8px 2px rgba(251, 191, 36, 0.3)' } : {}}
                onClick={() => onToggleShiny(pokemon.id)}
            >
                {/* Shiny sparkle */}
                {isShiny && (
                    <div className="absolute top-0.5 right-0.5 text-amber-400">
                        <SparklesIcon className="w-3 h-3" />
                    </div>
                )}

                {/* Shiny lock badge */}
                {isLocked && (
                    <div className="absolute top-0.5 left-0.5 text-red-400" title={t('shiny_lock')}>
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                    </div>
                )}

                {/* Sprite */}
                <div className="w-8 h-8 flex items-center justify-center">
                    <img
                        src={isShiny ? pokemon.shinySprite : pokemon.sprite}
                        alt={pokemon.name}
                        className="max-w-full max-h-full object-contain"
                        width="32"
                        height="32"
                        loading="lazy"
                        decoding="async"
                    />
                </div>

                {/* Name & ID */}
                <div className="text-center w-full overflow-hidden">
                    <p className="text-[10px] font-bold text-white truncate px-0.5 leading-tight">{pokemon.name}</p>
                    <p className="text-[9px] text-gray-400 leading-tight">{formattedId}</p>
                </div>

                {/* Forms "+" button */}
                {hasMultipleForms && (
                    <button
                        onClick={handlePlusClick}
                        className="absolute bottom-0.5 right-0.5 bg-amber-500 text-white w-4 h-4 rounded-full flex items-center justify-center font-bold text-[9px] shadow leading-none z-10"
                        aria-label={`${pokemon.name} forms`}
                    >
                        +
                    </button>
                )}

                {/* Form shiny counter */}
                {hasMultipleForms && formCounter && (
                    <div className="absolute bottom-0.5 left-0.5 bg-black/70 text-white px-0.5 rounded text-[8px] font-bold leading-tight">
                        {formCounter}
                    </div>
                )}
            </div>

            {/* Forms Modal */}
            {hasMultipleForms && multiFormData && (
                <FormsModal
                    isOpen={isFormsModalOpen}
                    onClose={() => setIsFormsModalOpen(false)}
                    basePokemonName={pokemon.name}
                    forms={multiFormData.forms}
                    shinyForms={shinyForms}
                    onToggleForm={handleToggleForm}
                    favoriteFormId={favoriteFormId}
                    onSetFavorite={() => {}}
                />
            )}
        </>
    );
};

export default React.memo(MobilePokemonCard);
