import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders, handleOptions } from '../_lib/auth.js';
import { supabaseAdmin } from '../_lib/supabase.js';

/**
 * GET /api/public/:trainerId  — Public profile data, no auth required
 * Returns: { trainer_id, display_name, shiny_count, shinies, favourite_forms }
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (handleOptions(req, res)) return;
    setCorsHeaders(req, res);

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const trainerId = req.query.trainerId as string;

    if (!trainerId) {
        return res.status(400).json({ error: 'Missing trainer ID' });
    }

    try {
        // Resolve trainer_id → user_id + display_name
        const { data: prefs, error: prefsError } = await supabaseAdmin
            .from('user_preferences')
            .select('user_id, display_name, trainer_id')
            .eq('trainer_id', trainerId)
            .maybeSingle();

        if (prefsError) {
            console.error('Error fetching profile:', prefsError);
            return res.status(500).json({ error: 'Internal server error' });
        }

        if (!prefs) {
            return res.status(404).json({ error: 'Trainer not found' });
        }

        const userId = prefs.user_id;

        // Fetch shinies
        const { data: shiniesData, error: shiniesError } = await supabaseAdmin
            .from('shiny_pokemon')
            .select('pokemon_id')
            .eq('user_id', userId);

        if (shiniesError) {
            console.error('Error fetching shinies:', shiniesError);
            return res.status(500).json({ error: 'Internal server error' });
        }

        // Fetch favourite forms
        const { data: formsData, error: formsError } = await supabaseAdmin
            .from('pokemon_forms')
            .select('pokemon_id, form_id')
            .eq('user_id', userId)
            .eq('is_favorite', true);

        if (formsError) {
            console.error('Error fetching forms:', formsError);
            return res.status(500).json({ error: 'Internal server error' });
        }

        const shinies = (shiniesData || []).map(row => row.pokemon_id);
        const favouriteForms: Record<string, string> = {};
        (formsData || []).forEach(row => {
            favouriteForms[row.pokemon_id] = row.form_id;
        });

        // Cache for 60 seconds at CDN level
        res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');

        return res.status(200).json({
            trainer_id: prefs.trainer_id,
            display_name: prefs.display_name || prefs.trainer_id,
            shiny_count: shinies.length,
            shinies,
            favourite_forms: favouriteForms,
        });
    } catch (error) {
        console.error('Public profile error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
