import React, { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCollection } from '../contexts/CollectionContext';
import { POKEMON_AVAILABILITY, SHINY_LOCKED_POKEMON, GAME_GROUP_MAP } from '../data/games';
import type { Pokemon } from '../types';
import { DiceIcon } from '../components/Icons';
import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui';
import { useToast } from '../hooks/use-toast';
import { Minus, Plus, Search, X } from 'lucide-react';

const STORAGE_KEY = 'pokeTrackerHunt';
const MAX_ENCOUNTERS = 9_999_999;
const MAX_SUGGESTIONS = 8;

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

interface HuntState {
    pokemonId: string | null;
    game: string | null;
    encounters: number;
}

const EMPTY_HUNT: HuntState = { pokemonId: null, game: null, encounters: 0 };

function loadHunt(): HuntState {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return EMPTY_HUNT;
        const data = JSON.parse(raw);
        const encounters = Number.isInteger(data.encounters) && data.encounters >= 0 ? Math.min(data.encounters, MAX_ENCOUNTERS) : 0;
        return {
            pokemonId: typeof data.pokemonId === 'string' ? data.pokemonId : null,
            game: typeof data.game === 'string' ? data.game : null,
            encounters,
        };
    } catch {
        return EMPTY_HUNT;
    }
}

/** Page « Chasse » : cible tirée au sort ou choisie, jeu utilisé, compteur de rencontres, bouton « Capturé ! ». */
const RandomHuntPage: React.FC = () => {
    const { t, gameVersions, getPokemonName } = useLanguage();
    const { pokemonList, shinyPokemons, ownedGames, captureShiny } = useCollection();
    const { toast } = useToast();

    const [hunt, setHunt] = useState<HuntState>(loadHunt);
    const [search, setSearch] = useState('');
    const [errorKey, setErrorKey] = useState<string | null>(null);
    const [isRolling, setIsRolling] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [sparklePhase, setSparklePhase] = useState<'explosion' | 'idle'>('explosion');

    // La chasse en cours survit au rechargement de la page (une chasse dure souvent des milliers de rencontres)
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(hunt));
        } catch {
            // stockage local indisponible : la chasse n'est simplement pas conservée
        }
    }, [hunt]);

    const target: Pokemon | undefined = useMemo(
        () => (hunt.pokemonId ? pokemonList.find(p => p.id === hunt.pokemonId) : undefined),
        [hunt.pokemonId, pokemonList]
    );

    /** Jeux dans lesquels la cible est disponible et pas verrouillée shiny (limités à vos jeux si vous les avez renseignés) */
    const gamesForTarget = useMemo(() => {
        if (!target) return [] as string[];
        const available = POKEMON_AVAILABILITY[target.id] || [];
        const unlocked = available.filter(gameId => {
            const group = Object.keys(GAME_GROUP_MAP).find(key => GAME_GROUP_MAP[key].includes(gameId));
            return !group || !(SHINY_LOCKED_POKEMON[group] || []).includes(target.id);
        });
        const owned = ownedGames && ownedGames.length > 0 ? unlocked.filter(g => ownedGames.includes(g)) : unlocked;
        return owned.length > 0 ? owned : unlocked;
    }, [target, ownedGames]);

    // Une cible déjà capturée entre-temps (ou disparue de la liste) n'a plus de sens
    useEffect(() => {
        if (hunt.pokemonId && (!target || shinyPokemons.has(hunt.pokemonId)) && pokemonList.length > 0) {
            setHunt(EMPTY_HUNT);
        }
    }, [hunt.pokemonId, target, shinyPokemons, pokemonList.length]);

    const suggestions = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (q.length < 1) return [];
        return pokemonList
            .filter(p => !shinyPokemons.has(p.id))
            .filter(p => getPokemonName(p.id.toString()).toLowerCase().includes(q) || p.id.toString().split('-')[0] === q.replace('#', ''))
            .slice(0, MAX_SUGGESTIONS);
    }, [search, pokemonList, shinyPokemons, getPokemonName]);

    const chooseTarget = (pokemon: Pokemon) => {
        setErrorKey(null);
        setSearch('');
        setHunt({ pokemonId: pokemon.id, game: null, encounters: 0 });
        setSparklePhase('idle');
    };

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
                setHunt({ pokemonId: validResult.pokemon.id, game: validResult.game, encounters: 0 });
                setSparklePhase('explosion');
                setTimeout(() => setSparklePhase('idle'), 800);
            }
            setIsRolling(false);
        }, 1000);
    };

    const clampEncounters = (value: number) =>
        Number.isFinite(value) ? Math.max(0, Math.min(MAX_ENCOUNTERS, Math.floor(value))) : 0;
    const setEncounters = (value: number) => setHunt(h => ({ ...h, encounters: clampEncounters(value) }));
    /** Variation de ±1 calculée sur la valeur la plus récente (clics rapides successifs) */
    const addEncounters = (delta: number) => setHunt(h => ({ ...h, encounters: clampEncounters(h.encounters + delta) }));

    const handleCaptured = async () => {
        if (!target || isSaving) return;
        setIsSaving(true);
        try {
            await captureShiny(target.id, { game: hunt.game, encounters: hunt.encounters });
            toast({ title: t('hunt_caught_toast', { name: getPokemonName(target.id.toString()) }) });
            setHunt(EMPTY_HUNT);
        } catch {
            toast({ title: t('hunt_caught_error'), variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };

    const numberFormat = new Intl.NumberFormat();

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-3 text-center text-white">{t('nav_hunt')}</h1>
            <p className="text-gray-300 mb-6 text-center">{t('hunt_description')}</p>

            {errorKey && (
                <div role="alert" className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded mb-4">
                    {t(errorKey)}
                </div>
            )}

            {/* Choix de la cible : tirage au sort ou recherche */}
            <section aria-label={t('hunt_choose_target')} className="bg-gray-800 border border-gray-700 rounded-xl p-5 mb-6">
                <Button
                    onClick={handleRoll}
                    disabled={isRolling}
                    className="w-full bg-poke-yellow hover:bg-yellow-500 text-gray-900 font-bold"
                    size="lg"
                >
                    <span className="flex items-center justify-center gap-2">
                        <DiceIcon className={`w-6 h-6 ${isRolling ? 'animate-spin' : ''}`} />
                        <span>{isRolling ? t('rolling') : t('random_hunt')}</span>
                    </span>
                </Button>

                <p className="text-center text-sm text-gray-400 my-3">{t('hunt_or_choose')}</p>

                <Label htmlFor="hunt-search" className="text-gray-300">{t('hunt_search_label')}</Label>
                <div className="relative mt-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" aria-hidden="true" />
                    <Input
                        id="hunt-search"
                        type="search"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder={t('hunt_search_placeholder')}
                        autoComplete="off"
                        className="pl-9 bg-gray-700 border-gray-600 text-white"
                    />
                </div>
                {suggestions.length > 0 && (
                    <ul className="mt-2 bg-gray-700 border border-gray-600 rounded-md divide-y divide-gray-600 overflow-hidden">
                        {suggestions.map(p => (
                            <li key={p.id}>
                                <button
                                    type="button"
                                    onClick={() => chooseTarget(p)}
                                    className="w-full flex items-center gap-3 px-3 min-h-11 text-left text-white hover:bg-gray-600 focus-visible:bg-gray-600"
                                >
                                    <img src={p.sprite} alt="" width={32} height={32} className="w-8 h-8 object-contain" loading="lazy" />
                                    <span className="font-medium">{getPokemonName(p.id.toString())}</span>
                                    <span className="text-xs text-gray-400">#{p.id.toString().split('-')[0].padStart(3, '0')}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
                {search.trim() && suggestions.length === 0 && (
                    <p className="mt-2 text-sm text-gray-400">{t('hunt_no_result')}</p>
                )}
            </section>

            {/* Chasse en cours */}
            {target ? (
                <section aria-label={t('hunt_current')} className="bg-gray-800 border border-gray-700 rounded-xl p-5" aria-live="polite">
                    <div className="text-center mb-4">
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
                                src={target.shinySprite}
                                alt={target.name}
                                className="w-44 h-44 mx-auto relative z-10 drop-shadow-lg"
                            />
                        </div>
                        <p className="text-lg text-gray-300 font-bold">#{target.id.toString().split('-')[0].padStart(3, '0')}</p>
                        <p className="text-2xl font-bold text-white">{getPokemonName(target.id.toString())}</p>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                        {/* Jeu utilisé */}
                        <div>
                            <Label htmlFor="hunt-game" className="text-gray-300">{t('hunt_game')}</Label>
                            <Select
                                value={hunt.game ?? undefined}
                                onValueChange={game => setHunt(h => ({ ...h, game }))}
                            >
                                <SelectTrigger id="hunt-game" className="mt-1 h-11 bg-gray-700 border-gray-600 text-white">
                                    <SelectValue placeholder={t('hunt_game_placeholder')} />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-700 border-gray-600">
                                    {gamesForTarget.map(g => (
                                        <SelectItem key={g} value={g} className="text-white focus:bg-gray-600">
                                            {gameVersions[g] || g}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Compteur de rencontres */}
                        <div>
                            <Label htmlFor="hunt-encounters" className="text-gray-300">{t('hunt_encounters')}</Label>
                            <div className="mt-1 flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    className="h-11 w-11 p-0 shrink-0"
                                    onClick={() => addEncounters(-1)}
                                    disabled={hunt.encounters <= 0}
                                    aria-label={t('hunt_minus')}
                                >
                                    <Minus className="w-5 h-5" aria-hidden="true" />
                                </Button>
                                <Input
                                    id="hunt-encounters"
                                    type="number"
                                    inputMode="numeric"
                                    min={0}
                                    max={MAX_ENCOUNTERS}
                                    step={1}
                                    value={hunt.encounters}
                                    onChange={e => setEncounters(e.target.value === '' ? 0 : Number(e.target.value))}
                                    onFocus={e => e.currentTarget.select()}
                                    className="h-11 text-center text-lg font-semibold bg-gray-700 border-gray-600 text-white"
                                />
                                <Button
                                    type="button"
                                    variant="secondary"
                                    className="h-11 w-11 p-0 shrink-0"
                                    onClick={() => addEncounters(1)}
                                    disabled={hunt.encounters >= MAX_ENCOUNTERS}
                                    aria-label={t('hunt_plus')}
                                >
                                    <Plus className="w-5 h-5" aria-hidden="true" />
                                </Button>
                            </div>
                            <p className="mt-1 text-xs text-gray-400" aria-live="polite">
                                {t('hunt_encounters_total', { n: numberFormat.format(hunt.encounters) })}
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3">
                        <Button
                            type="button"
                            variant="secondary"
                            className="sm:w-auto h-11 gap-2"
                            onClick={() => setHunt(EMPTY_HUNT)}
                        >
                            <X className="w-4 h-4" aria-hidden="true" />
                            {t('hunt_change_target')}
                        </Button>
                        <Button
                            type="button"
                            size="lg"
                            className="flex-1 bg-poke-yellow hover:bg-yellow-500 text-gray-900 font-bold"
                            onClick={handleCaptured}
                            disabled={isSaving}
                        >
                            {t('hunt_caught')}
                        </Button>
                    </div>
                </section>
            ) : (
                <p className="text-center text-gray-400">{t('hunt_no_target')}</p>
            )}
        </div>
    );
};

export default RandomHuntPage;
