import React, { useState } from 'react';
import emailjs from '@emailjs/browser';
import { DiceIcon } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';
import { POKEMON_AVAILABILITY, SHINY_LOCKED_POKEMON, GAME_GROUP_MAP } from '../data/games';
import type { Pokemon } from '../types';
import { Button, Input, Textarea, FilterChip, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Label } from './ui';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui';
import { Book, Map, Gamepad2, Eye } from 'lucide-react';
import { useToast } from '../hooks/use-toast';


type TabView = 'filters' | 'randomHunt' | 'feedback';

interface LeftSidebarProps {
    // Filter props
    activeFilter: { type: 'gen' | 'region'; value: string | number } | null;
    setActiveFilter: (filter: { type: 'gen' | 'region'; value: string | number } | null) => void;
    selectedGame: string | null;
    setSelectedGame: (game: string | null) => void;
    showOnlyShiny: boolean;
    setShowOnlyShiny: (show: boolean) => void;
    showMissingShiny: boolean;
    setShowMissingShiny: (show: boolean) => void;
    hideGrayedPokemon: boolean;
    setHideGrayedPokemon: (hide: boolean) => void;
    hideShinyLocked: boolean;
    setHideShinyLocked: (hide: boolean) => void;
    onMajorFilterChange: () => void;

    // Random Hunt props
    pokemonList: Pokemon[];
    shinyPokemons: Set<string>;
    userId: string | undefined;
    ownedGames: string[];
}


/**
 * LeftSidebar - Sidebar content with tabs for filters, random hunt, and feedback
 */
export const LeftSidebar: React.FC<LeftSidebarProps> = (props) => {
    const [activeTab, setActiveTab] = useState<TabView>('filters');
    const { t, gameVersions, getPokemonName, getGameList, getRegionName } = useLanguage();
    const { toast } = useToast();


    // Filter handlers
    const gameList = getGameList();

    const handleFilterClick = (type: 'gen' | 'region', value: number | string) => {
        if (props.activeFilter?.type === type && props.activeFilter?.value === value) {
            props.setActiveFilter(null);
        } else {
            props.setActiveFilter({ type, value });
        }
        props.onMajorFilterChange();
    };

    const handleGameClick = (gameId: string) => {
        props.setSelectedGame(props.selectedGame === gameId ? null : gameId);
        props.onMajorFilterChange();
    };


    // Random Hunt state
    const [result, setResult] = useState<{ pokemon: Pokemon; game: string } | null>(null);
    const [errorKey, setErrorKey] = useState<string | null>(null);
    const [isRolling, setIsRolling] = useState(false);
    const [sparklePhase, setSparklePhase] = useState<'explosion' | 'idle'>('explosion');

    // Feedback state
    const [feedbackCategory, setFeedbackCategory] = useState('bug');
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [feedbackEmail, setFeedbackEmail] = useState('');
    const [feedbackSending, setFeedbackSending] = useState(false);

    // Random Hunt logic
    const handleRoll = () => {
        let candidates = props.pokemonList.filter(p => !props.shinyPokemons.has(p.id));
        setErrorKey(null);

        if (candidates.length === 0) {
            setErrorKey('no_huntable_pokemon');
            return;
        }

        setIsRolling(true);
        setErrorKey(null);
        // Removed setSparklePhase('explosion') from here

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
                    const randomGameIndex = Math.floor(Math.random() * gamesToChooseFrom.length);
                    validResult = {
                        pokemon: randomPokemon,
                        game: gamesToChooseFrom[randomGameIndex]
                    };
                } else {
                    candidates = candidates.filter(p => p.id !== randomPokemon.id);
                }

                attempts++;
            }

            if (!validResult) {
                setErrorKey('no_compatible_pokemon');
            } else {
                setResult(validResult);
                setSparklePhase('explosion'); // Trigger animation here
                // Switch to idle animation after explosion finishes (800ms)
                setTimeout(() => {
                    setSparklePhase('idle');
                }, 800);
            }

            setIsRolling(false);
        }, 1000);
    };

    // Feedback logic
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

            toast({
                title: t('feedback_success'),
                variant: 'default',
                className: 'bg-green-900/95 border-green-500 text-green-200',
            });
            setFeedbackMessage('');
            setFeedbackEmail('');
            setFeedbackCategory('bug');
        } catch (error) {
            console.error('Error sending feedback:', error);
            toast({
                title: t('feedback_error'),
                variant: 'destructive',
            });
        } finally {
            setFeedbackSending(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Tab Content - Full Height */}
            <div className="flex-1 overflow-y-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>

                {/* Filters Tab */}
                {activeTab === 'filters' && (
                    <div className="p-6">
                        <Accordion type="multiple" defaultValue={["gen", "status"]} className="mt-4">
                            {/* Generations */}
                            <AccordionItem value="gen">
                                <AccordionTrigger>
                                    <div className="flex items-center gap-2">
                                        <Book className="w-5 h-5 text-gray-400" />
                                        <span>{t('filter_generation')}</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(gen => (
                                            <FilterChip
                                                key={gen}
                                                label={`${t('gen')} ${gen}`}
                                                isActive={props.activeFilter?.type === 'gen' && props.activeFilter?.value === gen}
                                                variant="filter"
                                                onClick={() => handleFilterClick('gen', gen)}
                                            />
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            {/* Regions */}
                            <AccordionItem value="region">
                                <AccordionTrigger>
                                    <div className="flex items-center gap-2">
                                        <Map className="w-5 h-5 text-gray-400" />
                                        <span>{t('filter_region')}</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        {['Alola', 'Galar', 'Hisui', 'Paldea'].map(region => (
                                            <FilterChip
                                                key={region}
                                                label={getRegionName(region)}
                                                isActive={props.activeFilter?.type === 'region' && props.activeFilter?.value === region}
                                                variant="filter"
                                                onClick={() => handleFilterClick('region', region)}
                                            />
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            {/* Games */}
                            <AccordionItem value="game">
                                <AccordionTrigger>
                                    <div className="flex items-center gap-2">
                                        <Gamepad2 className="w-5 h-5 text-gray-400" />
                                        <span>{t('filter_games')}</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto justify-center pb-4">
                                        {Object.entries(gameList).map(([gameId, gameName]) => (
                                            <FilterChip
                                                key={gameId}
                                                label={gameName}
                                                isActive={props.selectedGame === gameId}
                                                variant="game"
                                                onClick={() => handleGameClick(gameId)}
                                            />
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            {/* Status */}
                            <AccordionItem value="status">
                                <AccordionTrigger>
                                    <div className="flex items-center gap-2">
                                        <Eye className="w-5 h-5 text-gray-400" />
                                        <span>{t('filter_visibility')}</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        <FilterChip
                                            label={t('show_only_shiny')}
                                            isActive={props.showOnlyShiny}
                                            variant="filter"
                                            onClick={() => {
                                                if (!props.showOnlyShiny) {
                                                    props.setShowMissingShiny(false);
                                                }
                                                props.setShowOnlyShiny(!props.showOnlyShiny);
                                            }}
                                        />
                                        <FilterChip
                                            label={t('show_missing_shiny')}
                                            isActive={props.showMissingShiny}
                                            variant="filter"
                                            onClick={() => {
                                                if (!props.showMissingShiny) {
                                                    props.setShowOnlyShiny(false);
                                                }
                                                props.setShowMissingShiny(!props.showMissingShiny);
                                            }}
                                        />
                                        <FilterChip
                                            label={t('hide_grayed_pokemon')}
                                            isActive={props.hideGrayedPokemon}
                                            variant="filter"
                                            onClick={() => props.setHideGrayedPokemon(!props.hideGrayedPokemon)}
                                        />
                                        <FilterChip
                                            label={t('hide_shiny_locked')}
                                            isActive={props.hideShinyLocked}
                                            variant="filter"
                                            onClick={() => props.setHideShinyLocked(!props.hideShinyLocked)}
                                        />
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                )}

                {/* Random Hunt Tab */}
                {activeTab === 'randomHunt' && (
                    <div className="p-6">
                        <h2 className="text-2xl font-bold mb-4 text-center text-white">{t('random_hunt')}</h2>
                        <p className="text-gray-400 mb-6 text-center text-sm">{t('random_hunt_description')}</p>

                        {errorKey && (
                            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded mb-4">
                                {t(errorKey)}
                            </div>
                        )}

                        {result && (
                            <div className="mb-6 text-center">
                                <div className="relative inline-block">
                                    {/* Sparkle animations - Random positions */}
                                    <div className="absolute -inset-4 pointer-events-none z-20">
                                        {[
                                            { x: 15, y: 20, delay: 0, size: 16, color: 'text-yellow-300' },
                                            { x: 80, y: 25, delay: 0.3, size: 20, color: 'text-blue-300' },
                                            { x: 20, y: 80, delay: 0.6, size: 12, color: 'text-pink-300' },
                                            { x: 80, y: 75, delay: 0.9, size: 16, color: 'text-white' },
                                            { x: 50, y: 10, delay: 0.45, size: 24, color: 'text-yellow-200' },
                                            { x: 85, y: 50, delay: 0.75, size: 12, color: 'text-cyan-300' },
                                            { x: 10, y: 50, delay: 1.05, size: 20, color: 'text-pink-200' },
                                            { x: 40, y: 85, delay: 0.15, size: 16, color: 'text-blue-200' },
                                            { x: 25, y: 35, delay: 1.2, size: 12, color: 'text-white' },
                                            { x: 70, y: 65, delay: 0.6, size: 20, color: 'text-yellow-300' },
                                        ].map((sparkle, i) => (
                                            <div
                                                key={i}
                                                className={`absolute ${sparklePhase === 'explosion' ? 'animate-sparkle-explosion' : 'animate-sparkle-idle'}`}
                                                style={{
                                                    left: `${sparkle.x}%`,
                                                    top: `${sparkle.y}%`,
                                                    '--tw-left': `${sparkle.x}%`,
                                                    '--tw-top': `${sparkle.y}%`,
                                                    animationDelay: sparklePhase === 'explosion' ? '0s' : `${sparkle.delay}s`,
                                                } as React.CSSProperties}
                                            >
                                                <svg
                                                    className={`${sparkle.color} drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]`}
                                                    fill="currentColor"
                                                    viewBox="0 0 24 24"
                                                    style={{ width: `${sparkle.size}px`, height: `${sparkle.size}px` }}
                                                >
                                                    <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7.4-6.3-4.6-6.3 4.6 2.3-7.4-6-4.6h7.6z" />
                                                </svg>
                                            </div>
                                        ))}
                                    </div>

                                    <img
                                        src={result.pokemon.shinySprite}
                                        alt={result.pokemon.name}
                                        className="w-44 h-44 mx-auto relative z-10 drop-shadow-lg"
                                    />
                                </div>
                                <div className="mt-2 text-center">
                                    <p className="text-lg text-gray-400 font-bold">#{result.pokemon.id.toString().split('-')[0].padStart(3, '0')}</p>
                                    <p className="text-2xl font-bold text-white">{getPokemonName(result.pokemon.id.toString())}</p>
                                </div>
                                <div className="bg-gray-800 rounded p-3 mt-4 inline-block border border-gray-700">
                                    <p className="text-sm text-gray-400 mb-1">{t('hunt_in')}</p>
                                    <p className="text-lg font-semibold text-white">{gameVersions[result.game] || result.game}</p>
                                </div>
                            </div>
                        )}

                        <Button
                            onClick={handleRoll}
                            disabled={isRolling}
                            className="w-full bg-poke-yellow hover:bg-yellow-500 text-gray-900 font-bold"
                            size="lg"
                        >
                            {isRolling ? (
                                <div className="flex items-center justify-center gap-2">
                                    <DiceIcon className="w-6 h-6 animate-spin" />
                                    <span>{t('rolling')}</span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-2">
                                    <DiceIcon className="w-6 h-6" />
                                    <span>{t('roll')}</span>
                                </div>
                            )}
                        </Button>
                    </div>
                )}

                {/* Feedback Tab */}
                {activeTab === 'feedback' && (
                    <div className="p-6">
                        <h2 className="text-2xl font-bold mb-4 text-white">{t('feedback')}</h2>
                        <p className="text-gray-400 mb-6 text-sm">{t('feedback_description')}</p>

                        <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="feedback-category" className="text-gray-300">{t('feedback_category')}</Label>
                                <Select value={feedbackCategory} onValueChange={setFeedbackCategory}>
                                    <SelectTrigger id="feedback-category" className="w-full mt-2 bg-gray-700 border-gray-600 text-white focus:ring-poke-yellow">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-gray-700 border-gray-600">
                                        {feedbackCategories.map(cat => (
                                            <SelectItem key={cat.value} value={cat.value} className="text-white focus:bg-gray-600">
                                                {cat.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="feedback-message" className="text-gray-300">{t('feedback_message')}</Label>
                                <Textarea
                                    id="feedback-message"
                                    value={feedbackMessage}
                                    onChange={(e) => setFeedbackMessage(e.target.value)}
                                    placeholder={t('feedback_message_placeholder')}
                                    rows={5}
                                    required
                                    className="mt-2 bg-gray-700 border-gray-600 text-white focus:ring-poke-yellow"
                                />
                            </div>

                            <div>
                                <Label htmlFor="feedback-email" className="text-gray-300">{t('feedback_email')} ({t('optional')})</Label>
                                <Input
                                    id="feedback-email"
                                    type="email"
                                    value={feedbackEmail}
                                    onChange={(e) => setFeedbackEmail(e.target.value)}
                                    placeholder={t('feedback_email_placeholder')}
                                    className="mt-2 bg-gray-700 border-gray-600 text-white focus:ring-poke-yellow"
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={feedbackSending || !feedbackMessage.trim()}
                                className="w-full bg-poke-yellow hover:bg-yellow-500 text-gray-900 font-bold"
                            >
                                {feedbackSending ? t('sending') : t('send')}
                            </Button>
                        </form>
                    </div>
                )}
            </div>

            {/* Tab Navigation at Bottom */}
            <div className="border-t border-gray-700 bg-gray-800 p-2">
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('filters')}
                        className={`flex-1 py-2 px-4 rounded transition-colors ${activeTab === 'filters'
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                    >
                        <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                    </button>
                    <button
                        onClick={() => setActiveTab('randomHunt')}
                        className={`flex-1 py-2 px-4 rounded transition-colors ${activeTab === 'randomHunt'
                            ? 'bg-yellow-500 text-gray-900'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                    >
                        <DiceIcon className="w-5 h-5 mx-auto" />
                    </button>
                    <button
                        onClick={() => setActiveTab('feedback')}
                        className={`flex-1 py-2 px-4 rounded transition-colors ${activeTab === 'feedback'
                            ? 'bg-red-600 text-white'
                            : 'bg-red-900/50 text-gray-300 hover:bg-red-900/70'
                            }`}
                    >
                        <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LeftSidebar;
