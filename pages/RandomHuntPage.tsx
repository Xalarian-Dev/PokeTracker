import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCollection } from '../contexts/CollectionContext';
import { POKEMON_AVAILABILITY, SHINY_LOCKED_POKEMON, GAME_GROUP_MAP } from '../data/games';
import type { Pokemon } from '../types';
import { DiceIcon } from '../components/Icons';
import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui';
import { useToast } from '../hooks/use-toast';
import { Check, Minus, Plus, Search, X } from 'lucide-react';

const STORAGE_KEY = 'pokeTrackerHunt';
const MAX_ENCOUNTERS = 9_999_999;
const MAX_SUGGESTIONS = 8;
const LISTBOX_ID = 'hunt-suggestions';

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

/** Chasse en cours (conservée au rechargement) */
interface HuntState {
    pokemonId: string | null;
    game: string | null;
    encounters: number;
}

/** Données déjà enregistrées d'un shiny capturé, en cours de modification (non conservées au rechargement) */
interface EditState {
    pokemonId: string;
    game: string | null;
    /** null = aucun nombre de rencontres enregistré */
    encounters: number | null;
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

const baseId = (p: Pokemon) => p.id.toString().split('-')[0];

const clampEncounters = (value: number) =>
    Number.isFinite(value) ? Math.max(0, Math.min(MAX_ENCOUNTERS, Math.floor(value))) : 0;

/** Page « Chasse » : cible tirée au sort ou choisie, jeu utilisé, compteur de rencontres, bouton « Capturé ! ».
 *  Choisir un Pokémon déjà capturé affiche (et permet de modifier) les données enregistrées. */
const RandomHuntPage: React.FC = () => {
    const { t, gameVersions, getPokemonName } = useLanguage();
    const { pokemonList, shinyPokemons, ownedGames, userId, captureShiny, shinyDetails, editShinyDetails } = useCollection();
    const { toast } = useToast();

    const [hunt, setHunt] = useState<HuntState>(loadHunt);
    const [edit, setEdit] = useState<EditState | null>(null);
    const [search, setSearch] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const [errorKey, setErrorKey] = useState<string | null>(null);
    const [isRolling, setIsRolling] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [sparklePhase, setSparklePhase] = useState<'explosion' | 'idle'>('explosion');
    const [animKey, setAnimKey] = useState(0);
    const sparkleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // La chasse en cours survit au rechargement de la page (une chasse dure souvent des milliers de rencontres)
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(hunt));
        } catch {
            // stockage local indisponible : la chasse n'est simplement pas conservée
        }
    }, [hunt]);

    const huntTarget: Pokemon | undefined = useMemo(
        () => (hunt.pokemonId ? pokemonList.find(p => p.id === hunt.pokemonId) : undefined),
        [hunt.pokemonId, pokemonList]
    );
    const editTarget: Pokemon | undefined = useMemo(
        () => (edit ? pokemonList.find(p => p.id === edit.pokemonId) : undefined),
        [edit, pokemonList]
    );

    // Une chasse dont la cible a été capturée entre-temps (ou disparue de la liste) n'a plus de sens
    useEffect(() => {
        if (hunt.pokemonId && (!huntTarget || shinyPokemons.has(hunt.pokemonId)) && pokemonList.length > 0) {
            setHunt(EMPTY_HUNT);
        }
    }, [hunt.pokemonId, huntTarget, shinyPokemons, pokemonList.length]);

    /** Ce qui est affiché dans le panneau : les données d'un shiny capturé, sinon la chasse en cours */
    const view = edit && editTarget
        ? { mode: 'edit' as const, pokemon: editTarget, game: edit.game, encounters: edit.encounters ?? 0 }
        : huntTarget
            ? { mode: 'hunt' as const, pokemon: huntTarget, game: hunt.game, encounters: hunt.encounters }
            : null;

    const viewId = view?.pokemon.id;
    const viewGame = view?.game;

    /** Jeux dans lesquels le Pokémon affiché est disponible et pas verrouillé shiny (limités à vos jeux si renseignés) */
    const gamesForView = useMemo(() => {
        if (!viewId) return [] as string[];
        const available = POKEMON_AVAILABILITY[viewId] || [];
        const unlocked = available.filter(gameId => {
            const group = Object.keys(GAME_GROUP_MAP).find(key => GAME_GROUP_MAP[key].includes(gameId));
            return !group || !(SHINY_LOCKED_POKEMON[group] || []).includes(viewId);
        });
        const owned = ownedGames && ownedGames.length > 0 ? unlocked.filter(g => ownedGames.includes(g)) : unlocked;
        const list = owned.length > 0 ? owned : unlocked;
        // un jeu déjà enregistré reste toujours choisissable
        return viewGame && !list.includes(viewGame) ? [viewGame, ...list] : list;
    }, [viewId, viewGame, ownedGames]);

    /** Résultats de la recherche : TOUS les Pokémon correspondants (capturés ou non), correspondance exacte en premier */
    const { suggestions, extraCount } = useMemo(() => {
        const q = search.trim().toLowerCase().replace(/^#/, '');
        if (!q) return { suggestions: [] as Pokemon[], extraCount: 0 };
        const scored: { p: Pokemon; rank: number }[] = [];
        for (const p of pokemonList) {
            const name = getPokemonName(p.id.toString()).toLowerCase();
            const id = baseId(p);
            let rank = -1;
            if (id === q || name === q) rank = 0;
            else if (name.startsWith(q) || (/^\d+$/.test(q) && id.startsWith(q))) rank = 1;
            else if (name.includes(q)) rank = 2;
            if (rank >= 0) scored.push({ p, rank });
        }
        scored.sort((a, b) => a.rank - b.rank);
        return {
            suggestions: scored.slice(0, MAX_SUGGESTIONS).map(s => s.p),
            extraCount: Math.max(0, scored.length - MAX_SUGGESTIONS),
        };
    }, [search, pokemonList, getPokemonName]);

    useEffect(() => setActiveIndex(0), [search]);

    /** Rejoue l'animation d'étoiles (explosion puis étoiles discrètes) */
    const playSparkles = () => {
        if (sparkleTimer.current) clearTimeout(sparkleTimer.current);
        setAnimKey(k => k + 1);
        setSparklePhase('explosion');
        sparkleTimer.current = setTimeout(() => setSparklePhase('idle'), 800);
    };
    useEffect(() => () => { if (sparkleTimer.current) clearTimeout(sparkleTimer.current); }, []);

    const chooseFromList = (pokemon: Pokemon) => {
        setErrorKey(null);
        setSearch('');
        if (shinyPokemons.has(pokemon.id)) {
            const saved = shinyDetails.get(pokemon.id);
            setEdit({ pokemonId: pokemon.id, game: saved?.game ?? null, encounters: saved?.encounters ?? null });
        } else {
            setEdit(null);
            setHunt({ pokemonId: pokemon.id, game: null, encounters: 0 });
        }
        playSparkles();
    };

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowDown' && suggestions.length > 0) {
            e.preventDefault();
            setActiveIndex(i => (i + 1) % suggestions.length);
        } else if (e.key === 'ArrowUp' && suggestions.length > 0) {
            e.preventDefault();
            setActiveIndex(i => (i - 1 + suggestions.length) % suggestions.length);
        } else if (e.key === 'Enter' && suggestions.length > 0) {
            e.preventDefault();
            chooseFromList(suggestions[Math.min(activeIndex, suggestions.length - 1)]);
        } else if (e.key === 'Escape' && search) {
            e.preventDefault();
            e.stopPropagation();
            setSearch('');
        }
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
                setEdit(null);
                setHunt({ pokemonId: validResult.pokemon.id, game: validResult.game, encounters: 0 });
                playSparkles();
            }
            setIsRolling(false);
        }, 1000);
    };

    // Les réglages du panneau (jeu, rencontres) s'appliquent à ce qui est affiché : données enregistrées ou chasse
    const isEditing = edit !== null;
    const setViewGame = (game: string) => {
        if (isEditing) setEdit(e => (e ? { ...e, game } : e));
        else setHunt(h => ({ ...h, game }));
    };
    const setViewEncounters = (value: number) => {
        const clean = clampEncounters(value);
        if (isEditing) setEdit(e => (e ? { ...e, encounters: clean } : e));
        else setHunt(h => ({ ...h, encounters: clean }));
    };
    /** Variation de ±1 calculée sur la valeur la plus récente (clics rapides successifs) */
    const addViewEncounters = (delta: number) => {
        if (isEditing) setEdit(e => (e ? { ...e, encounters: clampEncounters((e.encounters ?? 0) + delta) } : e));
        else setHunt(h => ({ ...h, encounters: clampEncounters(h.encounters + delta) }));
    };

    // Clavier du compteur : + / ↑ / → / Espace ajoutent une rencontre, - / ↓ / ← en retirent une.
    // Actif quand le focus est sur la page, le champ du compteur ou ses boutons (jamais dans une
    // autre zone de saisie, une liste ouverte, un dialogue ni sur un autre bouton).
    const hasView = view !== null;
    useEffect(() => {
        if (!hasView) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey || e.altKey || e.metaKey) return;
            const delta = ['+', 'ArrowUp', 'ArrowRight', ' '].includes(e.key) ? 1
                : ['-', 'ArrowDown', 'ArrowLeft'].includes(e.key) ? -1 : 0;
            if (delta === 0) return;
            const el = e.target as HTMLElement;
            const onCounter = el === document.body || el.id === 'hunt-encounters' || !!el.closest('[data-counter-button]');
            if (!onCounter) return;
            e.preventDefault(); // pas de défilement de la page, pas de double action sur les boutons +/−
            if (e.repeat) return;
            if (isEditing) setEdit(cur => (cur ? { ...cur, encounters: clampEncounters((cur.encounters ?? 0) + delta) } : cur));
            else setHunt(h => ({ ...h, encounters: clampEncounters(h.encounters + delta) }));
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [hasView, isEditing]);

    const handleCaptured = async () => {
        if (!huntTarget || isSaving) return;
        setIsSaving(true);
        try {
            await captureShiny(huntTarget.id, { game: hunt.game, encounters: hunt.encounters });
            toast({ title: t('hunt_caught_toast', { name: getPokemonName(huntTarget.id.toString()) }) });
            setHunt(EMPTY_HUNT);
        } catch {
            toast({ title: t('hunt_caught_error'), variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveEdit = async () => {
        if (!edit || !editTarget || isSaving) return;
        setIsSaving(true);
        try {
            await editShinyDetails(edit.pokemonId, { game: edit.game, encounters: edit.encounters });
            toast({ title: t('hunt_edit_saved', { name: getPokemonName(edit.pokemonId) }) });
            setEdit(null);
        } catch {
            toast({ title: t('hunt_edit_error'), variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };

    const numberFormat = new Intl.NumberFormat();
    const listOpen = suggestions.length > 0;

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
                <Label htmlFor="hunt-search" className="text-gray-300">{t('hunt_search_label')}</Label>
                <div className="relative mt-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" aria-hidden="true" />
                    <Input
                        id="hunt-search"
                        type="text"
                        role="combobox"
                        aria-expanded={listOpen}
                        aria-controls={LISTBOX_ID}
                        aria-autocomplete="list"
                        aria-activedescendant={listOpen ? `hunt-option-${activeIndex}` : undefined}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={handleSearchKeyDown}
                        placeholder={t('hunt_search_placeholder')}
                        autoComplete="off"
                        className="pl-9 bg-gray-700 border-gray-600 text-white"
                    />
                </div>
                <p className="mt-1 text-xs text-gray-400">{t('hunt_search_hint')}</p>

                {listOpen && (
                    <ul
                        id={LISTBOX_ID}
                        role="listbox"
                        aria-label={t('hunt_search_label')}
                        className="mt-2 bg-gray-700 border border-gray-600 rounded-md divide-y divide-gray-600 overflow-hidden"
                    >
                        {suggestions.map((p, i) => {
                            const caught = shinyPokemons.has(p.id);
                            return (
                                <li
                                    key={p.id}
                                    id={`hunt-option-${i}`}
                                    role="option"
                                    aria-selected={i === activeIndex}
                                    onMouseDown={e => e.preventDefault()}
                                    onClick={() => chooseFromList(p)}
                                    onMouseEnter={() => setActiveIndex(i)}
                                    className={`flex items-center gap-3 px-3 min-h-11 cursor-pointer text-white ${i === activeIndex ? 'bg-gray-600' : ''}`}
                                >
                                    <img src={p.sprite} alt="" width={32} height={32} className="w-8 h-8 object-contain" loading="lazy" />
                                    <span className="font-medium">{getPokemonName(p.id.toString())}</span>
                                    <span className="text-xs text-gray-300">#{baseId(p).padStart(3, '0')}</span>
                                    {caught && (
                                        <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-green-900/60 border border-green-500/50 px-2 py-0.5 text-xs text-green-200">
                                            <Check className="w-3 h-3" aria-hidden="true" />
                                            {t('hunt_already_caught')}
                                        </span>
                                    )}
                                </li>
                            );
                        })}
                        {extraCount > 0 && (
                            <li role="presentation" className="px-3 py-2 text-xs text-gray-300">
                                {t('hunt_more_results', { n: extraCount })}
                            </li>
                        )}
                    </ul>
                )}
                {search.trim() && !listOpen && (
                    <p className="mt-2 text-sm text-gray-300">{t('hunt_no_result')}</p>
                )}

                <p className="text-center text-sm text-gray-400 my-3">{t('hunt_or_random')}</p>

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
            </section>

            {/* Chasse en cours, ou données enregistrées d'un shiny déjà capturé */}
            {view ? (
                <section
                    aria-label={view.mode === 'edit' ? t('hunt_edit_title', { name: getPokemonName(view.pokemon.id.toString()) }) : t('hunt_current')}
                    className="bg-gray-800 border border-gray-700 rounded-xl p-5"
                >
                    <div className="text-center mb-4">
                        {view.mode === 'edit' && (
                            <p className="inline-flex items-center gap-1 rounded-full bg-green-900/60 border border-green-500/50 px-3 py-1 text-sm text-green-200 mb-3">
                                <Check className="w-4 h-4" aria-hidden="true" />
                                {t('hunt_already_caught')}
                            </p>
                        )}
                        <div className="relative block w-fit mx-auto">
                            <div key={animKey} className="absolute -inset-4 pointer-events-none z-20" aria-hidden="true">
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
                                src={view.pokemon.shinySprite}
                                alt={view.pokemon.name}
                                className="w-44 h-44 mx-auto relative z-10 drop-shadow-lg"
                            />
                        </div>
                        <p className="text-lg text-gray-300 font-bold">#{baseId(view.pokemon).padStart(3, '0')}</p>
                        <p className="text-2xl font-bold text-white">{getPokemonName(view.pokemon.id.toString())}</p>
                    </div>

                    {view.mode === 'edit' && edit && edit.game === null && edit.encounters === null && (
                        <p className="text-sm text-gray-300 text-center mb-4">{t('hunt_edit_none')}</p>
                    )}
                    {view.mode === 'edit' && !userId && (
                        <p role="note" className="text-sm text-amber-200 bg-amber-900/30 border border-amber-500/40 rounded px-3 py-2 mb-4 text-center">
                            {t('hunt_edit_login')}
                        </p>
                    )}

                    <div className="grid gap-5 sm:grid-cols-2">
                        {/* Jeu utilisé */}
                        <div>
                            <Label htmlFor="hunt-game" className="text-gray-300">{t('hunt_game')}</Label>
                            <Select value={view.game ?? undefined} onValueChange={setViewGame}>
                                <SelectTrigger id="hunt-game" className="mt-1 h-11 bg-gray-700 border-gray-600 text-white">
                                    <SelectValue placeholder={t('hunt_game_placeholder')} />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-700 border-gray-600">
                                    {gamesForView.map(g => (
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
                                    data-counter-button
                                    onClick={() => addViewEncounters(-1)}
                                    disabled={view.encounters <= 0}
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
                                    value={view.encounters}
                                    onChange={e => setViewEncounters(e.target.value === '' ? 0 : Number(e.target.value))}
                                    onFocus={e => e.currentTarget.select()}
                                    className="h-11 text-center text-lg font-semibold bg-gray-700 border-gray-600 text-white"
                                />
                                <Button
                                    type="button"
                                    variant="secondary"
                                    className="h-11 w-11 p-0 shrink-0"
                                    data-counter-button
                                    onClick={() => addViewEncounters(1)}
                                    disabled={view.encounters >= MAX_ENCOUNTERS}
                                    aria-label={t('hunt_plus')}
                                >
                                    <Plus className="w-5 h-5" aria-hidden="true" />
                                </Button>
                            </div>
                            <p className="mt-1 text-xs text-gray-400" aria-live="polite">
                                {t('hunt_encounters_total', { n: numberFormat.format(view.encounters) })}
                            </p>
                            <p className="mt-1 text-xs text-gray-400">{t('hunt_keyboard_hint')}</p>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3">
                        {view.mode === 'edit' ? (
                            <>
                                <Button type="button" variant="secondary" className="sm:w-auto h-11 gap-2" onClick={() => setEdit(null)}>
                                    <X className="w-4 h-4" aria-hidden="true" />
                                    {t('hunt_close')}
                                </Button>
                                <Button
                                    type="button"
                                    size="lg"
                                    className="flex-1 bg-poke-yellow hover:bg-yellow-500 text-gray-900 font-bold"
                                    onClick={handleSaveEdit}
                                    disabled={isSaving || !userId}
                                >
                                    {t('hunt_edit_save')}
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button type="button" variant="secondary" className="sm:w-auto h-11 gap-2" onClick={() => setHunt(EMPTY_HUNT)}>
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
                            </>
                        )}
                    </div>
                </section>
            ) : (
                <p className="text-center text-gray-400">{t('hunt_no_target')}</p>
            )}
        </div>
    );
};

export default RandomHuntPage;
