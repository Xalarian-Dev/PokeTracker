import type { VercelRequest, VercelResponse } from '@vercel/node';
import { authenticateRequest, setCorsHeaders, handleOptions } from './_lib/auth.js';
import { supabaseAdmin } from './_lib/supabase.js';

const TRAINER_ID_REGEX = /^[a-zA-Z0-9_-]{3,20}$/;

/**
 * GET /api/trainer-id?id=xxx  — Check availability (no auth)
 * POST /api/trainer-id         — Claim trainer ID (auth required, immutable once set)
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (handleOptions(req, res)) return;
    setCorsHeaders(req, res);

    try {
        if (req.method === 'GET') return await handleCheck(req, res);
        if (req.method === 'POST') return await handleSet(req, res);
        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('trainer-id error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

async function handleCheck(req: VercelRequest, res: VercelResponse) {
    const id = req.query.id as string;

    if (!id || !TRAINER_ID_REGEX.test(id)) {
        return res.status(400).json({ available: false, reason: 'invalid' });
    }

    const { data } = await supabaseAdmin
        .from('user_preferences')
        .select('trainer_id')
        .eq('trainer_id', id)
        .maybeSingle();

    return res.status(200).json({ available: !data });
}

async function handleSet(req: VercelRequest, res: VercelResponse) {
    const userId = await authenticateRequest(req, res);
    if (!userId) return;

    const { trainerId } = req.body;

    if (!trainerId || !TRAINER_ID_REGEX.test(trainerId)) {
        return res.status(400).json({ error: 'Invalid trainer ID. Use 3–20 characters: letters, numbers, - and _.' });
    }

    // Check the user doesn't already have a trainer ID (immutable)
    const { data: existing } = await supabaseAdmin
        .from('user_preferences')
        .select('trainer_id')
        .eq('user_id', userId)
        .maybeSingle();

    if (existing?.trainer_id) {
        return res.status(409).json({ error: 'Trainer ID already set and cannot be changed.' });
    }

    // Attempt to set — unique constraint handles race conditions
    const { error } = await supabaseAdmin
        .from('user_preferences')
        .upsert({
            user_id: userId,
            trainer_id: trainerId,
            updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

    if (error) {
        if (error.code === '23505') {
            return res.status(409).json({ error: 'Trainer ID already taken.' });
        }
        console.error('Error setting trainer ID:', error);
        return res.status(500).json({ error: 'Failed to set trainer ID.' });
    }

    return res.status(200).json({ message: 'Trainer ID set successfully.', trainerId });
}
