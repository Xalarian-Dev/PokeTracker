import { createClient } from '@supabase/supabase-js';
import { apiRequest } from './authTokenStore';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Fetch all shiny Pokemon for a user
 */
export async function fetchShinyPokemon(userId: string): Promise<Set<string>> {
    const data = await apiRequest<{ shinies: string[] }>('shinies');
    return new Set(data.shinies);
}

/**
 * Add a shiny Pokemon
 */
export async function addShinyPokemon(userId: string, pokemonId: string): Promise<void> {
    await apiRequest('shinies', {
        method: 'POST',
        body: JSON.stringify({ pokemonId }),
    });
}

/**
 * Remove a shiny Pokemon
 */
export async function removeShinyPokemon(userId: string, pokemonId: string): Promise<void> {
    await apiRequest('shinies', {
        method: 'DELETE',
        body: JSON.stringify({ pokemonId }),
    });
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

    await Promise.all(
        localShinyIds.map(pokemonId => addShinyPokemon(userId, pokemonId))
    );
}

/**
 * User Preferences Types
 */
export interface UserPreferences {
    user_id: string;
    preferred_language: 'fr' | 'en' | 'jp' | 'es';
    owned_games: string[];
    display_name?: string;
}

/**
 * Get user preferences
 */
export async function getUserPreferences(userId: string): Promise<UserPreferences | null> {
    const data = await apiRequest<{ preferences: UserPreferences | null }>('preferences');
    return data.preferences;
}

/**
 * Save user preferences (upsert)
 */
export async function saveUserPreferences(
    userId: string,
    language: 'fr' | 'en' | 'jp' | 'es',
    ownedGames: string[],
    displayName?: string
): Promise<void> {
    await apiRequest('preferences', {
        method: 'PUT',
        body: JSON.stringify({
            language,
            ownedGames,
            displayName,
        }),
    });
}

/**
 * Create default preferences for new user
 */
export async function createDefaultPreferences(userId: string): Promise<void> {
    await saveUserPreferences(userId, 'fr', []);
}

/**
 * Delete all user data from Supabase
 * This removes all shiny pokemon and user preferences
 */
export async function deleteUserData(userId: string): Promise<void> {
    await apiRequest('user-data', {
        method: 'DELETE',
    });
}
