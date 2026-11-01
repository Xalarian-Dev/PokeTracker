import React, { useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import type { Pokemon } from '../types';
import CircularProgress from './CircularProgress';
import { STARTER_IDS, MYTHICAL_IDS, LEGENDARY_IDS } from '../data/categories';

interface SpecialStatsProps {
    pokemonList: Pokemon[];
    shinyPokemons: Set<string>;
}

export const SpecialStats: React.FC<SpecialStatsProps> = ({ pokemonList, shinyPokemons }) => {
    const { t } = useLanguage();

    const categories = useMemo(() => {
        const byIds = (ids: string[]) => {
            const set = new Set(ids);
            return (p: Pokemon) => set.has(p.id);
        };
        const defs: { key: string; label: string; match: (p: Pokemon) => boolean }[] = [
            { key: 'starters', label: t('stats_special_starters'), match: byIds(STARTER_IDS) },
            { key: 'legendary', label: t('stats_special_legendary'), match: byIds(LEGENDARY_IDS) },
            { key: 'mythical', label: t('stats_special_mythical'), match: byIds(MYTHICAL_IDS) },
        ];
        return defs.map(({ key, label, match }) => {
            let total = 0;
            let shiny = 0;
            for (const p of pokemonList) {
                if (!match(p)) continue;
                total += 1;
                if (shinyPokemons.has(p.id)) shiny += 1;
            }
            return { key, label, total, shiny };
        });
    }, [pokemonList, shinyPokemons, t]);

    return (
        <section className="bg-gray-800 border border-gray-700 rounded-xl p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-300 mb-4">
                {t('stats_special')}
            </h3>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(7.5rem,1fr))] gap-x-4 gap-y-5">
                {categories.map(({ key, label, total, shiny }) => (
                    <div key={key} className="flex flex-col items-center">
                        <CircularProgress
                            progress={total > 0 ? (shiny / total) * 100 : 0}
                            shinyCount={shiny}
                            totalPokemon={total}
                            size={96}
                            {...(key === 'starters' && {
                                background: 'linear-gradient(to bottom, #e53935 40%, #f5f5f5 60%)',
                                textOutline: true,
                            })}
                        />
                        <p className="mt-1 text-sm font-semibold text-white">{label}</p>
                        <p className="text-xs text-gray-400">{shiny} / {total}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default SpecialStats;
