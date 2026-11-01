import React, { useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import {
  IsleOfArmorIcon, CrownTundraIcon, TealMaskIcon, IndigoDiskIcon, MegaDimensionIcon,
  LockIcon, EventIcon, CartridgeIcon, RaidEventIcon, DynamaxAdventureIcon,
} from './Icons';
import {
  POKEMON_AVAILABILITY, SHINY_LOCKED_POKEMON, EVENT_ITEM_POKEMON, DUAL_SLOT_REQ,
  RAID_EVENT_POKEMON, DYNAMAX_ADVENTURE_POKEMON, FRIEND_SAFARI_POKEMON, ISLAND_SCAN_POKEMON,
  ULTRA_WORMHOLE_POKEMON, DEXNAV_EXCLUSIVE_POKEMON, MIRAGE_SPOT_POKEMON, SPACE_TIME_DISTORTION_POKEMON,
} from '../data/games';

export type BadgeKey =
  | 'swdlc1' | 'swdlc2' | 'svdlc1' | 'svdlc2' | 'lzadlc1'
  | 'event' | 'raid' | 'dynamax' | 'cart' | 'lock'
  | 'safari' | 'islandscan' | 'wormhole' | 'dexnav' | 'mirage' | 'distort';

interface BadgeDef {
  labelKey: string;
  colorClass?: string;
  render: (className: string) => React.ReactNode;
}

const img = (src: string) => (className: string) => (
  <img src={src} alt="" aria-hidden="true" className={`${className} object-contain`} />
);

/** Définition unique de chaque icône (utilisée par les cartes bureau, mobile et la légende). */
export const BADGE_DEFS: Record<BadgeKey, BadgeDef> = {
  swdlc1: { labelKey: 'dlc_isle_of_armor', render: c => <IsleOfArmorIcon className={c} /> },
  swdlc2: { labelKey: 'dlc_crown_tundra', render: c => <CrownTundraIcon className={c} /> },
  svdlc1: { labelKey: 'dlc_teal_mask', render: c => <TealMaskIcon className={c} /> },
  svdlc2: { labelKey: 'dlc_indigo_disk', render: c => <IndigoDiskIcon className={c} /> },
  lzadlc1: { labelKey: 'dlc_mega_dimension', render: c => <MegaDimensionIcon className={c} /> },
  event: { labelKey: 'event_item_required', render: c => <EventIcon className={c} /> },
  raid: { labelKey: 'raid_event', colorClass: 'text-purple-400', render: c => <RaidEventIcon className={c} /> },
  dynamax: { labelKey: 'dynamax_adventure', colorClass: 'text-pink-400', render: c => <DynamaxAdventureIcon className={c} /> },
  cart: { labelKey: 'dual_slot_req', colorClass: 'text-gray-300', render: c => <CartridgeIcon className={c} /> },
  lock: { labelKey: 'shiny_lock', colorClass: 'text-red-400', render: c => <LockIcon className={c} /> },
  safari: { labelKey: 'friendSafari', render: img('/assets/safari-ball.png') },
  islandscan: { labelKey: 'islandScan', render: img('/assets/island-scan.svg') },
  wormhole: { labelKey: 'ultraWormhole', render: img('/assets/ultra-wormhole.png') },
  dexnav: { labelKey: 'dexNav', render: img('/assets/dexnav.png') },
  mirage: { labelKey: 'mirageSpot', render: img('/assets/mirage-spot.png') },
  distort: { labelKey: 'spaceTimeDistortion', render: img('/assets/ultra-wormhole.png') },
};

export const DLC_KEYS: BadgeKey[] = ['swdlc1', 'swdlc2', 'svdlc1', 'svdlc2', 'lzadlc1'];
export const BADGE_ORDER: BadgeKey[] = [
  'swdlc1', 'swdlc2', 'svdlc1', 'svdlc2', 'lzadlc1',
  'event', 'raid', 'dynamax', 'cart', 'lock', 'safari', 'islandscan', 'wormhole', 'dexnav', 'mirage', 'distort',
];

const CART_COLORS: Record<string, string> = {
  FireRed: 'text-red-500', LeafGreen: 'text-green-500', Ruby: 'text-red-600',
  Sapphire: 'text-blue-500', Emerald: 'text-emerald-400',
};

export interface CardBadge {
  key: BadgeKey;
  /** Nom de la cartouche GBA requise (badge « cart » uniquement) */
  cart?: string;
}

const has = (availability: string[], ...ids: string[]) => ids.some(i => availability.includes(i));
const isOneOf = (game: string | null, ...games: string[]) => !!game && games.includes(game);

/** Liste des icônes à afficher sur une carte pour un Pokémon et un jeu sélectionné. */
export function computeBadges(pokemonId: string, selectedGame: string | null): CardBadge[] {
  const out: CardBadge[] = [];
  const num = Number(pokemonId);
  const avail = POKEMON_AVAILABILITY[pokemonId] || [];

  if (selectedGame === 'swsh') {
    if (has(avail, 'swdlc1', 'shdlc1')) out.push({ key: 'swdlc1' });
    if (has(avail, 'swdlc2', 'shdlc2')) out.push({ key: 'swdlc2' });
  }
  if (selectedGame === 'sv') {
    if (has(avail, 'scdlc1', 'vdlc1')) out.push({ key: 'svdlc1' });
    if (has(avail, 'scdlc2', 'vdlc2')) out.push({ key: 'svdlc2' });
  }
  if (selectedGame === 'lza' && has(avail, 'lpzadlc1')) out.push({ key: 'lzadlc1' });

  if (selectedGame && EVENT_ITEM_POKEMON[selectedGame]?.includes(pokemonId)) out.push({ key: 'event' });
  if (selectedGame === 'sv' && RAID_EVENT_POKEMON['sv']?.includes(pokemonId)) out.push({ key: 'raid' });
  if (selectedGame === 'swsh' && DYNAMAX_ADVENTURE_POKEMON['swsh']?.includes(pokemonId)) out.push({ key: 'dynamax' });
  if (selectedGame === 'dp' && DUAL_SLOT_REQ[pokemonId]) out.push({ key: 'cart', cart: DUAL_SLOT_REQ[pokemonId] });
  if (selectedGame && SHINY_LOCKED_POKEMON[selectedGame]?.includes(pokemonId)) out.push({ key: 'lock' });

  if (isOneOf(selectedGame, 'xy', 'x', 'y') && FRIEND_SAFARI_POKEMON.includes(num)) out.push({ key: 'safari' });

  if (isOneOf(selectedGame, 'usum', 'us', 'um')) {
    if (ISLAND_SCAN_POKEMON.includes(num)) out.push({ key: 'islandscan' });
    if (ULTRA_WORMHOLE_POKEMON.legendaries.includes(num) || ULTRA_WORMHOLE_POKEMON.ultraBeasts.includes(num)) {
      out.push({ key: 'wormhole' });
    }
  }

  if (isOneOf(selectedGame, 'oras', 'or', 'as')) {
    if (DEXNAV_EXCLUSIVE_POKEMON.both.includes(num) || DEXNAV_EXCLUSIVE_POKEMON.omegaRuby.includes(num)
      || DEXNAV_EXCLUSIVE_POKEMON.alphaSapphire.includes(num)) {
      out.push({ key: 'dexnav' });
    }
    let mirage = MIRAGE_SPOT_POKEMON.nonLegendaries.includes(num) || MIRAGE_SPOT_POKEMON.legendaries.both.includes(num);
    if (selectedGame === 'or' && MIRAGE_SPOT_POKEMON.legendaries.omegaRuby.includes(num)) mirage = true;
    if (selectedGame === 'as' && MIRAGE_SPOT_POKEMON.legendaries.alphaSapphire.includes(num)) mirage = true;
    if (selectedGame === 'oras'
      && (MIRAGE_SPOT_POKEMON.legendaries.omegaRuby.includes(num) || MIRAGE_SPOT_POKEMON.legendaries.alphaSapphire.includes(num))) {
      mirage = true;
    }
    if (mirage) out.push({ key: 'mirage' });
  }

  if (selectedGame === 'la' && SPACE_TIME_DISTORTION_POKEMON.includes(pokemonId)) out.push({ key: 'distort' });

  return out;
}

export const useCardBadges = (pokemonId: string, selectedGame: string | null) =>
  useMemo(() => computeBadges(pokemonId, selectedGame), [pokemonId, selectedGame]);

/** Libellé traduit d'une icône */
export const useBadgeLabel = () => {
  const { t } = useLanguage();
  return (badge: CardBadge): string => {
    if (badge.key === 'cart') {
      return t('dual_slot_req', { game: t(`gba_${(badge.cart || '').toLowerCase()}`) || badge.cart || '' });
    }
    return t(BADGE_DEFS[badge.key].labelKey);
  };
};

export const badgeColor = (badge: CardBadge): string =>
  badge.key === 'cart' ? (CART_COLORS[badge.cart || ''] || 'text-gray-300') : (BADGE_DEFS[badge.key].colorClass || '');

interface BadgeIconProps {
  badge: CardBadge;
  label: string;
  className: string;
  /** Infobulle au survol (bureau). Le libellé reste toujours disponible via aria-label / title. */
  tooltip?: boolean;
}

/** Une icône : libellé lisible (aria-label + title) et, sur bureau, infobulle visible au survol. */
export const BadgeIcon: React.FC<BadgeIconProps> = ({ badge, label, className, tooltip = false }) => (
  <span className={`group/badge relative inline-flex ${badgeColor(badge)}`} role="img" aria-label={label} title={label}>
    {BADGE_DEFS[badge.key].render(className)}
    {tooltip && (
      <span className="absolute left-0 bottom-full mb-1 px-2 py-1 bg-gray-900/95 text-xs text-white rounded opacity-0 group-hover/badge:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20 border border-gray-700 shadow-xl">
        {label}
      </span>
    )}
  </span>
);
