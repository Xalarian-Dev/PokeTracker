// Service pour gérer les formes de Pokémon (shiny + favorite)

export interface PokemonFormsData {
    shinyForms: Record<string, string[]>;
    favoriteForms: Record<string, string>;
}

/**
 * Helper: Get Clerk authentication token
 */
async function getAuthToken(): Promise<string> {
    const getToken = (window as any).__clerk_getToken;
    if (!getToken) {
        throw new Error('Clerk getToken function not available');
    }

    const token = await getToken();
    if (!token) {
        throw new Error('No authentication token available');
    }
    return token;
}

/**
 * Helper: Make authenticated API request
 */
async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = await getAuthToken();

    const response = await fetch(`/api/${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers,
        },
    });

    if (!response.ok) {
        if (response.status === 401) {
            window.dispatchEvent(new CustomEvent('session-expired'));
            throw new Error('Session expired');
        }

        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || `API request failed: ${response.status}`);
    }

    return response.json();
}

/**
 * Charger toutes les formes de Pokémon de l'utilisateur
 */
export async function loadPokemonForms(): Promise<PokemonFormsData> {
    try {
        const data = await apiRequest<PokemonFormsData>('pokemon-forms');
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
        await apiRequest('pokemon-forms', {
            method: 'POST',
            body: JSON.stringify({
                action: 'set-favorite',
                pokemonId,
                formId,
            }),
        });

        return true;
    } catch (error) {
        console.error('Error setting favorite form:', error);
        return false;
    }
}
