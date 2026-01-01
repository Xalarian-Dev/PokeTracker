import type { VercelRequest, VercelResponse } from '@vercel/node';
import { authenticateRequest, setCorsHeaders, handleOptions } from './_lib/auth.js';
import { supabaseAdmin } from './_lib/supabase.js';

/**
 * API endpoint for deleting all user data (GDPR compliance)
 * 
 * DELETE /api/user-data - Delete all user data (shinies + preferences)
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Handle CORS preflight
    if (handleOptions(req, res)) return;
    setCorsHeaders(res);

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

        return res.status(200).json({
            message: 'All user data deleted successfully',
            deleted: {
                shinies: true,
                preferences: true,
            }
        });
    } catch (error) {
        console.error('API error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
