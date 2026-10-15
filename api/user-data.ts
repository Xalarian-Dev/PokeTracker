import type { VercelRequest, VercelResponse } from '@vercel/node';
import { authenticateRequest, setCorsHeaders, handleOptions } from './_lib/auth.js';
import { supabaseAdmin } from './_lib/supabase.js';

/**
 * API endpoint for deleting all user data (GDPR compliance)
 * 
 * DELETE /api/user-data - Delete all user data (shinies + preferences + forms + community feed)
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Handle CORS preflight
    if (handleOptions(req, res)) return;
    setCorsHeaders(req, res);

    // Authenticate user
    const userId = await authenticateRequest(req, res);
    if (!userId) return; // Response already sent by authenticateRequest

    if (req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Delete shiny pokemon
        const { error: shinyError } = await supabaseAdmin
            .from('shiny_pokemon')
            .delete()
            .eq('user_id', userId);

        if (shinyError) {
            console.error('Error deleting shiny pokemon:', shinyError);
            return res.status(500).json({ error: 'Failed to delete shiny Pokemon data' });
        }

        // Delete user preferences
        const { error: prefsError } = await supabaseAdmin
            .from('user_preferences')
            .delete()
            .eq('user_id', userId);

        if (prefsError) {
            console.error('Error deleting user preferences:', prefsError);
            return res.status(500).json({ error: 'Failed to delete user preferences' });
        }

        // Delete saved Pokemon forms (shiny form, favorite form)
        const { error: formsError } = await supabaseAdmin
            .from('pokemon_forms')
            .delete()
            .eq('user_id', userId);

        if (formsError) {
            console.error('Error deleting pokemon forms:', formsError);
            return res.status(500).json({ error: 'Failed to delete Pokemon forms data' });
        }

        // Delete the user's entries in the public community feed
        const { error: feedError } = await supabaseAdmin
            .from('community_feed')
            .delete()
            .eq('user_id', userId);

        if (feedError) {
            console.error('Error deleting community feed entries:', feedError);
            return res.status(500).json({ error: 'Failed to delete community feed data' });
        }

        return res.status(200).json({
            message: 'All user data deleted successfully',
            deleted: {
                shinies: true,
                preferences: true,
                forms: true,
                communityFeed: true,
            }
        });
    } catch (error) {
        console.error('API error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
