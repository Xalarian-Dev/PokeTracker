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
