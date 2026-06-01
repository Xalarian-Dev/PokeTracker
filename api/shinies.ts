import type { VercelRequest, VercelResponse } from '@vercel/node';
import { authenticateRequest, setCorsHeaders, handleOptions } from './_lib/auth.js';
import { supabaseAdmin } from './_lib/supabase.js';

/**
 * API endpoint for managing user's shiny Pokemon
 * 
 * GET /api/shinies - Fetch all shiny Pokemon for authenticated user
 * POST /api/shinies - Add a shiny Pokemon
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
        .select('pokemon_id')
        .eq('user_id', userId);

    if (error) {
        console.error('Error fetching shinies:', error);
        return res.status(500).json({ error: 'Failed to fetch shiny Pokemon' });
    }

    const pokemonIds = data?.map(row => row.pokemon_id) || [];
    return res.status(200).json({ shinies: pokemonIds });
}

/**
 * POST /api/shinies
 * Add a shiny Pokemon for the authenticated user
 * Body: { pokemonId: string }
 */
async function handlePost(userId: string, req: VercelRequest, res: VercelResponse) {
    const { pokemonId } = req.body;

    if (!pokemonId || typeof pokemonId !== 'string') {
        return res.status(400).json({ error: 'Missing or invalid pokemonId' });
    }

    const { error } = await supabaseAdmin
        .from('shiny_pokemon')
        .insert({ user_id: userId, pokemon_id: pokemonId });

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
            const trainerId = prefs.trainer_id;

            // Enforce max 2 entries per user in the feed
            const { count } = await supabaseAdmin
                .from('community_feed')
                .select('id', { count: 'exact', head: true })
                .eq('user_id', userId);

            if ((count ?? 0) >= 2) {
                // Delete the oldest entry to stay within the cap
                const { data: oldest } = await supabaseAdmin
                    .from('community_feed')
                    .select('id')
                    .eq('user_id', userId)
                    .order('caught_at', { ascending: true })
                    .limit(1)
                    .maybeSingle();
                if (oldest) {
                    await supabaseAdmin.from('community_feed').delete().eq('id', oldest.id);
                }
            }
            // Always INSERT — new UUID so real-time and polling detect it as a new entry
            await supabaseAdmin
                .from('community_feed')
                .insert({ user_id: userId, trainer_id: trainerId, pokemon_id: pokemonId });
        }
    } catch (feedErr) {
        // Non-fatal: shiny was saved, feed update failed
        console.error('Community feed write error:', feedErr);
    }

    return res.status(201).json({ message: 'Shiny Pokemon added successfully' });
}

/**
 * DELETE /api/shinies
 * Remove a shiny Pokemon for the authenticated user
 * Body: { pokemonId: string }
 */
async function handleDelete(userId: string, req: VercelRequest, res: VercelResponse) {
    const { pokemonId } = req.body;

    if (!pokemonId || typeof pokemonId !== 'string') {
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

    return res.status(200).json({ message: 'Shiny Pokemon removed successfully' });
}
