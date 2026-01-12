import type { VercelRequest, VercelResponse } from '@vercel/node';
import { authenticateRequest, setCorsHeaders, handleOptions } from './_lib/auth.js';
import { supabaseAdmin } from './_lib/supabase.js';

/**
 * API endpoint for managing Pokemon forms (shiny status + favorite form)
 * 
 * GET /api/pokemon-forms - Fetch all forms data for authenticated user
 * POST /api/pokemon-forms - Toggle shiny or set favorite form
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
            case 'POST':
                return await handlePost(userId, req, res);
            default:
                return res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('API error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

/**
 * GET /api/pokemon-forms
 * Fetch all Pokemon forms for the authenticated user
 */
async function handleGet(userId: string, res: VercelResponse) {
    const { data, error } = await supabaseAdmin
        .from('pokemon_forms')
        .select('*')
        .eq('user_id', userId);

    if (error) {
        console.error('Error fetching pokemon forms:', error);
        return res.status(500).json({ error: 'Failed to fetch pokemon forms' });
    }

    // Transform data for frontend
    const shinyForms: Record<string, string[]> = {};
    const favoriteForms: Record<string, string> = {};

    data?.forEach((form) => {
        // Add to shiny forms
        if (form.is_shiny) {
            if (!shinyForms[form.pokemon_id]) {
                shinyForms[form.pokemon_id] = [];
            }
            shinyForms[form.pokemon_id].push(form.form_id);
        }

        // Add to favorite forms
        if (form.is_favorite) {
            favoriteForms[form.pokemon_id] = form.form_id;
        }
    });

    return res.status(200).json({ shinyForms, favoriteForms });
}

/**
 * POST /api/pokemon-forms
 * Toggle shiny status or set favorite form
 * Body: { action: 'toggle-shiny' | 'set-favorite', pokemonId: string, formId: string, isShiny?: boolean }
 */
async function handlePost(userId: string, req: VercelRequest, res: VercelResponse) {
    const { action, pokemonId, formId, isShiny } = req.body;

    if (!action || !pokemonId || !formId) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    if (action === 'toggle-shiny') {
        return await handleToggleShiny(userId, pokemonId, formId, isShiny, res);
    }

    if (action === 'set-favorite') {
        return await handleSetFavorite(userId, pokemonId, formId, res);
    }

    return res.status(400).json({ error: 'Invalid action' });
}

/**
 * Toggle shiny status for a Pokemon form
 */
async function handleToggleShiny(
    userId: string,
    pokemonId: string,
    formId: string,
    isShiny: boolean,
    res: VercelResponse
) {
    // Check if form exists
    const { data: existingForm } = await supabaseAdmin
        .from('pokemon_forms')
        .select('*')
        .eq('user_id', userId)
        .eq('pokemon_id', pokemonId)
        .eq('form_id', formId)
        .single();

    if (existingForm) {
        // Form exists
        if (isShiny) {
            // Update to shiny
            const { error } = await supabaseAdmin
                .from('pokemon_forms')
                .update({ is_shiny: true, updated_at: new Date().toISOString() })
                .eq('user_id', userId)
                .eq('pokemon_id', pokemonId)
                .eq('form_id', formId);

            if (error) {
                console.error('Error updating pokemon form:', error);
                return res.status(500).json({ error: 'Failed to update pokemon form' });
            }
        } else {
            // If not shiny and not favorite, delete the row
            if (!existingForm.is_favorite) {
                const { error } = await supabaseAdmin
                    .from('pokemon_forms')
                    .delete()
                    .eq('user_id', userId)
                    .eq('pokemon_id', pokemonId)
                    .eq('form_id', formId);

                if (error) {
                    console.error('Error deleting pokemon form:', error);
                    return res.status(500).json({ error: 'Failed to delete pokemon form' });
                }
            } else {
                // Just update is_shiny to false
                const { error } = await supabaseAdmin
                    .from('pokemon_forms')
                    .update({ is_shiny: false, updated_at: new Date().toISOString() })
                    .eq('user_id', userId)
                    .eq('pokemon_id', pokemonId)
                    .eq('form_id', formId);

                if (error) {
                    console.error('Error updating pokemon form:', error);
                    return res.status(500).json({ error: 'Failed to update pokemon form' });
                }
            }
        }
    } else {
        // Form doesn't exist, create if shiny
        if (isShiny) {
            const { error } = await supabaseAdmin
                .from('pokemon_forms')
                .insert({
                    user_id: userId,
                    pokemon_id: pokemonId,
                    form_id: formId,
                    is_shiny: true,
                    is_favorite: false
                });

            if (error) {
                console.error('Error inserting pokemon form:', error);
                return res.status(500).json({ error: 'Failed to insert pokemon form' });
            }
        }
    }

    return res.status(200).json({ success: true });
}

/**
 * Set favorite form for a Pokemon
 */
async function handleSetFavorite(
    userId: string,
    pokemonId: string,
    formId: string,
    res: VercelResponse
) {
    // First, remove favorite from all other forms of this Pokemon
    const { error: updateError } = await supabaseAdmin
        .from('pokemon_forms')
        .update({ is_favorite: false, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('pokemon_id', pokemonId);

    if (updateError) {
        console.error('Error updating favorite forms:', updateError);
        return res.status(500).json({ error: 'Failed to update favorite forms' });
    }

    // Check if form exists
    const { data: existingForm } = await supabaseAdmin
        .from('pokemon_forms')
        .select('*')
        .eq('user_id', userId)
        .eq('pokemon_id', pokemonId)
        .eq('form_id', formId)
        .single();

    if (existingForm) {
        // Update existing form
        const { error } = await supabaseAdmin
            .from('pokemon_forms')
            .update({ is_favorite: true, updated_at: new Date().toISOString() })
            .eq('user_id', userId)
            .eq('pokemon_id', pokemonId)
            .eq('form_id', formId);

        if (error) {
            console.error('Error setting favorite form:', error);
            return res.status(500).json({ error: 'Failed to set favorite form' });
        }
    } else {
        // Create new entry
        const { error } = await supabaseAdmin
            .from('pokemon_forms')
            .insert({
                user_id: userId,
                pokemon_id: pokemonId,
                form_id: formId,
                is_shiny: false,
                is_favorite: true
            });

        if (error) {
            console.error('Error inserting favorite form:', error);
            return res.status(500).json({ error: 'Failed to insert favorite form' });
        }
    }

    return res.status(200).json({ success: true });
}
