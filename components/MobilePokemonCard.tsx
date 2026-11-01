import React, { useMemo, useState, useCallback } from 'react';
import type { Pokemon } from '../types';
import { SparklesIcon } from './Icons';
import { POKEMON_WITH_MULTIPLE_FORMS } from '../data/pokemon';
import FormsModal from './FormsModal';
import { getCardBgColor, getDisplaySprite } from './cardShared';
import type { ShinyDetails } from '../services/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import { useCardBadges, useBadgeLabel, BadgeIcon } from './CardBadges';

/** Nombre maximum d'icônes affichées sur une carte mobile (la légende liste toutes les icônes) */
const MAX_MOBILE_BADGES = 3;

interface MobilePokemonCardProps {
    pokemon: Pokemon;
    isShiny: boolean;
    /** Jeu et rencontres enregistrés avec ce shiny (affichés en infobulle sur mobile : la carte est trop petite) */
    details?: ShinyDetails;
    onToggleShiny: (id: string) => void;
    selectedGame: string | null;
    isGrayedOut?: boolean;
    shinyForms?: Set<string>;
    onToggleForm?: (pokemonId: string, formId: string, shouldBeShiny: boolean) => void;
    favoriteFormId?: string;
    onSetFavorite?: (pokemonId: string, formId: string) => void;
}

const MobilePokemonCard: React.FC<MobilePokemonCardProps> = ({
    pokemon, isShiny, details, onToggleShiny, selectedGame,
    isGrayedOut = false, shinyForms = new Set(), onToggleForm, favoriteFormId, onSetFavorite,
}) => {
    const [isFormsModalOpen, setIsFormsModalOpen] = useState(false);
    const { t, getGameName } = useLanguage();
    const captureTitle = [
        details?.game ? getGameName(details.game) : null,
        details?.encounters !== null && details?.encounters !== undefined ? t('community_feed_encounters', { n: details.encounters.toLocaleString() }) : null,
    ].filter(Boolean).join(' · ');

    const formattedId = pokemon.id.includes('-')
        ? `#${pokemon.id.split('-')[0].padStart(3, '0')}`
        : `#${pokemon.id.padStart(3, '0')}`;

    const cardBgColor = useMemo(() => getCardBgColor(pokemon.id, selectedGame), [pokemon.id, selectedGame]);
    const badges = useCardBadges(pokemon.id, selectedGame);
    const badgeLabel = useBadgeLabel();
    const shownBadges = badges.slice(0, MAX_MOBILE_BADGES);

    const multiFormData = useMemo(() => POKEMON_WITH_MULTIPLE_FORMS[pokemon.id], [pokemon.id]);
    const hasMultipleForms = !!multiFormData;
    const formCounter = hasMultipleForms ? `${shinyForms.size}/${multiFormData.forms.length}` : null;

    const spriteUrl = useMemo(
        () => getDisplaySprite(pokemon, isShiny, favoriteFormId),
        [pokemon, isShiny, favoriteFormId]
    );

    const handlePlusClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setIsFormsModalOpen(true);
    }, []);

    const handleToggleForm = useCallback((formId: string, shouldBeShiny: boolean) => {
        onToggleForm?.(pokemon.id, formId, shouldBeShiny);
    }, [onToggleForm, pokemon.id]);

    const cardClasses = `relative group ${cardBgColor} rounded-sm p-1 flex flex-col items-center justify-center
    cursor-pointer transition-all duration-200 select-none
    ${isShiny ? 'border-2 border-amber-400' : cardBgColor === 'bg-black' ? 'border-2 border-gray-700' : 'border-2 border-transparent'}
    overflow-hidden`;

    return (
        <>
            <div
                className={`${cardClasses} ${isGrayedOut ? 'opacity-40 grayscale' : ''}`}
                style={isShiny ? { boxShadow: '0 0 8px 2px rgba(251, 191, 36, 0.3)' } : {}}
                title={isShiny && captureTitle ? captureTitle : undefined}
                onClick={() => onToggleShiny(pokemon.id)}
            >
                {isShiny && (
                    <div className="absolute top-0.5 right-0.5 text-amber-400">
                        <SparklesIcon className="w-3 h-3" />
                    </div>
                )}

                {/* Icônes d'information (verrou shiny, DLC, événement…) — la légende détaille chacune */}
                {shownBadges.length > 0 && (
                    <div className="absolute top-0.5 left-0.5 flex gap-0.5">
                        {shownBadges.map(b => (
                            <BadgeIcon key={b.key} badge={b} label={badgeLabel(b)} className="w-3.5 h-3.5" />
                        ))}
                    </div>
                )}

                <div className="w-8 h-8 flex items-center justify-center">
                    <img
                        src={spriteUrl}
                        alt={pokemon.name}
                        className="max-w-full max-h-full object-contain"
                        width="32"
                        height="32"
                        loading="lazy"
                        decoding="async"
                    />
                </div>

                <div className="text-center w-full overflow-hidden">
                    <p className="text-xs font-bold text-white truncate px-0.5 leading-tight">{pokemon.name}</p>
                    <p className="text-xs text-gray-400 leading-tight">{formattedId}</p>
                </div>

                {/* Bouton « + » formes (zone de toucher de 40 px, pastille visible de 24 px) */}
                {hasMultipleForms && (
                    <button
                        onClick={handlePlusClick}
                        className="absolute bottom-0 right-0 w-10 h-10 flex items-center justify-center z-10"
                        aria-label={`${pokemon.name} forms`}
                    >
                        <span className="bg-amber-400 text-gray-900 w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm shadow-sm leading-none">+</span>
                    </button>
                )}

                {hasMultipleForms && formCounter && (
                    <div className="absolute bottom-0.5 left-0.5 bg-black/70 text-white px-0.5 rounded text-xs font-bold leading-tight">
                        {formCounter}
                    </div>
                )}
            </div>

            {hasMultipleForms && multiFormData && (
                <FormsModal
                    isOpen={isFormsModalOpen}
                    onClose={() => setIsFormsModalOpen(false)}
                    basePokemonName={pokemon.name}
                    forms={multiFormData.forms}
                    shinyForms={shinyForms}
                    onToggleForm={handleToggleForm}
                    favoriteFormId={favoriteFormId}
                    onSetFavorite={(formId) => onSetFavorite?.(pokemon.id, formId)}
                />
            )}
        </>
    );
};

export default React.memo(MobilePokemonCard);
