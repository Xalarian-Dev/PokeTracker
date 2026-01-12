// Service pour gérer les formes de Pokémon (shiny + favorite)

export interface PokemonFormsData {
    shinyForms: Record<string, string[]>;
    favoriteForms: Record<string, string>;
}

/**
 * Charger toutes les formes de Pokémon de l'utilisateur
 */
export async function loadPokemonForms(): Promise<PokemonFormsData> {
    try {
        const response = await fetch('/api/pokemon-forms', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to load pokemon forms');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error loading pokemon forms:', error);
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
        const response = await fetch('/api/pokemon-forms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'toggle-shiny',
                pokemonId,
                formId,
                isShiny,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to toggle form shiny status');
        }

        return true;
    } catch (error) {
        console.error('Error toggling form shiny:', error);
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
        const response = await fetch('/api/pokemon-forms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'set-favorite',
                pokemonId,
                formId,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to set favorite form');
        }

        return true;
    } catch (error) {
        console.error('Error setting favorite form:', error);
        return false;
    }
}
