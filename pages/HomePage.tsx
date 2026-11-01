import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { SignInButton, SignUpButton, useUser } from '@clerk/react';
import { BarChart3, Dices, LayoutGrid, Languages, User as UserIcon, Users, type LucideIcon } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCollection } from '../contexts/CollectionContext';
import { Button } from '../components/ui';
import { CommunityFeed } from '../components/CommunityFeed';

/** Pokémon montrés dans l'illustration de l'accueil (sprites shiny) */
const HERO_POKEMON = ['196', '6', '25', '249', '384'];

const FEATURES: { key: string; icon: LucideIcon }[] = [
    { key: 'home_f1', icon: LayoutGrid },
    { key: 'home_f2', icon: BarChart3 },
    { key: 'home_f3', icon: Dices },
    { key: 'home_f4', icon: Users },
    { key: 'home_f5', icon: UserIcon },
    { key: 'home_f6', icon: Languages },
];

/** Boutons d'inscription et de connexion (modales Clerk) + accès sans compte */
const HomeActions: React.FC<{ className?: string }> = ({ className = '' }) => {
    const { t } = useLanguage();
    return (
        <div className={`flex flex-col sm:flex-row gap-3 ${className}`}>
            <SignUpButton mode="modal">
                <Button size="lg" className="bg-poke-yellow hover:bg-yellow-500 text-gray-900 font-bold">
                    {t('home_signup')}
                </Button>
            </SignUpButton>
            <SignInButton mode="modal">
                <Button size="lg" variant="secondary">{t('home_login')}</Button>
            </SignInButton>
            <Button asChild size="lg" variant="ghost">
                <Link to="/collection">{t('home_try')}</Link>
            </Button>
        </div>
    );
};

/** Page d'accueil : présentation du site pour les visiteurs. Un utilisateur connecté va directement à sa collection. */
const HomePage: React.FC = () => {
    const { t } = useLanguage();
    const { isSignedIn } = useUser();
    const { pokemonList } = useCollection();

    if (isSignedIn) return <Navigate to="/collection" replace />;

    const heroPokemon = HERO_POKEMON
        .map(id => pokemonList.find(p => p.id === id))
        .filter((p): p is NonNullable<typeof p> => Boolean(p));

    return (
        <div className="text-white">
            {/* Accroche */}
            <section className="bg-gradient-to-b from-gray-800 to-gray-900 border-b border-gray-700">
                <div className="max-w-7xl mx-auto px-4 py-12 md:py-20 grid gap-10 lg:grid-cols-2 lg:items-center">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-bold leading-tight text-white">{t('home_hero_title')}</h1>
                        <p className="mt-4 text-lg text-gray-300 max-w-xl">{t('home_hero_subtitle')}</p>
                        <HomeActions className="mt-8" />
                        <p className="mt-4 text-sm text-gray-400">{t('home_hero_note')}</p>
                        {pokemonList.length > 0 && (
                            <p className="mt-2 text-sm text-yellow-300 font-medium">
                                {t('home_count', { n: pokemonList.length.toLocaleString() })}
                            </p>
                        )}
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4" aria-hidden="true">
                        {heroPokemon.map((p, i) => (
                            <img
                                key={p.id}
                                src={p.shinySprite}
                                alt=""
                                width={160}
                                height={160}
                                className={`object-contain drop-shadow-xl ${i === 2 ? 'w-36 h-36 sm:w-44 sm:h-44' : 'w-24 h-24 sm:w-32 sm:h-32'}`}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* Comment ça marche */}
            <section aria-labelledby="home-how" className="max-w-7xl mx-auto px-4 py-12">
                <h2 id="home-how" className="text-2xl md:text-3xl font-bold text-center mb-8">{t('home_how_title')}</h2>
                <ol className="grid gap-6 md:grid-cols-3">
                    {[1, 2, 3].map(n => (
                        <li key={n} className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                            <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-poke-yellow text-gray-900 font-bold" aria-hidden="true">{n}</span>
                            <h3 className="mt-3 text-lg font-semibold text-white">{t(`home_step${n}_title`)}</h3>
                            <p className="mt-2 text-gray-300">{t(`home_step${n}_text`)}</p>
                        </li>
                    ))}
                </ol>
            </section>

            {/* Fonctionnalités */}
            <section aria-labelledby="home-features" className="bg-gray-800/40 border-y border-gray-700">
                <div className="max-w-7xl mx-auto px-4 py-12">
                    <h2 id="home-features" className="text-2xl md:text-3xl font-bold text-center mb-8">{t('home_features_title')}</h2>
                    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {FEATURES.map(({ key, icon: Icon }) => (
                            <li key={key} className="flex gap-4 bg-gray-800 border border-gray-700 rounded-xl p-5">
                                <Icon className="w-7 h-7 shrink-0 text-yellow-400" aria-hidden="true" />
                                <div>
                                    <h3 className="font-semibold text-white">{t(`${key}_title`)}</h3>
                                    <p className="mt-1 text-sm text-gray-300">{t(`${key}_text`)}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* Activité réelle de la communauté */}
            <section aria-labelledby="home-community" className="max-w-7xl mx-auto px-4 py-12">
                <div className="flex flex-wrap items-end justify-between gap-2 mb-6">
                    <div>
                        <h2 id="home-community" className="text-2xl md:text-3xl font-bold">{t('home_community_title')}</h2>
                        <p className="mt-1 text-gray-300">{t('home_community_text')}</p>
                    </div>
                    <Link to="/communaute" className="text-yellow-400 hover:underline font-medium">
                        {t('home_community_more')} →
                    </Link>
                </div>
                <CommunityFeed variant="grid" limit={3} />
            </section>

            {/* Appel final */}
            <section aria-labelledby="home-final" className="bg-gray-800/40 border-t border-gray-700">
                <div className="max-w-3xl mx-auto px-4 py-12 text-center">
                    <h2 id="home-final" className="text-2xl md:text-3xl font-bold">{t('home_final_title')}</h2>
                    <p className="mt-2 text-gray-300">{t('home_final_text')}</p>
                    <HomeActions className="mt-6 justify-center items-stretch sm:items-center" />
                </div>
            </section>
        </div>
    );
};

export default HomePage;
