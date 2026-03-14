// Service pour gérer les formes de Pokémon (shiny + favorite)

import { apiRequest } from './authTokenStore';

export interface PokemonFormsData {
    shinyForms: Record<string, string[]>;
    favoriteForms: Record<string, string>;
}

/**
 * Charger toutes les formes de Pokémon de l'utilisateur
 */
export async function loadPokemonForms(): Promise<PokemonFormsData> {
    try {
        return await apiRequest<PokemonFormsData>('pokemon-forms');
    } catch {
        return { shinyForms: {}, favoriteForms: {} };
    }
}

/**
 * Toggle le statut shiny d'une forme de Pokémon
 */
export async function toggleFormShiny(
    pokemonId: string,
    formId: string,
    isShiny: boolean
): Promise<boolean> {
    try {
        await apiRequest('pokemon-forms', {
            method: 'POST',
            body: JSON.stringify({
                action: 'toggle-shiny',
                pokemonId,
                formId,
                isShiny,
            }),
        });
        return true;
    } catch {
        return false;
    }
}

/**
 * Définir la forme favorite d'un Pokémon
 */
export async function setFavoriteForm(
    pokemonId: string,
    formId: string
): Promise<boolean> {
    try {
        await apiRequest('pokemon-forms', {
            method: 'POST',
            body: JSON.stringify({
                action: 'set-favorite',
                pokemonId,
                formId,
            }),
        });
        return true;
    } catch {
        return false;
    }
}
