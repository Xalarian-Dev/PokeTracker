
import React, { useState } from 'react';
import { DiceIcon } from './Icons';
import type { Pokemon } from '../types';
import { POKEMON_AVAILABILITY, SHINY_LOCKED_POKEMON, GAME_GROUP_MAP } from '../data/games';
import { useLanguage } from '../contexts/LanguageContext';

interface RandomHuntSidePanelProps {
    pokemonList: Pokemon[];
    shinyPokemons: Set<string>;
    isOpen: boolean;
    onClose: () => void;
    onOpen: () => void;
    userId?: string;
    ownedGames?: string[];
}

const RandomHuntSidePanel: React.FC<RandomHuntSidePanelProps> = ({ pokemonList, shinyPokemons, isOpen, onClose, onOpen, userId, ownedGames }) => {
    // const [isOpen, setIsOpen] = useState(false); // Lifted up
    const [result, setResult] = useState<{ pokemon: Pokemon; game: string } | null>(null);
    // Store the error KEY, not the translated string, so it updates with language changes
    const [errorKey, setErrorKey] = useState<string | null>(null);
    const [isRolling, setIsRolling] = useState(false);
    const { getGameName, getPokemonName, t } = useLanguage();

    const handleRoll = () => {
        // Filter out captured shinies
        // Create a copy we can modify in the loop
        let candidates = pokemonList.filter(p => !shinyPokemons.has(p.id));
        setErrorKey(null);

        if (candidates.length === 0) {
            setErrorKey('no_huntable_pokemon');
            return;
        }

        setIsRolling(true);
        setResult(null); // Clear previous result to show animation

        setTimeout(() => {
            let validResult: { pokemon: Pokemon; game: string } | null = null;
            let attempts = 0;
            const MAX_ATTEMPTS = 50;

            while (!validResult && attempts < MAX_ATTEMPTS && candidates.length > 0) {
                const randomIndex = Math.floor(Math.random() * candidates.length);
                const randomPokemon = candidates[randomIndex];

                // Find available games
                const availableGames = POKEMON_AVAILABILITY[randomPokemon.id] || [];

                // Filter out games where this pokemon is shiny locked
                const unlockedGames = availableGames.filter(gameId => {
                    // Find which group this game belongs to
                    const group = Object.keys(GAME_GROUP_MAP).find(key => GAME_GROUP_MAP[key].includes(gameId));
                    if (!group) return true; // No group mapping found, assume unlocked (or handle as error)

                    const lockedIds = SHINY_LOCKED_POKEMON[group] || [];
                    // Check if ID is locked
                    return !lockedIds.includes(randomPokemon.id);
                });

                // Filter by owned games if user has specified them
                let gamesToChooseFrom = unlockedGames;
                if (ownedGames && ownedGames.length > 0) {
                    gamesToChooseFrom = unlockedGames.filter(gameId => ownedGames.includes(gameId));
                }

                if (gamesToChooseFrom.length > 0) {
                    const randomGame = gamesToChooseFrom[Math.floor(Math.random() * gamesToChooseFrom.length)];
                    validResult = { pokemon: randomPokemon, game: randomGame };
                } else {
                    // Remove this candidate to avoid re-picking loop
                    candidates.splice(randomIndex, 1);
                }
                attempts++;
            }

            if (validResult) {
                setResult(validResult);
            } else {
                // Determine message based on why we failed
                setErrorKey('no_huntable_pokemon');
            }
            setIsRolling(false);
        }, 1500); // 1.5s delay
    };

    return (
        <>
            <button
                onClick={onOpen}
                className={`fixed left-0 top-1/2 transform -translate-y-1/2 z-50 bg-gray-800 p-3 rounded-r-xl shadow-xl hover:bg-gray-700 transition-all duration-300 ${isOpen ? 'translate-x-[-100%]' : 'translate-x-0'}`}
                aria-label="Open Random Hunt"
            >
                <DiceIcon className="w-8 h-8 text-white animate-pulse" />
            </button>

            {/* Side Panel */}
            <div
                className={`fixed inset-y-0 left-0 bg-gray-900 border-r border-gray-700 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} w-80 flex flex-col`}
            >
                <div className="p-4 flex justify-between items-center border-b border-gray-700">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <DiceIcon className="w-6 h-6" /> Random Hunt
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-red-500 hover:text-red-400 text-3xl font-bold"
                    >
                        &times;
                    </button>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-8">
                    {!result && !isRolling ? (
                        <div className="text-center space-y-6">
                            <p className="text-2xl font-bold text-white animate-bounce">{t('what_do_we_hunt')}</p>
                            {errorKey && (
                                // @ts-ignore - dynamic key
                                <p className="text-red-400 text-sm font-semibold">{t(errorKey)}</p>
                            )}
                            <button
                                onClick={handleRoll}
                                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-full shadow-lg hover:scale-105 transition-transform"
                            >
                                {t('lets_go')}
                            </button>
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
                                    {/* Dynamic sparkles with random positions and animations */}
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

                            <button
                                onClick={handleRoll}
                                className="mt-8 px-6 py-2 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition-colors text-sm"
                            >
                                {t('reroll')}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Overlay to close */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                    onClick={onClose}
                />
            )}
        </>
    );
};

export default RandomHuntSidePanel;
