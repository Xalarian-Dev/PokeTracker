import React, { useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import type { Pokemon } from '../types';
import CircularProgress from './CircularProgress';
import { STARTER_IDS, MYTHICAL_IDS, LEGENDARY_IDS } from '../data/categories';

interface SpecialStatsProps {
    pokemonList: Pokemon[];
    shinyPokemons: Set<string>;
}

/** Couronne dorée (légendaires) */
const CrownDecoration = () => (
    <svg viewBox="0 0 64 64" width="58%" height="58%" fill="none">
        <path d="M8 46 L4 20 L20 32 L32 12 L44 32 L60 20 L56 46 Z" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" strokeLinejoin="round" />
        <rect x="8" y="48" width="48" height="6" rx="2" fill="#f59e0b" />
        <circle cx="4" cy="20" r="3" fill="#fde68a" />
        <circle cx="32" cy="12" r="3.5" fill="#fde68a" />
        <circle cx="60" cy="20" r="3" fill="#fde68a" />
    </svg>
);

/** Quelques étoiles (mythiques) */
const StarsDecoration = () => (
    <svg viewBox="0 0 64 64" width="72%" height="72%" fill="#e9d5ff">
        <path d="M32 6 l3.4 10.2 10.6 .2 -8.5 6.3 3.2 10.1 -8.7 -6.2 -8.7 6.2 3.2 -10.1 -8.5 -6.3 10.6 -.2z" transform="translate(0 -2) scale(1)" />
        <path d="M12 36 l1.9 5.6 5.9 .1 -4.7 3.5 1.8 5.6 -4.9 -3.4 -4.9 3.4 1.8 -5.6 -4.7 -3.5 5.9 -.1z" />
        <path d="M52 34 l1.7 5 5.3 .1 -4.2 3.1 1.6 5 -4.4 -3 -4.4 3 1.6 -5 -4.2 -3.1 5.3 -.1z" />
        <path d="M44 8 l1 3 3.1 .1 -2.5 1.9 1 3 -2.6 -1.8 -2.6 1.8 1 -3 -2.5 -1.9 3.1 -.1z" />
    </svg>
);

/** Fond diffus et décor de chaque catégorie spéciale */
const SPECIAL_STYLE: Record<string, { background?: string; decoration?: React.ReactNode }> = {
    legendary: { background: 'radial-gradient(circle at 35% 30%, #f59e0b, transparent 95%)', decoration: <CrownDecoration /> },
    mythical: { background: 'radial-gradient(circle at 35% 30%, #a855f7, transparent 95%)', decoration: <StarsDecoration /> },
};

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
                            {...SPECIAL_STYLE[key]}
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
