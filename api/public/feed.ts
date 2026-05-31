import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders, handleOptions } from '../_lib/auth.js';
import { supabaseAdmin } from '../_lib/supabase.js';

/**
 * GET /api/public/feed
 * Returns the 20 most recent shiny captures from users with a trainer_id.
 * No auth required.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (handleOptions(req, res)) return;
    setCorsHeaders(req, res);

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Fetch more rows than needed so we can deduplicate per user
        const { data, error } = await supabaseAdmin
            .from('shiny_pokemon')
            .select(`
                id,
                pokemon_id,
                caught_at,
                user_preferences!inner (
                    trainer_id,
                    display_name
                )
            `)
            .not('user_preferences.trainer_id', 'is', null)
            .order('caught_at', { ascending: false })
            .limit(200);

        if (error) {
            console.error('Feed error:', error);
            return res.status(500).json({ error: 'Failed to fetch feed' });
        }

        // Allow at most MAX_PER_USER entries per trainer in the feed
        const MAX_PER_USER = 2;
        const FEED_SIZE = 20;
        const countPerUser = new Map<string, number>();

        const feed = (data || [])
            .reduce((acc: any[], row: any) => {
                const trainerId = row.user_preferences.trainer_id;
                const count = countPerUser.get(trainerId) ?? 0;
                if (count >= MAX_PER_USER) return acc;
                countPerUser.set(trainerId, count + 1);
                acc.push({
                    id: row.id,
                    pokemon_id: row.pokemon_id,
                    caught_at: row.caught_at,
                    trainer_id: trainerId,
                    display_name: row.user_preferences.display_name || trainerId,
                });
                return acc;
            }, [])
            .slice(0, FEED_SIZE);

        res.setHeader('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=30');
        return res.status(200).json({ feed });
    } catch (error) {
        console.error('Feed error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
