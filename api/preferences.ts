import type { VercelRequest, VercelResponse } from '@vercel/node';
import { authenticateRequest, setCorsHeaders, handleOptions } from './_lib/auth.js';
import { supabaseAdmin } from './_lib/supabase.js';

/**
 * API endpoint for managing user preferences
 * 
 * GET /api/preferences - Fetch user preferences
 * PUT /api/preferences - Update user preferences
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Handle CORS preflight
    if (handleOptions(req, res)) return;
    setCorsHeaders(res);

    // Authenticate user
    const userId = await authenticateRequest(req, res);
    if (!userId) return; // Response already sent by authenticateRequest

    try {
        switch (req.method) {
            case 'GET':
                return await handleGet(userId, res);
            case 'PUT':
                return await handlePut(userId, req, res);
            default:
                return res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('API error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

/**
 * GET /api/preferences
 * Fetch user preferences
 */
async function handleGet(userId: string, res: VercelResponse) {
    const { data, error } = await supabaseAdmin
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error) {
        // No preferences found - return null
        if (error.code === 'PGRST116') {
            return res.status(200).json({ preferences: null });
        }
        console.error('Error fetching preferences:', error);
        return res.status(500).json({ error: 'Failed to fetch preferences' });
    }

    return res.status(200).json({ preferences: data });
}

/**
 * PUT /api/preferences
 * Update user preferences (upsert)
 * Body: { language: string, ownedGames: string[], displayName?: string }
 */
async function handlePut(userId: string, req: VercelRequest, res: VercelResponse) {
    const { language, ownedGames, displayName } = req.body;

    // Validate input
    if (!language || !['fr', 'en', 'jp'].includes(language)) {
        return res.status(400).json({ error: 'Invalid language' });
    }

    if (!Array.isArray(ownedGames)) {
        return res.status(400).json({ error: 'ownedGames must be an array' });
    }

    const { error } = await supabaseAdmin
        .from('user_preferences')
        .upsert({
            user_id: userId,
            preferred_language: language,
            owned_games: ownedGames,
            display_name: displayName || null,
            updated_at: new Date().toISOString(),
        }, {
            onConflict: 'user_id',
        });

    if (error) {
        console.error('Error saving preferences:', error);
        return res.status(500).json({ error: 'Failed to save preferences' });
    }

    return res.status(200).json({ message: 'Preferences saved successfully' });
}
