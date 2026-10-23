import React, { useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import type { Pokemon } from '../types';
import CircularProgress from './CircularProgress';
import { GAME_LIST, GAME_GROUP_MAP, POKEMON_AVAILABILITY, SHINY_LOCKED_POKEMON } from '../data/games';

interface GameStatsProps {
    pokemonList: Pokemon[];
    shinyPokemons: Set<string>;
}

export const GameStats: React.FC<GameStatsProps> = ({ pokemonList, shinyPokemons }) => {
    const { t, getGameName } = useLanguage();

    // Pour chaque groupe de jeux : les Pokémon disponibles (hors shinylockés)
    // et, parmi eux, ceux déjà obtenus en shiny (la collection est globale).
    const games = useMemo(() => {
        return Object.keys(GAME_LIST).map(group => {
            const codes = new Set(GAME_GROUP_MAP[group] ?? []);
            const locked = new Set(SHINY_LOCKED_POKEMON[group] ?? []);
            let total = 0;
            let shiny = 0;
            for (const p of pokemonList) {
                if (locked.has(p.id)) continue;
                const availability = POKEMON_AVAILABILITY[p.id] ?? [];
                if (!availability.some(code => codes.has(code))) continue;
                total += 1;
                if (shinyPokemons.has(p.id)) shiny += 1;
            }
            return { group, total, shiny };
        }).filter(g => g.total > 0);
    }, [pokemonList, shinyPokemons]);

    return (
        <div className="p-4 pt-0">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
                {t('stats_by_game')}
            </h3>
            <div className="grid grid-cols-2 gap-4">
                {games.map(({ group, total, shiny }) => (
                    <div key={group} className="flex flex-col items-center text-center">
                        <CircularProgress
                            progress={(shiny / total) * 100}
                            shinyCount={shiny}
                            totalPokemon={total}
                            size={80}
                        />
                        <p className="mt-1 text-sm font-semibold text-white leading-tight">{getGameName(group)}</p>
                        <p className="text-xs text-gray-400">{shiny} / {total}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GameStats;
