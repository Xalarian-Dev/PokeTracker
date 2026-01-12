import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Helper: Get Clerk authentication token
 * Always gets a fresh token from Clerk to avoid expiration issues
 */
async function getAuthToken(): Promise<string> {
    // Get fresh token from Clerk via global function
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
    const token = await getAuthToken(); // Always get fresh token

    const response = await fetch(`/api/${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers,
        },
    });

    if (!response.ok) {
        // Check for 401 Unauthorized (session expired)
        if (response.status === 401) {
            // Dispatch custom event to notify the app that session has expired
            window.dispatchEvent(new CustomEvent('session-expired'));
            throw new Error('Session expired');
        }

        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || `API request failed: ${response.status}`);
    }

    return response.json();
}

/**
 * Fetch all shiny Pokemon for a user
 */
export async function fetchShinyPokemon(userId: string): Promise<Set<string>> {
    try {
        const data = await apiRequest<{ shinies: string[] }>('shinies');
        return new Set(data.shinies);
    } catch (error) {
        console.error('Error fetching shinies:', error);
        throw error;
    }
}

/**
 * Add a shiny Pokemon
 */
export async function addShinyPokemon(userId: string, pokemonId: string): Promise<void> {
    try {
        await apiRequest('shinies', {
            method: 'POST',
            body: JSON.stringify({ pokemonId }),
        });
    } catch (error) {
        console.error('Error adding shiny:', error);
        throw error;
    }
}

/**
 * Remove a shiny Pokemon
 */
export async function removeShinyPokemon(userId: string, pokemonId: string): Promise<void> {
    try {
        await apiRequest('shinies', {
            method: 'DELETE',
            body: JSON.stringify({ pokemonId }),
        });
    } catch (error) {
        console.error('Error removing shiny:', error);
        throw error;
    }
}

/**
 * Subscribe to real-time changes for a user's shinies
 * Note: This still uses direct Supabase client for real-time features
 */
export function subscribeToShinyChanges(
    userId: string,
    callback: (payload: any) => void
) {
    return supabase
        .channel(`shiny_changes_${userId}`)
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'shiny_pokemon',
                filter: `user_id=eq.${userId}`
            },
            callback
        )
        .subscribe();
}

/**
 * Migrate localStorage data to Supabase
 */
export async function migrateLocalStorageToSupabase(
    userId: string,
    localShinyIds: string[]
): Promise<void> {
    if (localShinyIds.length === 0) return;

    // Migrate by calling addShinyPokemon for each ID
    // This ensures proper authentication and RLS compliance
    try {
        await Promise.all(
            localShinyIds.map(pokemonId => addShinyPokemon(userId, pokemonId))
        );
    } catch (error) {
        console.error('Error migrating data:', error);
        throw error;
    }
}

/**
 * User Preferences Types
 */
export interface UserPreferences {
    user_id: string;
    preferred_language: 'fr' | 'en' | 'jp';
    owned_games: string[];
    display_name?: string;
}

/**
 * Get user preferences
 */
export async function getUserPreferences(userId: string): Promise<UserPreferences | null> {
    try {
        const data = await apiRequest<{ preferences: UserPreferences | null }>('preferences');
        return data.preferences;
    } catch (error) {
        console.error('Error fetching preferences:', error);
        throw error;
    }
}

/**
 * Save user preferences (upsert)
 */
export async function saveUserPreferences(
    userId: string,
    language: 'fr' | 'en' | 'jp',
    ownedGames: string[],
    displayName?: string
): Promise<void> {
    try {
        await apiRequest('preferences', {
            method: 'PUT',
            body: JSON.stringify({
                language,
                ownedGames,
                displayName,
            }),
        });
    } catch (error) {
        console.error('Error saving preferences:', error);
        throw error;
    }
}

/**
 * Create default preferences for new user
 */
export async function createDefaultPreferences(userId: string): Promise<void> {
    try {
        await saveUserPreferences(userId, 'fr', []);
    } catch (error) {
        console.error('Error creating default preferences:', error);
        throw error;
    }
}

/**
 * Delete all user data from Supabase
 * This removes all shiny pokemon and user preferences
 */
export async function deleteUserData(userId: string): Promise<void> {
    try {
        await apiRequest('user-data', {
            method: 'DELETE',
        });
    } catch (error) {
        console.error('Error deleting user data:', error);
        throw error;
    }
}
