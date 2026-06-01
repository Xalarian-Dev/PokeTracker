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
    { id: 'm1', pokemon_id: '25',      trainer_id: 'AshKetchum',  display_name: 'AshKetchum',  caught_at: new Date(Date.now() - 1  * 60000).toISOString() },
    { id: 'm2', pokemon_id: '6',       trainer_id: 'Misty',       display_name: 'Misty',       caught_at: new Date(Date.now() - 4  * 60000).toISOString() },
    { id: 'm3', pokemon_id: '149',     trainer_id: 'Brock',       display_name: 'Brock',       caught_at: new Date(Date.now() - 12 * 60000).toISOString() },
    { id: 'm4', pokemon_id: '143',     trainer_id: 'Gary',        display_name: 'Gary',        caught_at: new Date(Date.now() - 25 * 60000).toISOString() },
    { id: 'm5', pokemon_id: '249',     trainer_id: 'Giovanni',    display_name: 'Giovanni',    caught_at: new Date(Date.now() - 47 * 60000).toISOString() },
    { id: 'm6', pokemon_id: '384',     trainer_id: 'Lance',       display_name: 'Lance',       caught_at: new Date(Date.now() - 63 * 60000).toISOString() },
    { id: 'm7', pokemon_id: '445',     trainer_id: 'Cynthia',     display_name: 'Cynthia',     caught_at: new Date(Date.now() - 90 * 60000).toISOString() },
    { id: 'm8', pokemon_id: '196',     trainer_id: 'AshKetchum',  display_name: 'AshKetchum',  caught_at: new Date(Date.now() - 110 * 60000).toISOString() },
];

async function fetchFeed(): Promise<FeedEntry[]> {
    if (import.meta.env.DEV) return MOCK_FEED;
    const res = await fetch('/api/public/feed', { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.feed || [];
}

export const CommunityFeed: React.FC = () => {
    const { t, language, getPokemonName } = useLanguage();
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
            return [...newEntries, ...prev].slice(0, 20);
        });
    }, [clearNew]);

    // Initial load
    useEffect(() => {
        fetchFeed().then(data => {
            setEntries(data);
            setLoading(false);
        });
    }, []);

    // Polling every 15s — reliable fallback
    useEffect(() => {
        if (import.meta.env.DEV) return;
        const interval = setInterval(async () => {
            const fresh = await fetchFeed();
            mergeEntries(fresh);
        }, 10000);
        return () => clearInterval(interval);
    }, [mergeEntries]);

    // Real-time subscription — instant updates when it works
    useEffect(() => {
        if (import.meta.env.DEV) return;
        const channel = supabase
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
                    }]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
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

    return (
        <div className="flex flex-col gap-1 p-2">
            {entries.map(entry => {
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
                            <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">
                                {formatDate(entry.caught_at, language)}
                            </p>
                        </div>

                        {/* New badge */}
                        {entry.isNew && (
                            <span className="shrink-0 text-[9px] font-bold bg-yellow-400 text-gray-900 px-1 py-0.5 rounded">
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
