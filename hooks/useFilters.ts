import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { Pokemon } from '../types';
import { POKEMON_AVAILABILITY, GAME_GROUP_MAP, SHINY_LOCKED_POKEMON } from '../data/games';

interface UseFiltersParams {
    pokemonList: Pokemon[];
    shinyPokemons: Set<string>;
}

export function useFilters({ pokemonList, shinyPokemons }: UseFiltersParams) {
    const [searchTerm, setSearchTerm] = useState('');
    const [showOnlyShiny, setShowOnlyShiny] = useState(false);
    const [showMissingShiny, setShowMissingShiny] = useState(false);
    const [hideGrayedPokemon, setHideGrayedPokemon] = useState(false);
    const [hideShinyLocked, setHideShinyLocked] = useState(false);
    const [activeFilter, setActiveFilter] = useState<{ type: 'gen' | 'region'; value: string | number } | null>(null);
    const [selectedGame, setSelectedGame] = useState<string | null>(null);
    const [scrollTrigger, setScrollTrigger] = useState(0);

    const regionRefs = useRef<Record<string, HTMLDivElement | null>>({
        Alola: null, Galar: null, Hisui: null, Paldea: null
    });

    const genRefs = useRef<Record<number, HTMLDivElement | null>>({
        1: null, 2: null, 3: null, 4: null, 5: null, 6: null, 7: null, 8: null, 9: null
    });

    const isPokemonFiltered = useCallback((pokemon: Pokemon): boolean => {
        const matchesSearch = pokemon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pokemon.id.toString().includes(searchTerm);
        const matchesGen = !activeFilter || activeFilter.type !== 'gen' || pokemon.generation === activeFilter.value;
        const matchesRegion = !activeFilter || activeFilter.type !== 'region' || pokemon.region === activeFilter.value;
        const matchesGame = !selectedGame || (
            POKEMON_AVAILABILITY[pokemon.id] &&
            POKEMON_AVAILABILITY[pokemon.id].some(gameCode => {
                const groupGames = GAME_GROUP_MAP[selectedGame];
                return groupGames ? groupGames.includes(gameCode) : gameCode === selectedGame;
            })
        );
        const matchesShinyFilter = !showOnlyShiny || shinyPokemons.has(pokemon.id);
        const matchesMissingFilter = !showMissingShiny || !shinyPokemons.has(pokemon.id);
        const matchesShinyLockedFilter = !hideShinyLocked || !selectedGame || !(SHINY_LOCKED_POKEMON[selectedGame] || []).includes(pokemon.id);

        return !(matchesSearch && matchesGen && matchesRegion && matchesGame && matchesShinyFilter && matchesMissingFilter && matchesShinyLockedFilter);
    }, [searchTerm, activeFilter, selectedGame, showOnlyShiny, showMissingShiny, shinyPokemons, hideShinyLocked]);

    const displayedPokemon = useMemo(() => {
        const normalPokemon = pokemonList.filter(p => !p.region);
        const regionalPokemon = pokemonList.filter(p => p.region);

        const regionalByRegion = {
            Alola: regionalPokemon.filter(p => p.region === 'Alola'),
            Galar: regionalPokemon.filter(p => p.region === 'Galar'),
            Hisui: regionalPokemon.filter(p => p.region === 'Hisui'),
            Paldea: regionalPokemon.filter(p => p.region === 'Paldea')
        };

        const shouldHide = hideGrayedPokemon || searchTerm.trim() !== '';

        return {
            normal: normalPokemon.map(p => ({ ...p, isGrayedOut: isPokemonFiltered(p) })).filter(p => !shouldHide || !p.isGrayedOut),
            regional: {
                Alola: regionalByRegion.Alola.map(p => ({ ...p, isGrayedOut: isPokemonFiltered(p) })).filter(p => !shouldHide || !p.isGrayedOut),
                Galar: regionalByRegion.Galar.map(p => ({ ...p, isGrayedOut: isPokemonFiltered(p) })).filter(p => !shouldHide || !p.isGrayedOut),
                Hisui: regionalByRegion.Hisui.map(p => ({ ...p, isGrayedOut: isPokemonFiltered(p) })).filter(p => !shouldHide || !p.isGrayedOut),
                Paldea: regionalByRegion.Paldea.map(p => ({ ...p, isGrayedOut: isPokemonFiltered(p) })).filter(p => !shouldHide || !p.isGrayedOut)
            }
        };
    }, [pokemonList, searchTerm, activeFilter, selectedGame, showOnlyShiny, showMissingShiny, shinyPokemons, hideGrayedPokemon, isPokemonFiltered]);

    const activeCount = useMemo(() => {
        const normalActive = displayedPokemon.normal.filter(p => !p.isGrayedOut).length;
        const regionalActive = Object.values(displayedPokemon.regional)
            .flat()
            .filter((p: any) => !p.isGrayedOut).length;
        return normalActive + regionalActive;
    }, [displayedPokemon]);

    // Auto-scroll on filter change
    useEffect(() => {
        if (activeFilter && activeFilter.type === 'region') {
            setTimeout(() => {
                regionRefs.current[activeFilter.value as string]?.scrollIntoView({
                    behavior: 'smooth', block: 'start', inline: 'nearest'
                });
            }, 100);
        } else if (activeFilter && activeFilter.type === 'gen') {
            setTimeout(() => {
                genRefs.current[activeFilter.value as number]?.scrollIntoView({
                    behavior: 'smooth', block: 'start', inline: 'nearest'
                });
            }, 100);
        }
    }, [activeFilter]);

    // Re-trigger scroll when hideGrayedPokemon changes with an active filter
    useEffect(() => {
        if (activeFilter && (activeFilter.type === 'region' || activeFilter.type === 'gen')) {
            setTimeout(() => {
                if (activeFilter.type === 'region') {
                    regionRefs.current[activeFilter.value as string]?.scrollIntoView({
                        behavior: 'smooth', block: 'start', inline: 'nearest'
                    });
                } else if (activeFilter.type === 'gen') {
                    genRefs.current[activeFilter.value as number]?.scrollIntoView({
                        behavior: 'smooth', block: 'start', inline: 'nearest'
                    });
                }
            }, 100);
        }
    }, [hideGrayedPokemon]);

    return {
        searchTerm, setSearchTerm,
        showOnlyShiny, setShowOnlyShiny,
        showMissingShiny, setShowMissingShiny,
        hideGrayedPokemon, setHideGrayedPokemon,
        hideShinyLocked, setHideShinyLocked,
        activeFilter, setActiveFilter,
        selectedGame, setSelectedGame,
        scrollTrigger, setScrollTrigger,
        displayedPokemon,
        activeCount,
        regionRefs,
        genRefs,
    };
}
