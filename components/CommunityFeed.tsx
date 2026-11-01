import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../services/supabase';

interface FeedEntry {
    id: string;
    pokemon_id: string;
    caught_at: string;
    trainer_id: string;
    display_name: string;
    /** Jeu et rencontres enregistrés avec la capture (page Chasse), absents des anciennes entrées */
    game?: string | null;
    encounters?: number | null;
    isNew?: boolean;
}

const HOME_SPRITE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/';

function getSpriteUrl(pokemonId: string): string {
    const numericId = pokemonId.includes('-') ? pokemonId.split('-')[0] : pokemonId;
    return `${HOME_SPRITE}${numericId}.png`;
}

function formatDate(iso: string, language: string): string {
    const date = new Date(iso);
    const localeMap: Record<string, string> = { fr: 'fr-FR', en: 'en-GB', jp: 'ja-JP', es: 'es-ES' };
    return date.toLocaleString(localeMap[language] || 'en-GB', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

const MOCK_FEED: FeedEntry[] = [
    { id: 'm1', pokemon_id: '25',      trainer_id: 'AshKetchum',  display_name: 'AshKetchum',  game: 'sc', encounters: 1843,  caught_at: new Date(Date.now() - 1  * 60000).toISOString() },
    { id: 'm2', pokemon_id: '6',       trainer_id: 'Misty',       display_name: 'Misty',       game: 'lgp', encounters: 312,       caught_at: new Date(Date.now() - 4  * 60000).toISOString() },
    { id: 'm3', pokemon_id: '149',     trainer_id: 'Brock',       display_name: 'Brock',       caught_at: new Date(Date.now() - 12 * 60000).toISOString() },
    { id: 'm4', pokemon_id: '143',     trainer_id: 'Gary',        display_name: 'Gary',        caught_at: new Date(Date.now() - 25 * 60000).toISOString() },
    { id: 'm5', pokemon_id: '249',     trainer_id: 'Giovanni',    display_name: 'Giovanni',    caught_at: new Date(Date.now() - 47 * 60000).toISOString() },
    { id: 'm6', pokemon_id: '384',     trainer_id: 'Lance',       display_name: 'Lance',       caught_at: new Date(Date.now() - 63 * 60000).toISOString() },
    { id: 'm7', pokemon_id: '445',     trainer_id: 'Cynthia',     display_name: 'Cynthia',     caught_at: new Date(Date.now() - 90 * 60000).toISOString() },
    { id: 'm8', pokemon_id: '196',     trainer_id: 'AshKetchum',  display_name: 'AshKetchum',  caught_at: new Date(Date.now() - 110 * 60000).toISOString() },
];

async function fetchFeed(): Promise<FeedEntry[]> {
    if (import.meta.env.DEV) return MOCK_FEED;
    // Sans client Supabase (déploiement Docker) : le fil vient de l'API du serveur
    if (!supabase) {
        try {
            const response = await fetch('/api/public/feed', { cache: 'no-store' });
            if (!response.ok) return [];
            const json = await response.json();
            return (json.feed ?? []) as FeedEntry[];
        } catch {
            return [];
        }
    }
    const { data, error } = await supabase
        .from('community_feed')
        .select('id, pokemon_id, caught_at, trainer_id, game, encounters')
        .order('caught_at', { ascending: false })
        .order('seq', { ascending: false })
        .limit(40);
    if (error || !data) return [];
    return data.map(row => ({
        id: row.id,
        pokemon_id: row.pokemon_id,
        caught_at: row.caught_at,
        trainer_id: row.trainer_id,
        display_name: row.trainer_id,
        game: row.game ?? null,
        encounters: row.encounters ?? null,
    }));
}

interface CommunityFeedProps {
    /** « grid » : grandes cartes (page Communauté) ; « compact » : liste serrée (accueil, panneau étroit) */
    variant?: 'grid' | 'compact';
    /** Nombre maximum d'entrées affichées */
    limit?: number;
}

export const CommunityFeed: React.FC<CommunityFeedProps> = ({ variant = 'compact', limit }) => {
    const { t, language, getPokemonName, gameVersions } = useLanguage();
    const [entries, setEntries] = useState<FeedEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const newIdTimeouts = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

    const clearNew = useCallback((id: string) => {
        setEntries(prev => prev.map(e => e.id === id ? { ...e, isNew: false } : e));
        newIdTimeouts.current.delete(id);
    }, []);

    const mergeEntries = useCallback((fresh: FeedEntry[]) => {
        setEntries(prev => {
            const prevIds = new Set(prev.map(e => e.id));
            const newEntries = fresh
                .filter(e => !prevIds.has(e.id))
                .map(e => ({ ...e, isNew: true }));
            if (newEntries.length === 0) return prev;
            newEntries.forEach(e => {
                const t = setTimeout(() => clearNew(e.id), 4000);
                newIdTimeouts.current.set(e.id, t);
            });
            return [...newEntries, ...prev].slice(0, 40);
        });
    }, [clearNew]);

    // Initial load
    useEffect(() => {
        fetchFeed().then(data => {
            setEntries(data);
            setLoading(false);
        });
    }, []);

    // Polling every 10s — replaces full list, detects new and removed entries
    useEffect(() => {
        if (import.meta.env.DEV) return;
        const interval = setInterval(async () => {
            const fresh = await fetchFeed();
            setEntries(prev => {
                if (!fresh.length && !prev.length) return prev;
                const prevMap = new Map(prev.map(e => [e.id, e]));
                const unchanged =
                    fresh.length === prev.length &&
                    fresh.every((e, i) => e.id === prev[i]?.id);
                if (unchanged) return prev;
                // Mark brand-new entries and schedule badge clear
                return fresh.map(e => {
                    if (prevMap.has(e.id)) return prevMap.get(e.id)!;
                    const entry = { ...e, isNew: true };
                    const t = setTimeout(() => clearNew(e.id), 4000);
                    newIdTimeouts.current.set(e.id, t);
                    return entry;
                });
            });
        }, 10000);
        return () => clearInterval(interval);
    }, [clearNew]);

    // Real-time subscription — instant updates when it works
    useEffect(() => {
        if (import.meta.env.DEV || !supabase) return;
        const client = supabase;
        const channel = client
            .channel('community-feed-rt')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'community_feed' },
                (payload) => {
                    const row = payload.new as any;
                    mergeEntries([{
                        id: row.id,
                        pokemon_id: row.pokemon_id,
                        caught_at: row.caught_at,
                        trainer_id: row.trainer_id,
                        display_name: row.trainer_id,
                        game: row.game ?? null,
                        encounters: row.encounters ?? null,
                    }]);
                }
            )
            .subscribe();

        return () => {
            client.removeChannel(channel);
            newIdTimeouts.current.forEach(t => clearTimeout(t));
        };
    }, [mergeEntries]);

    if (loading) {
        return (
            <div className="p-4 text-center text-gray-400 text-sm animate-pulse">
                {t('community_feed_loading')}
            </div>
        );
    }

    if (entries.length === 0) {
        return (
            <div className="p-4 text-center text-gray-400 text-sm">
                {t('community_feed_empty')}
            </div>
        );
    }

    const shown = limit ? entries.slice(0, limit) : entries;

    if (variant === 'grid') {
        return (
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {shown.map(entry => {
                    const pokemonName = getPokemonName(entry.pokemon_id);
                    const [before, after] = t('community_feed_captured').split('{pokemon}');
                    return (
                        <li key={entry.id}>
                            <Link
                                to={`/u/${entry.trainer_id}`}
                                className={`flex h-full items-center gap-4 rounded-xl border p-4 transition-colors hover:bg-gray-700/60 ${
                                    entry.isNew ? 'bg-yellow-400/10 border-yellow-400/40' : 'bg-gray-800 border-gray-700'
                                }`}
                            >
                                <div className="w-24 h-24 shrink-0 flex items-center justify-center">
                                    <img
                                        src={getSpriteUrl(entry.pokemon_id)}
                                        alt={pokemonName}
                                        className="max-w-full max-h-full object-contain drop-shadow-lg"
                                        loading="lazy"
                                        decoding="async"
                                    />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm text-white leading-snug">
                                        <span className="font-bold text-yellow-400">{entry.display_name}</span>
                                        {before && <> {before.trimEnd()}</>}
                                        {' '}<span className="font-semibold text-amber-300">{pokemonName}</span>
                                        {after && <>{after}</>}
                                    </p>
                                    <p className="mt-1 text-xs text-gray-400">{formatDate(entry.caught_at, language)}</p>
                                    {(entry.game || (entry.encounters !== null && entry.encounters !== undefined)) && (
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {entry.game && (
                                                <span className="rounded-full bg-indigo-900/60 border border-indigo-400/40 px-2 py-0.5 text-xs text-indigo-100">
                                                    {gameVersions[entry.game] || entry.game}
                                                </span>
                                            )}
                                            {entry.encounters !== null && entry.encounters !== undefined && (
                                                <span className="rounded-full bg-gray-700 border border-gray-500/60 px-2 py-0.5 text-xs text-gray-100">
                                                    {t('community_feed_encounters', { n: entry.encounters.toLocaleString(language === 'jp' ? 'ja-JP' : language) })}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                                {entry.isNew && (
                                    <span className="shrink-0 self-start text-xs font-bold bg-yellow-400 text-gray-900 px-1.5 py-0.5 rounded">
                                        {t('community_feed_new')}
                                    </span>
                                )}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        );
    }

    return (
        <div className="flex flex-col gap-1 p-2">
            {shown.map(entry => {
                const pokemonName = getPokemonName(entry.pokemon_id);

                return (
                    <Link
                        key={entry.id}
                        to={`/u/${entry.trainer_id}`}
                        className={`
                            flex items-center gap-2 p-2 rounded-lg transition-all duration-300 group
                            hover:bg-gray-700/60 cursor-pointer
                            ${entry.isNew ? 'bg-yellow-400/10 border border-yellow-400/30' : 'bg-gray-800/40'}
                        `}
                    >
                        {/* Shiny sprite */}
                        <div className="w-10 h-10 shrink-0 flex items-center justify-center">
                            <img
                                src={getSpriteUrl(entry.pokemon_id)}
                                alt={pokemonName}
                                className="max-w-full max-h-full object-contain"
                                loading="lazy"
                                decoding="async"
                            />
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-white leading-tight">
                                {(() => {
                                    const [before, after] = t('community_feed_captured').split('{pokemon}');
                                    return <>
                                        <span className="font-bold text-yellow-400 group-hover:underline">{entry.display_name}</span>
                                        {before && <> {before.trimEnd()}</>}
                                        {' '}<span className="font-semibold text-amber-300">{pokemonName}</span>
                                        {after && <>{after}</>}
                                    </>;
                                })()}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5 leading-tight">
                                {formatDate(entry.caught_at, language)}
                            </p>
                        </div>

                        {/* New badge */}
                        {entry.isNew && (
                            <span className="shrink-0 text-xs font-bold bg-yellow-400 text-gray-900 px-1 py-0.5 rounded">
                                {t('community_feed_new')}
                            </span>
                        )}
                    </Link>
                );
            })}
        </div>
    );
};

export default CommunityFeed;
