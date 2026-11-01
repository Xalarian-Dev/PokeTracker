import { useOutletContext } from 'react-router-dom';
import type { Dispatch, SetStateAction } from 'react';
import type { Pokemon } from '../types';

/** Données de la collection, partagées par toutes les pages de l'application (via <Outlet context>) */
export interface CollectionContext {
    pokemonList: Pokemon[];
    shinyPokemons: Set<string>;
    setShinyPokemons: Dispatch<SetStateAction<Set<string>>>;
    loading: boolean;
    ownedGames: string[];
    userId: string | undefined;
    validatedForms: Map<string, Set<string>>;
    shinyForms: Map<string, Set<string>>;
    favoriteForms: Map<string, string>;
    toggleShiny: (pokemonId: string) => void;
    toggleForm: (pokemonId: string, formId: string, shouldBeShiny: boolean) => void;
    setFavoriteForm: (pokemonId: string, formId: string) => void;
}

export const useCollection = () => useOutletContext<CollectionContext>();
