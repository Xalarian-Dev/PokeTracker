import { verifyToken } from '@clerk/backend';
import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Extract and verify Clerk JWT token from Authorization header
 * Returns the userId if valid, or sends error response and returns null
 */
export async function authenticateRequest(
    req: VercelRequest,
    res: VercelResponse
): Promise<string | null> {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Missing or invalid authorization header' });
            return null;
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify the Clerk JWT token
        const payload = await verifyToken(token, {
            secretKey: process.env.CLERK_SECRET_KEY,
        });

        if (!payload.sub) {
            res.status(401).json({ error: 'Invalid token: missing user ID' });
            return null;
        }

        return payload.sub;
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(401).json({ error: 'Authentication failed' });
        return null;
    }
}

const ALLOWED_ORIGINS = [
    'https://pokemonshinytracker.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000',
];

/**
 * Set CORS headers for API responses
 */
export function setCorsHeaders(req: VercelRequest, res: VercelResponse) {
    const origin = req.headers.origin;
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );
}

/**
 * Handle OPTIONS preflight requests
 */
export function handleOptions(req: VercelRequest, res: VercelResponse): boolean {
    if (req.method === 'OPTIONS') {
        setCorsHeaders(req, res);
        res.status(200).end();
        return true;
    }
    return false;
}
