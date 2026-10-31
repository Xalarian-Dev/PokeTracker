import React, { useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import type { Pokemon } from '../types';
import CircularProgress from './CircularProgress';

interface GenerationStatsProps {
    pokemonList: Pokemon[];
    shinyPokemons: Set<string>;
}

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
const toRoman = (n: number): string => ROMAN[n - 1] ?? String(n);

export const GenerationStats: React.FC<GenerationStatsProps> = ({ pokemonList, shinyPokemons }) => {
    const { t } = useLanguage();

    const generations = useMemo(() => {
        const byGen = new Map<number, { total: number; shiny: number }>();
        for (const p of pokemonList) {
            const entry = byGen.get(p.generation) ?? { total: 0, shiny: 0 };
            entry.total += 1;
            if (shinyPokemons.has(p.id)) entry.shiny += 1;
            byGen.set(p.generation, entry);
        }
        return [...byGen.entries()].sort(([a], [b]) => a - b);
    }, [pokemonList, shinyPokemons]);

    return (
        <div className="p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
                {t('stats_by_generation')}
            </h3>
            <div className="grid grid-cols-2 gap-4">
                {generations.map(([gen, { total, shiny }]) => (
                    <div key={gen} className="flex flex-col items-center">
                        <CircularProgress
                            progress={total > 0 ? (shiny / total) * 100 : 0}
                            shinyCount={shiny}
                            totalPokemon={total}
                            size={80}
                            watermark={toRoman(gen)}
                            background="radial-gradient(circle at 35% 30%, #6d7bd4, transparent 95%)"
                        />
                        <p className="mt-1 text-sm font-semibold text-white">{t('stats_generation_label', { n: gen })}</p>
                        <p className="text-xs text-gray-400">{shiny} / {total}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GenerationStats;
