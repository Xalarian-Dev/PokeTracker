import { createClient } from '@supabase/supabase-js';

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
    const { data, error } = await supabase
        .from('shiny_pokemon')
        .select('pokemon_id')
        .eq('user_id', userId);

    if (error) {
        console.error('Error fetching shinies:', error);
        throw error;
    }

    return new Set(data?.map(row => row.pokemon_id) || []);
}

/**
 * Add a shiny Pokemon
 */
export async function addShinyPokemon(userId: string, pokemonId: string): Promise<void> {
    const { error } = await supabase
        .from('shiny_pokemon')
        .insert({ user_id: userId, pokemon_id: pokemonId });

    if (error) {
        // Ignore duplicate errors (user already has this shiny)
        if (error.code !== '23505') {
            console.error('Error adding shiny:', error);
            throw error;
        }
    }
}

/**
 * Remove a shiny Pokemon
 */
export async function removeShinyPokemon(userId: string, pokemonId: string): Promise<void> {
    const { error } = await supabase
        .from('shiny_pokemon')
        .delete()
        .eq('user_id', userId)
        .eq('pokemon_id', pokemonId);

    if (error) {
        console.error('Error removing shiny:', error);
        throw error;
    }
}

/**
 * Subscribe to real-time changes for a user's shinies
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

    const records = localShinyIds.map(pokemonId => ({
        user_id: userId,
        pokemon_id: pokemonId
    }));

    const { error } = await supabase
        .from('shiny_pokemon')
        .upsert(records, { onConflict: 'user_id,pokemon_id' });

    if (error) {
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
    const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            // No preferences found, return null
            return null;
        }
        console.error('Error fetching preferences:', error);
        throw error;
    }

    return data;
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
    const { error } = await supabase
        .from('user_preferences')
        .upsert({
            user_id: userId,
            preferred_language: language,
            owned_games: ownedGames,
            display_name: displayName,
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'user_id'
        });

    if (error) {
        console.error('Error saving preferences:', error);
        throw error;
    }
}

/**
 * Create default preferences for new user
 */
export async function createDefaultPreferences(userId: string): Promise<void> {
    const { error } = await supabase
        .from('user_preferences')
        .insert({
            user_id: userId,
            preferred_language: 'fr',
            owned_games: []
        });

    if (error && error.code !== '23505') {
        // Ignore duplicate errors
        console.error('Error creating default preferences:', error);
        throw error;
    }
}

/**
 * Delete all user data from Supabase
 * This removes all shiny pokemon and user preferences
 */
export async function deleteUserData(userId: string): Promise<void> {
    // Delete shiny pokemon
    const { error: shinyError } = await supabase
        .from('shiny_pokemon')
        .delete()
        .eq('user_id', userId);

    if (shinyError) {
        console.error('Error deleting shiny pokemon:', shinyError);
        throw shinyError;
    }

    // Delete user preferences
    const { error: prefsError } = await supabase
        .from('user_preferences')
        .delete()
        .eq('user_id', userId);

    if (prefsError) {
        console.error('Error deleting user preferences:', prefsError);
        throw prefsError;
    }
}
