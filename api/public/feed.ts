import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders, handleOptions } from '../_lib/auth.js';
import { supabaseAdmin } from '../_lib/supabase.js';

/**
 * GET /api/public/feed
 * Returns the 20 most recent entries from community_feed.
 * No auth required.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (handleOptions(req, res)) return;
    setCorsHeaders(req, res);

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('community_feed')
            .select('id, pokemon_id, caught_at, trainer_id')
            .order('caught_at', { ascending: false })
            .limit(20);

        if (error) {
            console.error('Feed error:', error);
            return res.status(500).json({ error: 'Failed to fetch feed' });
        }

        const feed = (data || []).map((row: any) => ({
            id: row.id,
            pokemon_id: row.pokemon_id,
            caught_at: row.caught_at,
            trainer_id: row.trainer_id,
            display_name: row.trainer_id,
        }));

        res.setHeader('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=30');
        return res.status(200).json({ feed });
    } catch (error) {
        console.error('Feed error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
