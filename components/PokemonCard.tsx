
import React, { useMemo } from 'react';
import type { Pokemon } from '../types';
import { StarIcon } from './Icons';
import { POKEMON_AVAILABILITY } from '../data/games';

interface PokemonCardProps {
  pokemon: Pokemon;
  isShiny: boolean;
  onToggleShiny: (id: string) => void;
  selectedGame: string | null;
}

const gameColorMap: Record<string, { keys: [string, string]; colors: [string, string] }> = {
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
  'swsh': { keys: ['sw', 'sh'], colors: ['bg-cyan-800/50', 'bg-fuchsia-800/50'] },
  'bdsp': { keys: ['bd', 'sp'], colors: ['bg-sky-800/50', 'bg-pink-800/50'] },
  'sv': { keys: ['sc', 'v'], colors: ['bg-red-700/50', 'bg-purple-800/50'] }
};


const PokemonCard: React.FC<PokemonCardProps> = ({ pokemon, isShiny, onToggleShiny, selectedGame }) => {
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

      const inGame1 = availability.includes(keys[0]);
      const inGame2 = availability.includes(keys[1]);

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

  return (
    <div className={cardClasses} onClick={() => onToggleShiny(pokemon.id)}>
      {isShiny && (
        <div className="absolute top-2 right-2 text-yellow-400">
          <StarIcon className="w-5 h-5" filled={true} />
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
