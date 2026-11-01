import React, { useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import type { Pokemon } from '../types';
import CircularProgress from './CircularProgress';

interface RegionalStatsProps {
    pokemonList: Pokemon[];
    shinyPokemons: Set<string>;
}

const REGIONS = ['Alola', 'Galar', 'Hisui', 'Paldea'];

export const RegionalStats: React.FC<RegionalStatsProps> = ({ pokemonList, shinyPokemons }) => {
    const { t, getRegionName } = useLanguage();

    const regions = useMemo(() => REGIONS.map((region) => {
        let total = 0;
        let shiny = 0;
        for (const p of pokemonList) {
            if (p.region !== region) continue;
            total += 1;
            if (shinyPokemons.has(p.id)) shiny += 1;
        }
        return { region, total, shiny };
    }), [pokemonList, shinyPokemons]);

    return (
        <section className="bg-gray-800 border border-gray-700 rounded-xl p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-300 mb-4">
                {t('stats_regional')}
            </h3>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(7.5rem,1fr))] gap-x-4 gap-y-5">
                {regions.map(({ region, total, shiny }) => (
                    <div key={region} className="flex flex-col items-center">
                        <CircularProgress
                            progress={total > 0 ? (shiny / total) * 100 : 0}
                            shinyCount={shiny}
                            totalPokemon={total}
                            size={96}
                        />
                        <p className="mt-1 text-sm font-semibold text-white">{getRegionName(region)}</p>
                        <p className="text-xs text-gray-400">{shiny} / {total}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default RegionalStats;
