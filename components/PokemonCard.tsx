
import React, { useMemo, useState } from 'react';
import type { Pokemon } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { SparklesIcon } from './Icons';
import { useCardBadges, useBadgeLabel, BadgeIcon, DLC_KEYS } from './CardBadges';
import { getCardBgColor, getDisplaySprite } from './cardShared';
import { POKEMON_WITH_MULTIPLE_FORMS } from '../data/pokemon';
import type { ShinyDetails } from '../services/supabase';
import FormsModal from './FormsModal';

interface PokemonCardProps {
  pokemon: Pokemon;
  isShiny: boolean;
  /** Jeu et rencontres enregistrés avec ce shiny (page Chasse), quand on les a */
  details?: ShinyDetails;
  onToggleShiny: (id: string) => void;
  selectedGame: string | null;
  isGrayedOut?: boolean;
  validatedForms?: Set<string>;
  shinyForms?: Set<string>;
  onToggleForm?: (pokemonId: string, formId: string, isShiny: boolean) => void;
  favoriteFormId?: string;
  onSetFavorite?: (pokemonId: string, formId: string) => void;
}

const PokemonCard: React.FC<PokemonCardProps> = ({
  pokemon,
  details,
  isShiny,
  onToggleShiny,
  selectedGame,
  isGrayedOut = false,
  validatedForms = new Set(),
  shinyForms = new Set(),
  onToggleForm,
  favoriteFormId,
  onSetFavorite
}) => {
  const { t, getGameName } = useLanguage();
  const [isFormsModalOpen, setIsFormsModalOpen] = useState(false);
  // Éclat sur la carte quand on la marque shiny : lancé au clic, retiré à la fin de l'animation
  const [sheen, setSheen] = useState(false);

  let formattedId: string;
  if (pokemon.id.includes('-')) {
    const [pokedexId, ...formParts] = pokemon.id.split('-');
    const capitalizedForm = formParts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('-');
    formattedId = `#${pokedexId.padStart(3, '0')}-${capitalizedForm}`;
  } else {
    formattedId = `#${pokemon.id.padStart(3, '0')}`;
  }

  const cardBgColor = useMemo(() => getCardBgColor(pokemon.id, selectedGame), [pokemon.id, selectedGame]);

  const cardClasses = `
    relative group ${cardBgColor} rounded-lg p-3 flex flex-col items-center justify-center 
    cursor-pointer transition-all duration-300 transform select-none ${isShiny ? 'shiny-card' : ''} ${isShiny && sheen ? 'sheen-play' : ''}
    card-glow hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40
    ${isShiny ? 'border-2 border-amber-400' : cardBgColor === 'bg-black' ? 'border-2 border-gray-700' : 'border-2 border-transparent'}
    overflow-visible
  `;

  const shinyGlowStyle = isShiny ? {
    boxShadow: '0 0 0 1px rgba(251, 191, 36, 0.35), 0 0 18px 3px rgba(251, 191, 36, 0.32)'
  } : {};

  // « Écarlate · 1 843 rencontres » : seulement quand la donnée existe
  const captureParts: string[] = [];
  if (details?.game) captureParts.push(getGameName(details.game));
  if (details?.encounters !== null && details?.encounters !== undefined) captureParts.push(t('community_feed_encounters', { n: details.encounters.toLocaleString() }));
  const captureInfo = captureParts.join(' · ');

  const badges = useCardBadges(pokemon.id, selectedGame);
  const badgeLabel = useBadgeLabel();
  const dlcBadges = badges.filter(b => DLC_KEYS.includes(b.key));
  const statusBadges = badges.filter(b => !DLC_KEYS.includes(b.key));

  // Check if this Pokémon has multiple forms
  const multiFormData = useMemo(() => {
    return POKEMON_WITH_MULTIPLE_FORMS[pokemon.id];
  }, [pokemon.id]);

  const hasMultipleForms = !!multiFormData;

  // Calculate form counter
  const formCounter = useMemo(() => {
    if (!hasMultipleForms || !multiFormData) return null;
    const shinyCount = shinyForms.size;
    const totalForms = multiFormData.forms.length;
    return `${shinyCount}/${totalForms}`;
  }, [hasMultipleForms, multiFormData, shinyForms]);

  // Handle form toggle
  const handleToggleForm = (formId: string, isShiny: boolean) => {
    if (onToggleForm) {
      onToggleForm(pokemon.id, formId, isShiny);
    }
  };

  // Handle plus indicator click
  const handlePlusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFormsModalOpen(true);
  };

  const displaySpriteUrl = useMemo(
    () => getDisplaySprite(pokemon, isShiny, favoriteFormId),
    [pokemon, isShiny, favoriteFormId]
  );

  return (
    <>
    <div
      data-card-glow
      className={`${cardClasses} ${isGrayedOut ? 'opacity-40 grayscale' : ''}`}
      style={shinyGlowStyle}
      onClick={() => { if (!isShiny) setSheen(true); onToggleShiny(pokemon.id); }}
      onAnimationEnd={(e) => { if (e.target === e.currentTarget) setSheen(false); }}
    >
      {isShiny && (
        <div className="absolute top-2 right-2 text-amber-400 drop-shadow-[0_2px_4px_rgba(251,191,36,0.5)]">
          <SparklesIcon className="w-5 h-5" />
        </div>
      )}
      {dlcBadges.length > 0 && (
        <div className="absolute top-2 left-2 flex gap-1 z-10">
          {dlcBadges.map(b => (
            <BadgeIcon key={b.key} badge={b} label={badgeLabel(b)} className={b.key === 'lzadlc1' ? 'w-12 h-6 -ml-1' : 'w-6 h-6'} tooltip />
          ))}
        </div>
      )}

      {statusBadges.length > 0 && (
        <div className="absolute bottom-2 left-2 flex flex-col items-start gap-1 z-10">
          {statusBadges.map(b => (
            <BadgeIcon key={b.key} badge={b} label={badgeLabel(b)} className="w-5 h-5 drop-shadow-md" tooltip />
          ))}
        </div>
      )}

      <div className="w-24 h-24 flex items-center justify-center">
        <img
          src={displaySpriteUrl}
          alt={pokemon.name}
          className="max-w-full max-h-full object-contain"
          width="96"
          height="96"
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="text-center mt-2 w-full px-0.5 overflow-hidden">
        <p className="text-sm font-bold text-white truncate">{pokemon.name}</p>
        <p className="text-xs text-gray-400">{formattedId}</p>
        {isShiny && captureInfo && (
          <p className="mt-0.5 text-xs text-amber-200/90 truncate" title={captureInfo}>{captureInfo}</p>
        )}
      </div>

      {/* Multiple Forms Indicator and Counter */}
      {hasMultipleForms && (
        <>
          {/* Plus Indicator */}
          <div
            className="absolute bottom-[38px] right-2 bg-linear-to-br from-amber-300 to-amber-500 text-gray-900 w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm shadow-lg hover:scale-110 transition-transform cursor-pointer z-10"
            onClick={handlePlusClick}
            style={{ boxShadow: '0 2px 8px rgba(251, 191, 36, 0.5)', lineHeight: '1' }}
          >
            +
          </div>

          {/* Form Counter */}
          <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-0.5 rounded-lg text-xs font-bold backdrop-blur-xs border border-white/15 shadow-md z-10">
            {formCounter}
          </div>
        </>
      )}

    </div>

    {/* Fenêtre des formes (hors de la carte cliquable) */}
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

export default React.memo(PokemonCard);
