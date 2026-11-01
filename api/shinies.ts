import type { VercelRequest, VercelResponse } from '@vercel/node';
import { authenticateRequest, setCorsHeaders, handleOptions } from './_lib/auth.js';
import { supabaseAdmin } from './_lib/supabase.js';
import { isValidPokemonId, isValidGame, isValidEncounters } from './_lib/validate.js';

/**
 * API endpoint for managing user's shiny Pokemon
 * 
 * GET /api/shinies - Fetch all shiny Pokemon for authenticated user
 * POST /api/shinies - Add a shiny Pokemon
 * PUT /api/shinies - Update the game / encounters recorded with a shiny Pokemon
 * DELETE /api/shinies - Remove a shiny Pokemon
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Handle CORS preflight
    if (handleOptions(req, res)) return;
    setCorsHeaders(req, res);

    // Authenticate user
    const userId = await authenticateRequest(req, res);
    if (!userId) return; // Response already sent by authenticateRequest

    try {
        switch (req.method) {
            case 'GET':
                return await handleGet(userId, res);
            case 'POST':
                return await handlePost(userId, req, res);
            case 'PUT':
                return await handlePut(userId, req, res);
            case 'DELETE':
                return await handleDelete(userId, req, res);
            default:
                return res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('API error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

/**
 * GET /api/shinies
 * Fetch all shiny Pokemon for the authenticated user
 */
async function handleGet(userId: string, res: VercelResponse) {
    const { data, error } = await supabaseAdmin
        .from('shiny_pokemon')
        .select('pokemon_id, game, encounters')
        .eq('user_id', userId);

    if (error) {
        console.error('Error fetching shinies:', error);
        return res.status(500).json({ error: 'Failed to fetch shiny Pokemon' });
    }

    const pokemonIds = data?.map(row => row.pokemon_id) || [];
    // Jeu et rencontres enregistrés avec le shiny (page « Chasse »), seulement quand il y en a
    const details: Record<string, { game: string | null; encounters: number | null }> = {};
    for (const row of data || []) {
        if (row.game !== null || row.encounters !== null) {
            details[row.pokemon_id] = { game: row.game, encounters: row.encounters };
        }
    }
    return res.status(200).json({ shinies: pokemonIds, details });
}

/**
 * POST /api/shinies
 * Add a shiny Pokemon for the authenticated user
 * Body: { pokemonId: string, game?: string, encounters?: number }
 * (game et encounters : page « Chasse », bouton « Capturé ! »)
 */
async function handlePost(userId: string, req: VercelRequest, res: VercelResponse) {
    const { pokemonId, game, encounters } = req.body;

    if (!isValidPokemonId(pokemonId)) {
        return res.status(400).json({ error: 'Missing or invalid pokemonId' });
    }
    if (game !== undefined && game !== null && !isValidGame(game)) {
        return res.status(400).json({ error: 'Invalid game' });
    }
    if (encounters !== undefined && encounters !== null && !isValidEncounters(encounters)) {
        return res.status(400).json({ error: 'Invalid encounters' });
    }
    const details = { game: game ?? null, encounters: encounters ?? null };

    const { error } = await supabaseAdmin
        .from('shiny_pokemon')
        .insert({ user_id: userId, pokemon_id: pokemonId, ...details });

    if (error) {
        if (error.code === '23505') {
            return res.status(200).json({ message: 'Pokemon already marked as shiny' });
        }
        console.error('Error adding shiny:', error);
        return res.status(500).json({ error: 'Failed to add shiny Pokemon' });
    }

    // Write to community feed if user has a trainer_id and hasn't hit the cap
    try {
        const { data: prefs } = await supabaseAdmin
            .from('user_preferences')
            .select('trainer_id')
            .eq('user_id', userId)
            .maybeSingle();

        if (prefs?.trainer_id) {
            // Cap enforcement (max 2 per user) is handled atomically by a DB trigger
            await supabaseAdmin
                .from('community_feed')
                .insert({ user_id: userId, trainer_id: prefs.trainer_id, pokemon_id: pokemonId, ...details });
        }
    } catch (feedErr) {
        // Non-fatal: shiny was saved, feed update failed
        console.error('Community feed write error:', feedErr);
    }

    return res.status(201).json({ message: 'Shiny Pokemon added successfully' });
}

/**
 * PUT /api/shinies
 * Modifier le jeu et le nombre de rencontres enregistrés avec un shiny déjà capturé
 * Body: { pokemonId: string, game: string | null, encounters: number | null }
 */
async function handlePut(userId: string, req: VercelRequest, res: VercelResponse) {
    const { pokemonId, game, encounters } = req.body;

    if (!isValidPokemonId(pokemonId)) {
        return res.status(400).json({ error: 'Missing or invalid pokemonId' });
    }
    if (game !== null && !isValidGame(game)) {
        return res.status(400).json({ error: 'Invalid game' });
    }
    if (encounters !== null && !isValidEncounters(encounters)) {
        return res.status(400).json({ error: 'Invalid encounters' });
    }

    const { data, error } = await supabaseAdmin
        .from('shiny_pokemon')
        .update({ game, encounters })
        .eq('user_id', userId)
        .eq('pokemon_id', pokemonId)
        .select('id');

    if (error) {
        console.error('Error updating shiny:', error);
        return res.status(500).json({ error: 'Failed to update shiny Pokemon' });
    }
    if (!data || data.length === 0) {
        return res.status(404).json({ error: 'Shiny Pokemon not found' });
    }

    // Le fil public reprend les mêmes valeurs
    const { error: feedError } = await supabaseAdmin
        .from('community_feed')
        .update({ game, encounters })
        .eq('user_id', userId)
        .eq('pokemon_id', pokemonId);

    if (feedError) {
        // Non-fatal: shiny was updated, feed update failed
        console.error('Community feed update error:', feedError);
    }

    return res.status(200).json({ message: 'Shiny Pokemon updated successfully' });
}

/**
 * DELETE /api/shinies
 * Remove a shiny Pokemon for the authenticated user
 * Body: { pokemonId: string }
 */
async function handleDelete(userId: string, req: VercelRequest, res: VercelResponse) {
    const { pokemonId } = req.body;

    if (!isValidPokemonId(pokemonId)) {
        return res.status(400).json({ error: 'Missing or invalid pokemonId' });
    }

    const { error } = await supabaseAdmin
        .from('shiny_pokemon')
        .delete()
        .eq('user_id', userId)
        .eq('pokemon_id', pokemonId);

    if (error) {
        console.error('Error removing shiny:', error);
        return res.status(500).json({ error: 'Failed to remove shiny Pokemon' });
    }

    // Décision du propriétaire (ticket #2) : retirer un shiny le retire aussi du fil public
    const { error: feedError } = await supabaseAdmin
        .from('community_feed')
        .delete()
        .eq('user_id', userId)
        .eq('pokemon_id', pokemonId);

    if (feedError) {
        // Non-fatal: shiny was removed, feed cleanup failed
        console.error('Community feed delete error:', feedError);
    }

    return res.status(200).json({ message: 'Shiny Pokemon removed successfully' });
}
