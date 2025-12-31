
import React, { useMemo } from 'react';
import type { Pokemon } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { SparklesIcon, IsleOfArmorIcon, CrownTundraIcon, TealMaskIcon, IndigoDiskIcon, MegaDimensionIcon, LockIcon, EventIcon, CartridgeIcon, RaidEventIcon, DynamaxAdventureIcon } from './Icons';
import { POKEMON_AVAILABILITY, SHINY_LOCKED_POKEMON, EVENT_ITEM_POKEMON, DUAL_SLOT_REQ, RAID_EVENT_POKEMON, DYNAMAX_ADVENTURE_POKEMON, FRIEND_SAFARI_POKEMON, ISLAND_SCAN_POKEMON, ULTRA_WORMHOLE_POKEMON, DEXNAV_EXCLUSIVE_POKEMON, MIRAGE_SPOT_POKEMON } from '../data/games';

interface PokemonCardProps {
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


const PokemonCard: React.FC<PokemonCardProps> = ({ pokemon, isShiny, onToggleShiny, selectedGame, isGrayedOut = false }) => {
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
    cursor-pointer transition-all duration-300 transform select-none
    hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/20
    ${isShiny ? 'border-2 border-amber-400' : cardBgColor === 'bg-black' ? 'border-2 border-gray-700' : 'border-2 border-transparent'}
    overflow-hidden
  `;

  const shinyGlowStyle = isShiny ? {
    boxShadow: '0 0 15px 3px rgba(251, 191, 36, 0.35)'
  } : {};

  const hasFriendSafariBadge = useMemo(() => {
    return (selectedGame === 'xy' || selectedGame === 'x' || selectedGame === 'y') &&
      FRIEND_SAFARI_POKEMON.includes(Number(pokemon.id));
  }, [selectedGame, pokemon.id]);

  // Check for Island Scan Pokemon (USUM)
  const hasIslandScanBadge = useMemo(() => {
    return (selectedGame === 'usum' || selectedGame === 'us' || selectedGame === 'um') &&
      ISLAND_SCAN_POKEMON.includes(Number(pokemon.id));
  }, [selectedGame, pokemon.id]);

  // Check for Ultra Wormhole Pokemon (USUM)
  const hasUltraWormholeBadge = useMemo(() => {
    if (selectedGame === 'usum' || selectedGame === 'us' || selectedGame === 'um') {
      const pokemonId = Number(pokemon.id);
      return ULTRA_WORMHOLE_POKEMON.legendaries.includes(pokemonId) ||
        ULTRA_WORMHOLE_POKEMON.ultraBeasts.includes(pokemonId);
    }
    return false;
  }, [selectedGame, pokemon.id]);

  // Check for DexNav Exclusive Pokemon (ORAS)
  const hasDexNavBadge = useMemo(() => {
    if (selectedGame === 'oras' || selectedGame === 'or' || selectedGame === 'as') {
      const pokemonId = Number(pokemon.id);
      return DEXNAV_EXCLUSIVE_POKEMON.both.includes(pokemonId) ||
        DEXNAV_EXCLUSIVE_POKEMON.omegaRuby.includes(pokemonId) ||
        DEXNAV_EXCLUSIVE_POKEMON.alphaSapphire.includes(pokemonId);
    }
    return false;
  }, [selectedGame, pokemon.id]);

  // Check for Mirage Spot Pokemon (ORAS)
  const hasMirageSpotBadge = useMemo(() => {
    if (selectedGame === 'oras' || selectedGame === 'or' || selectedGame === 'as') {
      const pokemonId = Number(pokemon.id);

      // Check non-legendaries (available in both versions)
      if (MIRAGE_SPOT_POKEMON.nonLegendaries.includes(pokemonId)) return true;

      // Check legendaries available in both versions
      if (MIRAGE_SPOT_POKEMON.legendaries.both.includes(pokemonId)) return true;

      // Check version-exclusive legendaries
      if (selectedGame === 'or' && MIRAGE_SPOT_POKEMON.legendaries.omegaRuby.includes(pokemonId)) return true;
      if (selectedGame === 'as' && MIRAGE_SPOT_POKEMON.legendaries.alphaSapphire.includes(pokemonId)) return true;
      if (selectedGame === 'oras') {
        // When "both" filter is active, show all Mirage Spot Pokemon
        return MIRAGE_SPOT_POKEMON.legendaries.omegaRuby.includes(pokemonId) ||
          MIRAGE_SPOT_POKEMON.legendaries.alphaSapphire.includes(pokemonId);
      }
    }
    return false;
  }, [selectedGame, pokemon.id]);

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

  const hasEventItem = useMemo(() => {
    if (selectedGame && EVENT_ITEM_POKEMON[selectedGame]) {
      return EVENT_ITEM_POKEMON[selectedGame].includes(pokemon.id);
    }
    return false;
  }, [pokemon.id, selectedGame]);

  const requiredCart = useMemo(() => {
    if (selectedGame === 'dp' && DUAL_SLOT_REQ[pokemon.id]) {
      return DUAL_SLOT_REQ[pokemon.id];
    }
    return null;
  }, [pokemon.id, selectedGame]);

  const isRaidEvent = useMemo(() => {
    if (selectedGame === 'sv' && RAID_EVENT_POKEMON['sv']) {
      return RAID_EVENT_POKEMON['sv'].includes(pokemon.id);
    }
    return false;
  }, [pokemon.id, selectedGame]);

  const isDynamaxAdventure = useMemo(() => {
    if (selectedGame === 'swsh' && DYNAMAX_ADVENTURE_POKEMON['swsh']) {
      return DYNAMAX_ADVENTURE_POKEMON['swsh'].includes(pokemon.id);
    }
    return false;
  }, [pokemon.id, selectedGame]);

  const cartridgeColor = useMemo(() => {
    if (!requiredCart) return 'text-gray-300';
    const colorMap: Record<string, string> = {
      'FireRed': 'text-red-500',
      'LeafGreen': 'text-green-500',
      'Ruby': 'text-red-600',
      'Sapphire': 'text-blue-500',
      'Emerald': 'text-emerald-400',
    };
    return colorMap[requiredCart] || 'text-gray-300';
  }, [requiredCart]);

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
        <div className="absolute top-2 right-2 text-amber-400 drop-shadow-[0_2px_4px_rgba(251,191,36,0.5)]">
          <SparklesIcon className="w-5 h-5" />
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

      {/* Status Icons Container (Bottom Left) */}
      <div className="absolute bottom-2 left-2 flex flex-col items-start gap-1 z-10">

        {/* Event Icon (Above Lock) */}
        {hasEventItem && (
          <div className="group/event relative">
            <EventIcon className="w-5 h-5 drop-shadow-md" />
            <span className="absolute left-0 bottom-full mb-1 px-2 py-1 bg-gray-900/95 text-[10px] text-white rounded opacity-0 group-hover/event:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-gray-700 shadow-xl backdrop-blur-sm">
              {t('event_item_required')}
            </span>
          </div>
        )}

        {/* Raid Event Icon */}
        {isRaidEvent && (
          <div className="group/raid relative text-purple-400 group-hover:text-purple-300 transition-colors">
            <RaidEventIcon className="w-5 h-5 drop-shadow-md" />
            <span className="absolute left-0 bottom-full mb-1 px-2 py-1 bg-gray-900/95 text-[10px] text-white rounded opacity-0 group-hover/raid:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-gray-700 shadow-xl backdrop-blur-sm">
              {t('raid_event')}
            </span>
          </div>
        )}

        {/* Dynamax Adventure Icon */}
        {isDynamaxAdventure && (
          <div className="group/dynamax relative text-pink-400 group-hover:text-pink-300 transition-colors">
            <DynamaxAdventureIcon className="w-5 h-5 drop-shadow-md" />
            <span className="absolute left-0 bottom-full mb-1 px-2 py-1 bg-gray-900/95 text-[10px] text-white rounded opacity-0 group-hover/dynamax:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-gray-700 shadow-xl backdrop-blur-sm">
              {t('dynamax_adventure')}
            </span>
          </div>
        )}

        {/* Dual Slot Icon */}
        {requiredCart && (
          <div className={`group/cart relative ${cartridgeColor} group-hover:brightness-125 transition-all drop-shadow-md`}>
            <CartridgeIcon className="w-5 h-5" />
            <span className="absolute left-0 bottom-full mb-1 px-2 py-1 bg-gray-900 text-[10px] text-white rounded opacity-0 group-hover/cart:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-gray-700 shadow-xl">
              {t('dual_slot_req', { game: t(`gba_${requiredCart.toLowerCase()}` as any) || requiredCart })}
            </span>
          </div>
        )}

        {/* Lock Icon */}
        {isLocked && (
          <div className="group/lock relative text-red-500/80 group-hover:text-red-500 transition-colors">
            <LockIcon className="w-5 h-5" />
            <span className="absolute left-0 bottom-full mb-1 px-2 py-1 bg-gray-900/95 text-[10px] text-white rounded opacity-0 group-hover/lock:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-gray-700 shadow-xl backdrop-blur-sm">
              {t('shiny_lock')}
            </span>
          </div>
        )}

        {/* Friend Safari Badge */}
        {hasFriendSafariBadge && (
          <div className="group/safari relative text-green-500 group-hover:text-green-400 transition-colors">
            <img
              src="/assets/safari-ball.png"
              alt={t('friendSafari')}
              className="w-5 h-5 object-contain drop-shadow-md"
            />
            <span className="absolute left-0 bottom-full mb-1 px-2 py-1 bg-gray-900/95 text-[10px] text-white rounded opacity-0 group-hover/safari:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-gray-700 shadow-xl backdrop-blur-sm">
              {t('friendSafari')}
            </span>
          </div>
        )}

        {/* Island Scan Badge */}
        {hasIslandScanBadge && (
          <div className="group/islandscan relative text-purple-500 group-hover:text-purple-400 transition-colors">
            <img
              src="/assets/island-scan.svg"
              alt={t('islandScan')}
              className="w-5 h-5 object-contain drop-shadow-md"
            />
            <span className="absolute left-0 bottom-full mb-1 px-2 py-1 bg-gray-900/95 text-[10px] text-white rounded opacity-0 group-hover/islandscan:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-gray-700 shadow-xl backdrop-blur-sm">
              {t('islandScan')}
            </span>
          </div>
        )}

        {/* Ultra Wormhole Badge */}
        {hasUltraWormholeBadge && (
          <div className="group/wormhole relative text-cyan-400 group-hover:text-cyan-300 transition-colors">
            <img
              src="/assets/ultra-wormhole.png"
              alt={t('ultraWormhole')}
              className="w-5 h-5 object-contain drop-shadow-md"
            />
            <span className="absolute left-0 bottom-full mb-1 px-2 py-1 bg-gray-900/95 text-[10px] text-white rounded opacity-0 group-hover/wormhole:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-gray-700 shadow-xl backdrop-blur-sm">
              {t('ultraWormhole')}
            </span>
          </div>
        )}

        {/* DexNav Badge */}
        {hasDexNavBadge && (
          <div className="group/dexnav relative text-red-400 group-hover:text-red-300 transition-colors">
            <img
              src="/assets/dexnav.png"
              alt={t('dexNav')}
              className="w-5 h-5 object-contain drop-shadow-md"
            />
            <span className="absolute left-0 bottom-full mb-1 px-2 py-1 bg-gray-900/95 text-[10px] text-white rounded opacity-0 group-hover/dexnav:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-gray-700 shadow-xl backdrop-blur-sm">
              {t('dexNav')}
            </span>
          </div>
        )}

        {/* Mirage Spot Badge */}
        {hasMirageSpotBadge && (
          <div className="group/mirage relative text-purple-400 group-hover:text-purple-300 transition-colors">
            <img
              src="/assets/mirage-spot.png"
              alt={t('mirageSpot')}
              className="w-5 h-5 object-contain drop-shadow-md"
            />
            <span className="absolute left-0 bottom-full mb-1 px-2 py-1 bg-gray-900/95 text-[10px] text-white rounded opacity-0 group-hover/mirage:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-gray-700 shadow-xl backdrop-blur-sm">
              {t('mirageSpot')}
            </span>
          </div>
        )}


      </div>


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
      <div className="text-center mt-2 w-full px-0.5 overflow-hidden">
        <p className="text-sm font-bold text-white truncate">{pokemon.name}</p>
        <p className="text-xs text-gray-400">{formattedId}</p>
      </div>
    </div >
  );
};

export default React.memo(PokemonCard);
