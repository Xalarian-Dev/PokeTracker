import type { Pokemon } from '../types';
import { POKEMON_AVAILABILITY } from '../data/games';
import { POKEMON_WITH_MULTIPLE_FORMS } from '../data/pokemon';
import { SPRITE_BASE } from '../data/spriteBase';

type Keys = string | string[];

/**
 * Couleur de fond des cartes quand un jeu à deux versions est sélectionné.
 * (source unique, partagée par la carte bureau et la carte mobile)
 */
const gameColorMap: Record<string, { keys: [Keys, Keys]; colors: [string, string] }> = {
  rb: { keys: ['r', 'b'], colors: ['bg-red-900/50', 'bg-blue-900/50'] },
  gs: { keys: ['g', 's'], colors: ['bg-yellow-600/50', 'bg-slate-500/50'] },
  rs: { keys: ['ru', 'sa'], colors: ['bg-red-800/50', 'bg-blue-800/50'] },
  frlg: { keys: ['fr', 'lg'], colors: ['bg-red-800/50', 'bg-green-800/50'] },
  dp: { keys: ['d', 'p'], colors: ['bg-sky-800/50', 'bg-pink-800/50'] },
  hgss: { keys: ['hg', 'ss'], colors: ['bg-yellow-600/50', 'bg-slate-500/50'] },
  bw: { keys: ['bla', 'w'], colors: ['bg-black', 'bg-gray-400/50'] },
  bw2: { keys: ['bla2', 'w2'], colors: ['bg-black', 'bg-gray-400/50'] },
  xy: { keys: ['x', 'y'], colors: ['bg-blue-800/50', 'bg-red-800/50'] },
  oras: { keys: ['or', 'as'], colors: ['bg-red-800/50', 'bg-blue-800/50'] },
  sm: { keys: ['su', 'm'], colors: ['bg-orange-500/50', 'bg-purple-900/50'] },
  usum: { keys: ['us', 'um'], colors: ['bg-orange-500/50', 'bg-purple-900/50'] },
  lgpe: { keys: ['lgp', 'lge'], colors: ['bg-yellow-400/50', 'bg-amber-800/50'] },
  swsh: { keys: [['sw', 'swdlc1', 'swdlc2'], ['sh', 'shdlc1', 'shdlc2']], colors: ['bg-cyan-600/50', 'bg-red-600/50'] },
  bdsp: { keys: ['bd', 'sp'], colors: ['bg-sky-800/50', 'bg-pink-800/50'] },
  sv: { keys: [['sc', 'scdlc1', 'scdlc2'], ['v', 'vdlc1', 'vdlc2']], colors: ['bg-red-700/50', 'bg-purple-800/50'] },
};

/** Le jeu sélectionné a-t-il un fond de carte coloré par version ? */
export const hasVersionColors = (game: string | null): boolean => !!game && !!gameColorMap[game];

export function getCardBgColor(pokemonId: string, selectedGame: string | null): string {
  if (selectedGame && gameColorMap[selectedGame]) {
    const { keys, colors } = gameColorMap[selectedGame];
    const availability = POKEMON_AVAILABILITY[pokemonId] || [];
    const check = (k: Keys) => (Array.isArray(k) ? k.some(c => availability.includes(c)) : availability.includes(k));
    const in1 = check(keys[0]);
    const in2 = check(keys[1]);
    if (in1 && !in2) return colors[0];
    if (!in1 && in2) return colors[1];
  }
  return 'bg-gray-800';
}

const HOME_SPRITE_BASE_URL = SPRITE_BASE;

/** Sprite affiché : celui de la forme favorite si elle existe, sinon le sprite d'origine. */
export function getDisplaySprite(pokemon: Pokemon, isShiny: boolean, favoriteFormId?: string): string {
  const multi = POKEMON_WITH_MULTIPLE_FORMS[pokemon.id];
  if (multi && favoriteFormId) {
    const fav = multi.forms.find(f => f.id === favoriteFormId);
    if (fav) return `${HOME_SPRITE_BASE_URL}${isShiny ? 'shiny/' : ''}${fav.spriteId}.png`;
  }
  return isShiny ? pokemon.shinySprite : pokemon.sprite;
}
