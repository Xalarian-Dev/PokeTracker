import React from 'react';
import type { Pokemon } from '../types';
import PokemonCard from './PokemonCard';
import MobilePokemonCard from './MobilePokemonCard';
import { useLanguage } from '../contexts/LanguageContext';

const GENERATION_FIRST_POKEMON: Record<number, number> = {
    1: 1, 2: 152, 3: 252, 4: 387, 5: 494, 6: 650, 7: 722, 8: 810, 9: 906
};

type DisplayedPokemon = Pokemon & { isGrayedOut: boolean };

interface PokemonGridProps {
    displayedPokemon: {
        normal: DisplayedPokemon[];
        regional: Record<'Alola' | 'Galar' | 'Hisui' | 'Paldea', DisplayedPokemon[]>;
    };
    shinyPokemons: Set<string>;
    validatedForms: Map<string, Set<string>>;
    shinyForms: Map<string, Set<string>>;
    favoriteForms: Map<string, string>;
    selectedGame: string | null;
    isMobile: boolean;
    activeCount: number;
    loading: boolean;
    onToggleShiny: (pokemonId: string) => void;
    onToggleForm: (pokemonId: string, formId: string, shouldBeShiny: boolean) => void;
    onSetFavorite: (pokemonId: string, formId: string) => void;
    genRefs: React.MutableRefObject<Record<number, HTMLDivElement | null>>;
    regionRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
}

const PokemonGrid: React.FC<PokemonGridProps> = ({
    displayedPokemon,
    shinyPokemons,
    validatedForms,
    shinyForms,
    favoriteForms,
    selectedGame,
    isMobile,
    activeCount,
    loading,
    onToggleShiny,
    onToggleForm,
    onSetFavorite,
    genRefs,
    regionRefs,
}) => {
    const { t } = useLanguage();

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-poke-yellow"></div>
            </div>
        );
    }

    return (
        <>
            {/* Normal Pokemon */}
            <div className="mobile-grid-6 grid grid-cols-6 gap-1 md:gap-4 md:max-w-[1160px] md:mx-auto w-full">
                {displayedPokemon.normal.map((pokemon) => {
                    const pokemonNumId = parseInt(pokemon.id.split('-')[0]);
                    const isFirstOfGen = Object.entries(GENERATION_FIRST_POKEMON).find(
                        ([, firstId]) => firstId === pokemonNumId
                    );

                    return (
                        <div
                            key={pokemon.id}
                            ref={isFirstOfGen ? (el) => { genRefs.current[parseInt(isFirstOfGen[0])] = el; } : undefined}
                            style={{ scrollMarginTop: '80px' }}
                        >
                            {isMobile ? (
                                <MobilePokemonCard
                                    pokemon={pokemon}
                                    isShiny={shinyPokemons.has(pokemon.id)}
                                    onToggleShiny={onToggleShiny}
                                    selectedGame={selectedGame}
                                    isGrayedOut={pokemon.isGrayedOut}
                                    validatedForms={validatedForms.get(pokemon.id) || new Set()}
                                    shinyForms={shinyForms.get(pokemon.id) || new Set()}
                                    onToggleForm={onToggleForm}
                                />
                            ) : (
                                <PokemonCard
                                    pokemon={pokemon}
                                    isShiny={shinyPokemons.has(pokemon.id)}
                                    onToggleShiny={onToggleShiny}
                                    selectedGame={selectedGame}
                                    isGrayedOut={pokemon.isGrayedOut}
                                    validatedForms={validatedForms.get(pokemon.id) || new Set()}
                                    shinyForms={shinyForms.get(pokemon.id) || new Set()}
                                    onToggleForm={onToggleForm}
                                    favoriteFormId={favoriteForms.get(pokemon.id)}
                                    onSetFavorite={onSetFavorite}
                                />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Regional Forms */}
            {(['Alola', 'Galar', 'Hisui', 'Paldea'] as const).map(region => {
                const regionalPokemon = displayedPokemon.regional[region];
                if (regionalPokemon.length === 0) return null;

                return (
                    <div
                        key={region}
                        className="mt-12"
                        style={{ scrollMarginTop: '80px' }}
                        ref={(el) => { regionRefs.current[region] = el; }}
                    >
                        <div className="flex justify-center mb-4">
                            <div style={{ width: '1160px', maxWidth: '100%' }}>
                                <h2 className="text-2xl font-bold text-poke-yellow">
                                    {region === 'Alola' ? t('regional_forms_alola') :
                                        region === 'Galar' ? t('regional_forms_galar') :
                                            region === 'Hisui' ? t('regional_forms_hisui') :
                                                t('regional_forms_paldea')}
                                </h2>
                            </div>
                        </div>

                        <div className="mobile-grid-6 grid grid-cols-6 gap-1 md:gap-4 md:max-w-[1160px] md:mx-auto w-full">
                            {regionalPokemon.map((pokemon) => (
                                <div key={pokemon.id}>
                                    {isMobile ? (
                                        <MobilePokemonCard
                                            pokemon={pokemon}
                                            isShiny={shinyPokemons.has(pokemon.id)}
                                            onToggleShiny={onToggleShiny}
                                            selectedGame={selectedGame}
                                            isGrayedOut={pokemon.isGrayedOut}
                                            validatedForms={validatedForms.get(pokemon.id) || new Set()}
                                            shinyForms={shinyForms.get(pokemon.id) || new Set()}
                                            onToggleForm={onToggleForm}
                                        />
                                    ) : (
                                        <PokemonCard
                                            pokemon={pokemon}
                                            isShiny={shinyPokemons.has(pokemon.id)}
                                            onToggleShiny={onToggleShiny}
                                            selectedGame={selectedGame}
                                            isGrayedOut={pokemon.isGrayedOut}
                                            validatedForms={validatedForms.get(pokemon.id) || new Set()}
                                            shinyForms={shinyForms.get(pokemon.id) || new Set()}
                                            onToggleForm={onToggleForm}
                                            favoriteFormId={favoriteForms.get(pokemon.id)}
                                            onSetFavorite={onSetFavorite}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}

            {/* No results message */}
            {activeCount === 0 && (
                <div className="text-center py-16">
                    <p className="text-xl text-gray-500">{t('no_pokemon_found')}</p>
                </div>
            )}
        </>
    );
};

export default PokemonGrid;
