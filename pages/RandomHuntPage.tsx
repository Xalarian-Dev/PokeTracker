import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCollection } from '../contexts/CollectionContext';
import { POKEMON_AVAILABILITY, SHINY_LOCKED_POKEMON, GAME_GROUP_MAP } from '../data/games';
import type { Pokemon } from '../types';
import { DiceIcon } from '../components/Icons';
import { Button } from '../components/ui';

const SPARKLES = [
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
];

/** Chasse aléatoire : tire au sort un Pokémon non encore capturé et un jeu dans lequel le chasser. */
const RandomHuntPage: React.FC = () => {
    const { t, gameVersions, getPokemonName } = useLanguage();
    const { pokemonList, shinyPokemons, ownedGames } = useCollection();

    const [result, setResult] = useState<{ pokemon: Pokemon; game: string } | null>(null);
    const [errorKey, setErrorKey] = useState<string | null>(null);
    const [isRolling, setIsRolling] = useState(false);
    const [sparklePhase, setSparklePhase] = useState<'explosion' | 'idle'>('explosion');

    const handleRoll = () => {
        let candidates = pokemonList.filter(p => !shinyPokemons.has(p.id));
        setErrorKey(null);

        if (candidates.length === 0) {
            setErrorKey('no_huntable_pokemon');
            return;
        }

        setIsRolling(true);

        setTimeout(() => {
            let validResult: { pokemon: Pokemon; game: string } | null = null;
            let attempts = 0;
            const MAX_ATTEMPTS = 50;

            while (!validResult && attempts < MAX_ATTEMPTS && candidates.length > 0) {
                const randomPokemon = candidates[Math.floor(Math.random() * candidates.length)];
                const availableGames = POKEMON_AVAILABILITY[randomPokemon.id] || [];

                const unlockedGames = availableGames.filter(gameId => {
                    const group = Object.keys(GAME_GROUP_MAP).find(key => GAME_GROUP_MAP[key].includes(gameId));
                    if (!group) return true;
                    return !(SHINY_LOCKED_POKEMON[group] || []).includes(randomPokemon.id);
                });

                let gamesToChooseFrom = unlockedGames;
                if (ownedGames && ownedGames.length > 0) {
                    gamesToChooseFrom = unlockedGames.filter(gameId => ownedGames.includes(gameId));
                }

                if (gamesToChooseFrom.length > 0) {
                    validResult = {
                        pokemon: randomPokemon,
                        game: gamesToChooseFrom[Math.floor(Math.random() * gamesToChooseFrom.length)],
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
                setSparklePhase('explosion');
                setTimeout(() => setSparklePhase('idle'), 800);
            }
            setIsRolling(false);
        }, 1000);
    };

    return (
        <div className="max-w-md mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-3 text-center text-white">{t('random_hunt')}</h1>
            <p className="text-gray-300 mb-6 text-center">{t('random_hunt_description')}</p>

            {errorKey && (
                <div role="alert" className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded mb-4">
                    {t(errorKey)}
                </div>
            )}

            {result && (
                <div className="mb-6 text-center" aria-live="polite">
                    <div className="relative inline-block">
                        <div className="absolute -inset-4 pointer-events-none z-20" aria-hidden="true">
                            {SPARKLES.map((sparkle, i) => (
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
                        <p className="text-lg text-gray-300 font-bold">#{result.pokemon.id.toString().split('-')[0].padStart(3, '0')}</p>
                        <p className="text-2xl font-bold text-white">{getPokemonName(result.pokemon.id.toString())}</p>
                    </div>
                    <div className="bg-gray-800 rounded p-3 mt-4 inline-block border border-gray-700">
                        <p className="text-sm text-gray-300 mb-1">{t('hunt_in')}</p>
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
                <span className="flex items-center justify-center gap-2">
                    <DiceIcon className={`w-6 h-6 ${isRolling ? 'animate-spin' : ''}`} />
                    <span>{isRolling ? t('rolling') : t('roll')}</span>
                </span>
            </Button>
        </div>
    );
};

export default RandomHuntPage;
