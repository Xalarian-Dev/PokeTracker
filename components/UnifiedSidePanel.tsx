import React, { useState } from 'react';
import emailjs from '@emailjs/browser';
import SidebarPanel from './SidebarPanel';
import { DiceIcon, Dice3DIcon } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';
import { POKEMON_AVAILABILITY, SHINY_LOCKED_POKEMON, GAME_GROUP_MAP } from '../data/games';
import type { Pokemon } from '../types';
import { Button, Input, Textarea } from './ui';

type PanelView = 'filters' | 'randomHunt' | 'feedback' | null;

interface UnifiedSidePanelProps {
    // Filter props
    shinyCount: number;
    totalPokemon: number;
    progress: number;
    activeFilter: { type: 'gen' | 'region'; value: string | number } | null;
    setActiveFilter: (filter: { type: 'gen' | 'region'; value: string | number } | null) => void;
    selectedGame: string | null;
    setSelectedGame: (game: string | null) => void;
    showOnlyShiny: boolean;
    setShowOnlyShiny: (show: boolean) => void;
    showMissingShiny: boolean;
    setShowMissingShiny: (show: boolean) => void;
    hideRegionalForms: boolean;
    setHideRegionalForms: (hide: boolean) => void;
    onMajorFilterChange: () => void;

    // Random Hunt props
    pokemonList: Pokemon[];
    shinyPokemons: Set<string>;
    userId: string | undefined;
    ownedGames: string[];

    // Random Hunt handlers (from RandomHuntSidePanel)
    isRandomHuntOpen: boolean;
    onRandomHuntOpen: () => void;
    onRandomHuntClose: () => void;
}

/**
 * UnifiedSidePanel - Panel latéral unifié avec onglets Filtres/Random Hunt
 * Slide depuis la gauche avec languettes sur le bord gauche de la page
 */
export const UnifiedSidePanel: React.FC<UnifiedSidePanelProps> = (props) => {
    const [activeView, setActiveView] = useState<PanelView>(null);

    // Random Hunt state
    const [result, setResult] = useState<{ pokemon: Pokemon; game: string } | null>(null);
    const [errorKey, setErrorKey] = useState<string | null>(null);
    const [isRolling, setIsRolling] = useState(false);

    // Feedback state
    const [feedbackCategory, setFeedbackCategory] = useState('bug');
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [feedbackEmail, setFeedbackEmail] = useState('');
    const [feedbackSending, setFeedbackSending] = useState(false);
    const [feedbackStatus, setFeedbackStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const { t, getGameName, getPokemonName } = useLanguage();

    const toggleView = (view: 'filters' | 'randomHunt' | 'feedback') => {
        if (activeView === view) {
            setActiveView(null); // Close if clicking same tab
            if (view === 'randomHunt') {
                props.onRandomHuntClose();
            }
        } else {
            setActiveView(view); // Switch to new view
            if (view === 'randomHunt') {
                props.onRandomHuntOpen();
            }
        }
    };

    const closePanel = () => {
        setActiveView(null);
        if (activeView === 'randomHunt') {
            props.onRandomHuntClose();
        }
    };

    // Random Hunt logic
    const handleRoll = () => {
        let candidates = props.pokemonList.filter(p => !props.shinyPokemons.has(p.id));
        setErrorKey(null);

        if (candidates.length === 0) {
            setErrorKey('no_huntable_pokemon');
            return;
        }

        setIsRolling(true);
        setResult(null);

        setTimeout(() => {
            let validResult: { pokemon: Pokemon; game: string } | null = null;
            let attempts = 0;
            const MAX_ATTEMPTS = 50;

            while (!validResult && attempts < MAX_ATTEMPTS && candidates.length > 0) {
                const randomIndex = Math.floor(Math.random() * candidates.length);
                const randomPokemon = candidates[randomIndex];

                const availableGames = POKEMON_AVAILABILITY[randomPokemon.id] || [];

                const unlockedGames = availableGames.filter(gameId => {
                    const group = Object.keys(GAME_GROUP_MAP).find(key => GAME_GROUP_MAP[key].includes(gameId));
                    if (!group) return true;

                    const lockedIds = SHINY_LOCKED_POKEMON[group] || [];
                    return !lockedIds.includes(randomPokemon.id);
                });

                let gamesToChooseFrom = unlockedGames;
                if (props.ownedGames && props.ownedGames.length > 0) {
                    gamesToChooseFrom = unlockedGames.filter(gameId => props.ownedGames!.includes(gameId));
                }

                if (gamesToChooseFrom.length > 0) {
                    const randomGame = gamesToChooseFrom[Math.floor(Math.random() * gamesToChooseFrom.length)];
                    validResult = { pokemon: randomPokemon, game: randomGame };
                } else {
                    candidates.splice(randomIndex, 1);
                }
                attempts++;
            }

            if (validResult) {
                setResult(validResult);
            } else {
                setErrorKey('no_huntable_pokemon');
            }
            setIsRolling(false);
        }, 1500);
    };

    // Feedback submission logic
    const feedbackCategories = [
        { value: 'missing_pokemon', label: t('feedback_missing_pokemon') },
        { value: 'bug', label: t('feedback_bug') },
        { value: 'question', label: t('feedback_question') },
        { value: 'suggestion', label: t('feedback_suggestion') },
        { value: 'other', label: t('feedback_other') },
    ];

    const handleFeedbackSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!feedbackMessage.trim()) {
            return;
        }

        setFeedbackSending(true);
        setFeedbackStatus('idle');

        try {
            const serviceId = 'service_kw9wlxv';
            const templateId = 'template_tm49upf';
            const publicKey = 'zI8GA9OVh8oum4Iza';

            await emailjs.send(
                serviceId,
                templateId,
                {
                    category: feedbackCategories.find(c => c.value === feedbackCategory)?.label || feedbackCategory,
                    message: feedbackMessage,
                    user_email: feedbackEmail || 'Non fourni',
                    from_name: feedbackEmail || 'Utilisateur anonyme',
                },
                publicKey
            );

            setFeedbackStatus('success');
            setFeedbackMessage('');
            setFeedbackEmail('');
            setFeedbackCategory('bug');

            setTimeout(() => {
                setFeedbackStatus('idle');
            }, 3000);
        } catch (error) {
            console.error('Error sending feedback:', error);
            setFeedbackStatus('error');
        } finally {
            setFeedbackSending(false);
        }
    };

    return (
        <>
            {/* Side Panel Container */}
            <div
                className={`fixed top-16 left-0 h-[calc(100vh-4rem)] transition-transform duration-300 z-40 ${activeView ? 'translate-x-0' : '-translate-x-full'
                    }`}
                style={{ width: '320px' }}
            >
                {/* Panel Content */}
                <div className="h-full bg-gray-800 shadow-2xl overflow-y-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {/* Panel Content */}
                    <div className="h-full pt-2">
                        {activeView === 'filters' && (
                            <SidebarPanel
                                shinyCount={props.shinyCount}
                                totalPokemon={props.totalPokemon}
                                progress={props.progress}
                                activeFilter={props.activeFilter}
                                setActiveFilter={props.setActiveFilter}
                                selectedGame={props.selectedGame}
                                setSelectedGame={props.setSelectedGame}
                                showOnlyShiny={props.showOnlyShiny}
                                setShowOnlyShiny={props.setShowOnlyShiny}
                                showMissingShiny={props.showMissingShiny}
                                setShowMissingShiny={props.setShowMissingShiny}
                                hideRegionalForms={props.hideRegionalForms}
                                setHideRegionalForms={props.setHideRegionalForms}
                                onMajorFilterChange={props.onMajorFilterChange}
                            />
                        )}

                        {activeView === 'randomHunt' && (
                            <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-8">
                                {!result && !isRolling ? (
                                    <div className="text-center space-y-6">
                                        <p className="text-2xl font-bold text-white animate-bounce">{t('what_do_we_hunt')}</p>
                                        {errorKey && (
                                            <p className="text-red-400 text-sm font-semibold">{t(errorKey)}</p>
                                        )}
                                        <Button
                                            size="lg"
                                            onClick={handleRoll}
                                            className="rounded-full shadow-lg hover:scale-105"
                                        >
                                            {t('lets_go')}
                                        </Button>
                                    </div>
                                ) : isRolling ? (
                                    <div className="flex flex-col items-center justify-center space-y-6">
                                        <DiceIcon className="w-20 h-20 text-indigo-500 animate-spin" />
                                        <p className="text-lg text-gray-400 animate-pulse">Rolling...</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center text-center space-y-4 animate-in fade-in zoom-in duration-500">
                                        <div className="w-32 h-32 relative group">
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                {[...Array(8)].map((_, i) => {
                                                    const positions = [
                                                        { top: '-10%', left: '90%' },
                                                        { top: '10%', left: '-10%' },
                                                        { top: '90%', left: '10%' },
                                                        { top: '90%', left: '90%' },
                                                        { top: '50%', left: '-15%' },
                                                        { top: '50%', left: '105%' },
                                                        { top: '-15%', left: '50%' },
                                                        { top: '105%', left: '50%' },
                                                    ];
                                                    const animations = ['ping', 'pulse', 'bounce'];
                                                    const sizes = ['w-6 h-6', 'w-8 h-8', 'w-5 h-5'];
                                                    const colors = ['text-yellow-300', 'text-yellow-200', 'text-white', 'text-yellow-400'];

                                                    return (
                                                        <svg
                                                            key={i}
                                                            className={`absolute ${sizes[i % sizes.length]} ${colors[i % colors.length]} animate-[${animations[i % animations.length]}_${1 + (i % 3) * 0.5}s_ease-in-out_infinite]`}
                                                            style={{
                                                                ...positions[i],
                                                                animationDelay: `${i * 0.2}s`,
                                                            }}
                                                            viewBox="0 0 24 24"
                                                            fill="currentColor"
                                                        >
                                                            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                                                        </svg>
                                                    );
                                                })}
                                            </div>
                                            <img
                                                src={result!.pokemon.shinySprite}
                                                alt={getPokemonName(result!.pokemon.id)}
                                                className="max-w-full max-h-full object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] z-10 m-auto"
                                            />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-white capitalize">{getPokemonName(result!.pokemon.id)}</h3>
                                            <p className="text-gray-400 text-sm">#{result!.pokemon.id.padStart(3, '0')}</p>
                                        </div>

                                        <div className="px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 mt-4">
                                            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">{t('available_in')}</p>
                                            <p className="text-lg font-bold text-yellow-400">{getGameName(result!.game)}</p>
                                        </div>

                                        <Button
                                            variant="ghost"
                                            size="md"
                                            onClick={handleRoll}
                                            className="mt-8 rounded-full"
                                        >
                                            {t('reroll')}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeView === 'feedback' && (
                            <div className="p-6 space-y-4">
                                <h2 className="text-2xl font-bold text-white mb-2">{t('feedback_title')}</h2>
                                <p className="text-gray-400 text-sm mb-6">{t('feedback_description')}</p>

                                <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                                    <div>
                                        <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
                                            {t('feedback_category')}
                                        </label>
                                        <select
                                            id="category"
                                            value={feedbackCategory}
                                            onChange={(e) => setFeedbackCategory(e.target.value)}
                                            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            {feedbackCategories.map((cat) => (
                                                <option key={cat.value} value={cat.value}>
                                                    {cat.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <Input
                                        id="email"
                                        type="email"
                                        label={`${t('feedback_email')} (${t('optional')})`}
                                        value={feedbackEmail}
                                        onChange={(e) => setFeedbackEmail(e.target.value)}
                                        placeholder={t('feedback_email_placeholder')}
                                    />

                                    <Textarea
                                        id="message"
                                        label={t('feedback_message')}
                                        value={feedbackMessage}
                                        onChange={(e) => setFeedbackMessage(e.target.value)}
                                        placeholder={t('feedback_message_placeholder')}
                                        rows={5}
                                        required
                                    />

                                    {feedbackStatus === 'success' && (
                                        <div className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm">
                                            {t('feedback_success')}
                                        </div>
                                    )}

                                    {feedbackStatus === 'error' && (
                                        <div className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm">
                                            {t('feedback_error')}
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        variant="secondary"
                                        size="lg"
                                        disabled={feedbackSending || !feedbackMessage.trim()}
                                        className="w-full"
                                    >
                                        {feedbackSending ? t('sending') : t('send')}
                                    </Button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Tab Buttons (Fixed, always visible) */}
            <div
                className={`fixed top-1/2 -translate-y-1/2 flex flex-col gap-2 transition-all duration-300 ${activeView ? 'left-80' : 'left-0'
                    }`}
                style={{ zIndex: 9999 }}
            >
                {/* Filters Tab */}
                <button
                    onClick={() => toggleView('filters')}
                    className="flex items-center gap-2 py-2.5 px-2 rounded-l-lg shadow-lg transition-all bg-poke-yellow text-gray-900"
                    style={{
                        writingMode: 'vertical-rl',
                        transform: 'rotate(180deg)',
                        opacity: 1,
                        backgroundColor: activeView === 'filters' ? '#9333ea' : '#1f2937',
                        color: activeView === 'filters' ? '#ffffff' : '#ffffff'
                    }}
                >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" transform="scale(1, -1)">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                </button>

                {/* Random Hunt Tab */}
                <button
                    onClick={() => toggleView('randomHunt')}
                    className="flex items-center gap-2 py-2.5 px-2 rounded-l-lg shadow-lg transition-all bg-poke-yellow text-gray-900"
                    style={{
                        writingMode: 'vertical-rl',
                        transform: 'rotate(180deg)',
                        opacity: 1,
                        backgroundColor: activeView === 'randomHunt' ? '#facc15' : '#1f2937',
                        color: activeView === 'randomHunt' ? '#111827' : '#ffffff'
                    }}
                >
                    <DiceIcon className="w-8 h-8" />
                </button>
            </div>

            {/* Feedback Button (Fixed at bottom) */}
            <div
                className={`fixed bottom-4 transition-all duration-300 ${activeView ? 'left-80' : 'left-0'
                    }`}
                style={{ zIndex: 9999 }}
            >
                {/* Feedback Tab */}
                <button
                    onClick={() => toggleView('feedback')}
                    className="flex items-center gap-2 py-2.5 px-2 rounded-l-lg shadow-lg transition-all bg-poke-yellow text-gray-900"
                    style={{
                        writingMode: 'vertical-rl',
                        transform: 'rotate(180deg)',
                        opacity: 1,
                        backgroundColor: '#ef4444',
                        color: '#ffffff'
                    }}
                >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" transform="scale(1, -1)">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </button>
            </div>


        </>
    );
};

export default UnifiedSidePanel;
