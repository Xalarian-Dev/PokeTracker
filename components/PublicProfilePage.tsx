import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { fetchPublicProfile, type PublicProfile } from '../services/supabase';
import { POKEMON_LIST, POKEMON_WITH_MULTIPLE_FORMS } from '../data/pokemon';
import { MasterBallIcon } from './Icons';
import LanguageSelector from './LanguageSelector';

const HOME_SPRITE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/';
const getSpriteUrl = (id: string, shiny = false) =>
    `${HOME_SPRITE}${shiny ? 'shiny/' : ''}${id}.png`;

const TOTAL = POKEMON_LIST.length;

export const PublicProfilePage: React.FC = () => {
    const { trainerId } = useParams<{ trainerId: string }>();
    const { t } = useLanguage();

    const [profile, setProfile] = useState<PublicProfile | null | 'loading' | 'not_found'>('loading');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!trainerId) return;
        fetchPublicProfile(trainerId)
            .then(data => setProfile(data ?? 'not_found'))
            .catch(() => setProfile('not_found'));
    }, [trainerId]);

    const copyLink = useCallback(() => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, []);

    // ── Loading ──────────────────────────────────────────────────────────
    if (profile === 'loading') {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-400" />
            </div>
        );
    }

    // ── Not found ────────────────────────────────────────────────────────
    if (profile === 'not_found') {
        return (
            <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white gap-4 p-6">
                <MasterBallIcon className="w-16 h-16 opacity-40" />
                <h1 className="text-2xl font-bold">{t('public_profile_not_found')}</h1>
                <p className="text-gray-400">{t('public_profile_not_found_desc')}</p>
                <Link to="/" className="mt-4 px-6 py-3 bg-yellow-400 text-gray-900 font-bold rounded-lg hover:bg-yellow-300 transition-colors">
                    {t('public_profile_open_tracker')}
                </Link>
            </div>
        );
    }

    const completion = TOTAL > 0 ? ((profile.shiny_count / TOTAL) * 100).toFixed(1) : '0.0';
    const shinySet = new Set(profile.shinies);

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Header */}
            <header className="bg-gray-800/80 backdrop-blur-sm shadow-lg sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <MasterBallIcon className="w-7 h-7" />
                        <span className="font-bold text-yellow-400 hidden sm:block">{t('shiny_tracker_title')}</span>
                    </Link>
                    <LanguageSelector />
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-8">
                {/* Profile header */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-10">
                    {/* Avatar placeholder */}
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shrink-0 text-gray-900 font-bold text-3xl shadow-lg">
                        {profile.trainer_id.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 text-center sm:text-left">
                        <h1 className="text-3xl font-bold text-white">{profile.trainer_id}</h1>
                        <p className="text-gray-400 text-sm mt-1">
                            <span className="font-mono bg-gray-800 px-2 py-0.5 rounded text-yellow-400">
                                /u/{profile.trainer_id}
                            </span>
                        </p>

                        <div className="flex flex-wrap gap-3 mt-4 justify-center sm:justify-start">
                            <button
                                onClick={copyLink}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                {copied ? t('public_profile_link_copied') : t('public_profile_copy_link')}
                            </button>
                            <Link
                                to="/"
                                className="flex items-center gap-2 px-4 py-2 bg-yellow-400/20 hover:bg-yellow-400/30 border border-yellow-400/40 text-yellow-400 rounded-lg text-sm transition-colors"
                            >
                                {t('public_profile_open_tracker')}
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-10">
                    <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 text-center">
                        <p className="text-4xl font-bold text-yellow-400">{profile.shiny_count}</p>
                        <p className="text-gray-400 text-sm mt-1">{t('public_profile_shinies')}</p>
                    </div>
                    <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 text-center">
                        <p className="text-4xl font-bold text-yellow-400">{completion}%</p>
                        <p className="text-gray-400 text-sm mt-1">{t('public_profile_completion')}</p>
                        <div className="mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full transition-all"
                                style={{ width: `${Math.min(parseFloat(completion), 100)}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Shiny grid */}
                <section>
                    <h2 className="text-xl font-bold text-white mb-4">
                        ✨ {t('public_profile_shinies')} ({profile.shiny_count})
                    </h2>
                    {profile.shiny_count === 0 ? (
                        <p className="text-gray-500 text-center py-12">{t('public_profile_empty')}</p>
                    ) : (
                        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-1 sm:gap-2">
                            {POKEMON_LIST
                                .filter(p => shinySet.has(p.id))
                                .map(pokemon => {
                                    const favFormId = profile.favourite_forms[pokemon.id];
                                    const formData = favFormId ? POKEMON_WITH_MULTIPLE_FORMS[pokemon.id] : undefined;
                                    const favForm = formData?.forms.find(f => f.id === favFormId);
                                    const spriteUrl = favForm
                                        ? getSpriteUrl(String(favForm.spriteId), true)
                                        : pokemon.shinySprite;

                                    return (
                                        <div
                                            key={pokemon.id}
                                            className="bg-gray-800 rounded border border-amber-400/40 aspect-square flex items-center justify-center"
                                            title={pokemon.name}
                                            style={{ boxShadow: '0 0 6px 1px rgba(251,191,36,0.2)' }}
                                        >
                                            <img
                                                src={spriteUrl}
                                                alt={pokemon.name}
                                                className="w-full h-full object-contain p-0.5"
                                                loading="lazy"
                                                decoding="async"
                                            />
                                        </div>
                                    );
                                })}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default PublicProfilePage;
