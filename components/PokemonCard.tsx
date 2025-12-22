
import React, { useMemo } from 'react';
import type { Pokemon } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { StarIcon, IsleOfArmorIcon, CrownTundraIcon, TealMaskIcon, IndigoDiskIcon, MegaDimensionIcon, LockIcon } from './Icons';
import { POKEMON_AVAILABILITY, SHINY_LOCKED_POKEMON } from '../data/games';

interface PokemonCardProps {
  pokemon: Pokemon;
  isShiny: boolean;
  onToggleShiny: (id: string) => void;
  selectedGame: string | null;
}

const gameColorMap: Record<string, { keys: [string | string[], string | string[]]; colors: [string, string] }> = {
  'rb': { keys: ['r', 'b'], colors: ['bg-red-900/50', 'bg-blue-900/50'] },
  'gs': { keys: ['g', 's'], colors: ['bg-yellow-600/50', 'bg-slate-500/50'] },
  'rs': { keys: ['ru', 'sa'], colors: ['bg-red-800/50', 'bg-blue-800/50'] },
  'frlg': { keys: ['fr', 'lg'], colors: ['bg-red-800/50', 'bg-green-800/50'] },
  'dp': { keys: ['d', 'p'], colors: ['bg-sky-800/50', 'bg-pink-800/50'] },
  'hgss': { keys: ['hg', 'ss'], colors: ['bg-yellow-600/50', 'bg-slate-500/50'] },
  'bw': { keys: ['bla', 'w'], colors: ['bg-neutral-800/50', 'bg-stone-400/50'] },
  'bw2': { keys: ['bla2', 'w2'], colors: ['bg-neutral-800/50', 'bg-stone-400/50'] },
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


const PokemonCard: React.FC<PokemonCardProps> = ({ pokemon, isShiny, onToggleShiny, selectedGame }) => {
  const { t } = useLanguage();
  let formattedId: string;
  if (pokemon.id.includes('-')) {
    const [pokedexId, ...formParts] = pokemon.id.split('-');
    const capitalizedForm = formParts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('-');
    formattedId = `#${pokedexId.padStart(3, '0')}-${capitalizedForm}`;
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
    relative group ${cardBgColor} rounded-lg p-3 flex flex-col items-center justify-center 
    cursor-pointer transition-all duration-300 transform
    hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/20
    ${isShiny ? 'border-2 border-yellow-400' : 'border-2 border-transparent'}
  `;

  // Check for DLC availability when swsh is selected
  const hasSWSHDLC1 = useMemo(() => {
    if (selectedGame === 'swsh') {
      const availability = POKEMON_AVAILABILITY[pokemon.id] || [];
      return availability.includes('swdlc1') || availability.includes('shdlc1');
    }
    return false;
  }, [pokemon.id, selectedGame]);

  const hasSWSHDLC2 = useMemo(() => {
    if (selectedGame === 'swsh') {
      const availability = POKEMON_AVAILABILITY[pokemon.id] || [];
      return availability.includes('swdlc2') || availability.includes('shdlc2');
    }
    return false;
  }, [pokemon.id, selectedGame]);

  // Check for DLC availability when sv is selected
  const hasSVDLC1 = useMemo(() => {
    if (selectedGame === 'sv') {
      const availability = POKEMON_AVAILABILITY[pokemon.id] || [];
      return availability.includes('scdlc1') || availability.includes('vdlc1');
    }
    return false;
  }, [pokemon.id, selectedGame]);

  const hasSVDLC2 = useMemo(() => {
    if (selectedGame === 'sv') {
      const availability = POKEMON_AVAILABILITY[pokemon.id] || [];
      return availability.includes('scdlc2') || availability.includes('vdlc2');
    }
    return false;
  }, [pokemon.id, selectedGame]);

  // Check for DLC availability when lza is selected
  const hasLZADLC1 = useMemo(() => {
    if (selectedGame === 'lza') {
      const availability = POKEMON_AVAILABILITY[pokemon.id] || [];
      return availability.includes('lpzadlc1');
    }
    return false;
  }, [pokemon.id, selectedGame]);

  const isLocked = useMemo(() => {
    if (selectedGame && SHINY_LOCKED_POKEMON[selectedGame]) {
      return SHINY_LOCKED_POKEMON[selectedGame].includes(pokemon.id);
    }
    return false;
  }, [pokemon.id, selectedGame]);

  return (
    <div className={cardClasses} onClick={() => onToggleShiny(pokemon.id)}>
      {isShiny && (
        <div className="absolute top-2 right-2 text-yellow-400">
          <StarIcon className="w-5 h-5" filled={true} />
        </div>
      )}
      {hasSWSHDLC1 && (
        <div className="absolute top-2 left-2 group/dlc1">
          <IsleOfArmorIcon className="w-6 h-6" />
          <span className="absolute bottom-full left-0 mb-2 px-2 py-1 bg-gray-900/95 text-[10px] text-white rounded opacity-0 group-hover/dlc1:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20 border border-gray-700 shadow-xl backdrop-blur-sm">
            {t('dlc_isle_of_armor')}
          </span>
        </div>
      )}
      {hasSWSHDLC2 && (
        <div className="absolute top-2 left-2 group/dlc2" style={{ marginLeft: hasSWSHDLC1 ? '28px' : '0' }}>
          <CrownTundraIcon className="w-6 h-6" />
          <span className="absolute bottom-full left-0 mb-2 px-2 py-1 bg-gray-900/95 text-[10px] text-white rounded opacity-0 group-hover/dlc2:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20 border border-gray-700 shadow-xl backdrop-blur-sm">
            {t('dlc_crown_tundra')}
          </span>
        </div>
      )}
      {hasSVDLC1 && (
        <div className="absolute top-2 left-2 group/svdlc1">
          <TealMaskIcon className="w-6 h-6" />
          <span className="absolute bottom-full left-0 mb-2 px-2 py-1 bg-gray-900/95 text-[10px] text-white rounded opacity-0 group-hover/svdlc1:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20 border border-gray-700 shadow-xl backdrop-blur-sm">
            {t('dlc_teal_mask')}
          </span>
        </div>
      )}
      {hasSVDLC2 && (
        <div className="absolute top-2 left-2 group/svdlc2" style={{ marginLeft: hasSVDLC1 ? '28px' : '0' }}>
          <IndigoDiskIcon className="w-6 h-6" />
          <span className="absolute bottom-full left-0 mb-2 px-2 py-1 bg-gray-900/95 text-[10px] text-white rounded opacity-0 group-hover/svdlc2:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20 border border-gray-700 shadow-xl backdrop-blur-sm">
            {t('dlc_indigo_disk')}
          </span>
        </div>
      )}
      {hasLZADLC1 && (
        <div className="absolute top-2 left-2 group/lzadlc1">
          <MegaDimensionIcon className="w-12 h-6 -ml-1" />
          <span className="absolute bottom-full left-0 mb-2 px-2 py-1 bg-gray-900/95 text-[10px] text-white rounded opacity-0 group-hover/lzadlc1:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20 border border-gray-700 shadow-xl backdrop-blur-sm">
            {t('dlc_mega_dimension')}
          </span>
        </div>
      )}
      {isLocked && (
        <div className="absolute bottom-2 left-2 text-red-500/80 group-hover:text-red-500 transition-colors group/lock">
          <LockIcon className="w-5 h-5" />
          <span className="absolute bottom-full left-0 mb-2 px-2 py-1 bg-gray-900/95 text-[10px] text-white rounded opacity-0 group-hover/lock:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20 border border-gray-700 shadow-xl backdrop-blur-sm">
            {t('shiny_lock')}
          </span>
        </div>
      )}
      <div className="w-24 h-24 flex items-center justify-center">
        <img
          src={isShiny ? pokemon.shinySprite : pokemon.sprite}
          alt={pokemon.name}
          className="max-w-full max-h-full object-contain group-hover:animate-pulse"
          width="96"
          height="96"
          loading="lazy"
        />
      </div>
      <div className="text-center mt-2">
        <p className="text-sm font-bold capitalize text-white">{pokemon.name}</p>
        <p className="text-xs text-gray-400">{formattedId}</p>
      </div>
    </div>
  );
};

export default PokemonCard;
