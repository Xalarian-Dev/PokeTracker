import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { SignInButton, SignUpButton, useUser } from '@clerk/react';
import { BarChart3, Dices, LayoutGrid, Languages, User as UserIcon, Users, type LucideIcon } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCollection } from '../contexts/CollectionContext';
import { Button } from '../components/ui';
import { CommunityFeed } from '../components/CommunityFeed';
import Reveal from '../components/Reveal';
import CountUp from '../components/CountUp';
import SpotlightCard from '../components/SpotlightCard';

/** Pokémon montrés dans l'illustration de l'accueil (sprites shiny) ; le 3e est mis en avant */
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
                <Button
                    size="lg"
                    className="btn-shimmer bg-gradient-to-b from-yellow-300 to-yellow-500 hover:from-yellow-200 hover:to-yellow-400 text-gray-900 font-bold shadow-lg shadow-yellow-500/25 hover:shadow-yellow-400/40"
                >
                    {t('home_signup')}
                </Button>
            </SignUpButton>
            <SignInButton mode="modal">
                <Button size="lg" variant="secondary" className="bg-white/10 hover:bg-white/15 text-white border border-white/15">
                    {t('home_login')}
                </Button>
            </SignInButton>
            <Button asChild size="lg" variant="ghost" className="text-gray-200 hover:bg-white/10 hover:text-white">
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

    // « {n} Pokémon à collectionner » : le nombre est animé, le reste du texte vient de la traduction
    const [countBefore, countAfter] = t('home_count', { n: '@@N@@' }).split('@@N@@').map(part => part.trim());

    return (
        <div className="text-white">
            {/* Accroche */}
            <section className="relative overflow-hidden border-b border-white/10">
                {/* Lueurs d'ambiance (décor) */}
                <div className="hero-blob -top-24 -left-24 w-[30rem] h-[30rem]" style={{ '--blob-color': 'rgba(99,102,241,0.35)' } as React.CSSProperties} aria-hidden="true" />
                <div className="hero-blob hidden md:block top-1/3 -right-24 w-[28rem] h-[28rem]" style={{ '--blob-color': 'rgba(250,204,21,0.18)', animationDelay: '-6s' } as React.CSSProperties} aria-hidden="true" />
                <div className="hero-blob hidden md:block -bottom-32 left-1/3 w-[26rem] h-[26rem]" style={{ '--blob-color': 'rgba(217,70,239,0.18)', animationDelay: '-10s' } as React.CSSProperties} aria-hidden="true" />

                <div className="relative max-w-7xl mx-auto px-4 py-14 md:py-24 grid gap-12 lg:grid-cols-2 lg:items-center">
                    <div>
                        <Reveal>
                            <h1 className="text-4xl md:text-6xl font-extrabold leading-[1.05] tracking-tight">
                                <span className="text-gradient">{t('home_hero_title')}</span>
                            </h1>
                        </Reveal>
                        <Reveal delay={120}>
                            <p className="mt-5 text-lg md:text-xl text-gray-300 max-w-xl">{t('home_hero_subtitle')}</p>
                        </Reveal>
                        <Reveal delay={240}>
                            <HomeActions className="mt-8" />
                            <p className="mt-4 text-sm text-gray-400">{t('home_hero_note')}</p>
                        </Reveal>
                        {pokemonList.length > 0 && (
                            <Reveal delay={360}>
                                <p className="mt-6 inline-flex items-baseline gap-1.5 rounded-full border border-yellow-400/30 bg-yellow-400/10 px-4 py-1.5 text-sm text-yellow-200">
                                    {countBefore && <span>{countBefore}</span>}
                                    <CountUp value={pokemonList.length} className="text-lg font-bold tabular-nums text-yellow-300" />
                                    {countAfter && <span>{countAfter}</span>}
                                </p>
                            </Reveal>
                        )}
                    </div>

                    <div className="relative flex flex-wrap items-center justify-center gap-2 sm:gap-4" aria-hidden="true">
                        <div className="sprite-halo absolute inset-0 -z-0 scale-110 rounded-full" />
                        {heroPokemon.map((p, i) => (
                            <div
                                key={p.id}
                                className="relative floaty"
                                style={{ animationDelay: `${i * -1.3}s` }}
                            >
                                <img
                                    src={p.shinySprite}
                                    alt=""
                                    width={160}
                                    height={160}
                                    decoding="async"
                                    className={`object-contain ${i === 2 ? 'w-36 h-36 sm:w-48 sm:h-48' : 'w-24 h-24 sm:w-32 sm:h-32'}`}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Comment ça marche */}
            <section aria-labelledby="home-how" className="max-w-7xl mx-auto px-4 py-16">
                <Reveal>
                    <h2 id="home-how" className="text-2xl md:text-4xl font-bold text-center mb-10 tracking-tight">{t('home_how_title')}</h2>
                </Reveal>
                <ol className="grid gap-6 md:grid-cols-3">
                    {[1, 2, 3].map(n => (
                        <Reveal key={n} as="li" delay={n * 100}>
                            <SpotlightCard className="h-full rounded-2xl border border-white/10 bg-white/[0.05] p-6">
                                <span
                                    className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 text-gray-900 font-bold shadow-lg shadow-yellow-500/20"
                                    aria-hidden="true"
                                >
                                    {n}
                                </span>
                                <h3 className="mt-4 text-lg font-semibold text-white">{t(`home_step${n}_title`)}</h3>
                                <p className="mt-2 text-gray-300">{t(`home_step${n}_text`)}</p>
                            </SpotlightCard>
                        </Reveal>
                    ))}
                </ol>
            </section>

            {/* Fonctionnalités */}
            <section aria-labelledby="home-features" className="border-y border-white/10 bg-black/20">
                <div className="max-w-7xl mx-auto px-4 py-16">
                    <Reveal>
                        <h2 id="home-features" className="text-2xl md:text-4xl font-bold text-center mb-10 tracking-tight">{t('home_features_title')}</h2>
                    </Reveal>
                    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {FEATURES.map(({ key, icon: Icon }, i) => (
                            <Reveal key={key} as="li" delay={(i % 3) * 90}>
                                <SpotlightCard className="h-full flex gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition-transform duration-300 hover:-translate-y-1 hover:border-yellow-400/30">
                                    <span className="shrink-0 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-400/10 border border-yellow-400/20">
                                        <Icon className="w-6 h-6 text-yellow-300" aria-hidden="true" />
                                    </span>
                                    <div>
                                        <h3 className="font-semibold text-white">{t(`${key}_title`)}</h3>
                                        <p className="mt-1 text-sm text-gray-300">{t(`${key}_text`)}</p>
                                    </div>
                                </SpotlightCard>
                            </Reveal>
                        ))}
                    </ul>
                </div>
            </section>

            {/* Activité réelle de la communauté */}
            <section aria-labelledby="home-community" className="max-w-7xl mx-auto px-4 py-16">
                <Reveal>
                    <div className="flex flex-wrap items-end justify-between gap-2 mb-6">
                        <div>
                            <h2 id="home-community" className="text-2xl md:text-4xl font-bold tracking-tight">{t('home_community_title')}</h2>
                            <p className="mt-1 text-gray-300">{t('home_community_text')}</p>
                        </div>
                        <Link to="/communaute" className="text-yellow-300 hover:text-yellow-200 hover:underline font-medium">
                            {t('home_community_more')} →
                        </Link>
                    </div>
                </Reveal>
                <Reveal delay={100}>
                    <CommunityFeed variant="grid" limit={3} />
                </Reveal>
            </section>

            {/* Appel final */}
            <section aria-labelledby="home-final" className="relative overflow-hidden border-t border-white/10">
                <div className="hero-blob left-1/4 -top-20 w-[28rem] h-[28rem]" style={{ '--blob-color': 'rgba(250,204,21,0.18)' } as React.CSSProperties} aria-hidden="true" />
                <div className="hero-blob hidden md:block right-1/4 -bottom-24 w-[26rem] h-[26rem]" style={{ '--blob-color': 'rgba(99,102,241,0.3)', animationDelay: '-7s' } as React.CSSProperties} aria-hidden="true" />
                <div className="relative max-w-3xl mx-auto px-4 py-16 text-center">
                    <Reveal>
                        <h2 id="home-final" className="text-2xl md:text-4xl font-bold tracking-tight">{t('home_final_title')}</h2>
                        <p className="mt-3 text-gray-300">{t('home_final_text')}</p>
                        <HomeActions className="mt-8 justify-center items-stretch sm:items-center" />
                    </Reveal>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
