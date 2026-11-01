// Serveur de l'image Docker : sert le site (dossier dist) et exécute les fonctions `api/*`
// (écrites pour Vercel) avec la même signature (req, res). Aucune dépendance de serveur web.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { pool } from './pg-shim';

import shinies from '../api/shinies';
import preferences from '../api/preferences';
import pokemonForms from '../api/pokemon-forms';
import trainerId from '../api/trainer-id';
import userData from '../api/user-data';
import publicFeed from '../api/public/feed';
import publicProfile from '../api/public/[trainerId]';

type Handler = (req: any, res: any) => unknown | Promise<unknown>;

const STATIC_DIR = path.resolve(process.env.STATIC_DIR || 'dist');
const PORT = Number(process.env.PORT || 3000);
const MAX_BODY = 1024 * 1024; // 1 Mo : largement assez pour ces API

const ROUTES: Record<string, Handler> = {
    '/api/shinies': shinies,
    '/api/preferences': preferences,
    '/api/pokemon-forms': pokemonForms,
    '/api/trainer-id': trainerId,
    '/api/user-data': userData,
    '/api/public/feed': publicFeed,
};

/** Pages de l'application (React Router) : toute autre adresse sans extension répond 404 */
const APP_ROUTES = new Set(['/', '/collection', '/stats', '/communaute', '/chasse', '/profile']);
const isAppRoute = (pathname: string) => {
    const p = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
    return APP_ROUTES.has(p) || /^\/u\/[^/]+$/.test(p); // /u/<identifiant de dresseur>
};

const MIME: Record<string, string> = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
    '.woff2': 'font/woff2',
    '.woff': 'font/woff',
    '.txt': 'text/plain; charset=utf-8',
    '.xml': 'application/xml; charset=utf-8',
    '.webmanifest': 'application/manifest+json',
};

/** Donne à la réponse Node les méthodes de VercelResponse utilisées par les fonctions */
function decorate(res: http.ServerResponse): any {
    const r = res as any;
    r.status = (code: number) => { res.statusCode = code; return r; };
    r.json = (body: unknown) => {
        if (!res.headersSent) res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify(body));
        return r;
    };
    r.send = (body: unknown) => {
        if (typeof body === 'object' && body !== null && !Buffer.isBuffer(body)) return r.json(body);
        res.end(body as any);
        return r;
    };
    return r;
}

function readBody(req: http.IncomingMessage): Promise<unknown> {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        let size = 0;
        req.on('data', (chunk: Buffer) => {
            size += chunk.length;
            if (size > MAX_BODY) { reject(new Error('Body too large')); req.destroy(); return; }
            chunks.push(chunk);
        });
        req.on('end', () => {
            const raw = Buffer.concat(chunks).toString('utf8');
            if (!raw) return resolve(undefined);
            try { resolve(JSON.parse(raw)); } catch { resolve(undefined); }
        });
        req.on('error', reject);
    });
}

async function handleApi(req: http.IncomingMessage, res: http.ServerResponse, url: URL) {
    const r = decorate(res);
    let handler: Handler | undefined = ROUTES[url.pathname];
    const query: Record<string, string> = Object.fromEntries(url.searchParams.entries());

    // /api/public/<identifiant de dresseur>
    const match = /^\/api\/public\/([^/]+)$/.exec(url.pathname);
    if (!handler && match && match[1] !== 'feed') {
        handler = publicProfile;
        query.trainerId = decodeURIComponent(match[1]);
    }

    if (!handler) return r.status(404).json({ error: 'Not found' });

    const anyReq = req as any;
    anyReq.query = query;
    anyReq.body = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method || '') ? await readBody(req).catch(() => undefined) : undefined;

    try {
        await handler(anyReq, r);
    } catch (error) {
        console.error('API error:', error);
        if (!res.headersSent) r.status(500).json({ error: 'Internal server error' });
        else res.end();
    }
}

function serveStatic(req: http.IncomingMessage, res: http.ServerResponse, url: URL) {
    let file = path.join(STATIC_DIR, path.normalize(decodeURIComponent(url.pathname)));
    // pas de sortie du dossier statique
    if (!file.startsWith(STATIC_DIR)) { res.statusCode = 403; return res.end('Forbidden'); }
    let stat = fs.existsSync(file) ? fs.statSync(file) : null;
    if (stat?.isDirectory()) { file = path.join(file, 'index.html'); stat = fs.existsSync(file) ? fs.statSync(file) : null; }
    // adresse du site (React Router) : on renvoie l'application ; pour une adresse qui n'existe pas,
    // le statut est 404 (l'application affiche sa page « introuvable ») et non un faux 200
    if (!stat && !path.extname(url.pathname)) {
        file = path.join(STATIC_DIR, 'index.html'); stat = fs.existsSync(file) ? fs.statSync(file) : null;
        if (!isAppRoute(url.pathname)) res.statusCode = 404;
    }
    if (!stat) { res.statusCode = 404; return res.end('Not found'); }

    const ext = path.extname(file).toLowerCase();
    res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
    // fichiers de /assets : nom avec empreinte, cache longue durée ; le reste (index.html) toujours revalidé
    res.setHeader('Cache-Control', file.includes(`${path.sep}assets${path.sep}`) ? 'public, max-age=31536000, immutable' : 'no-cache');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(file).pipe(res);
}

const server = http.createServer(async (req, res) => {
    try {
        const url = new URL(req.url || '/', 'http://localhost');
        if (url.pathname === '/healthz') {
            try {
                await pool.query('select 1');
                res.setHeader('Content-Type', 'application/json');
                return res.end('{"status":"ok"}');
            } catch {
                res.statusCode = 503;
                return res.end('{"status":"database unavailable"}');
            }
        }
        if (url.pathname.startsWith('/api/')) return await handleApi(req, res, url);
        return serveStatic(req, res, url);
    } catch (error) {
        console.error('Server error:', error);
        if (!res.headersSent) res.statusCode = 500;
        res.end('Internal server error');
    }
});

server.listen(PORT, () => console.log(`PokeTracker : http://0.0.0.0:${PORT} (fichiers : ${STATIC_DIR})`));

for (const signal of ['SIGTERM', 'SIGINT'] as const) {
    process.on(signal, () => {
        server.close(() => pool.end().finally(() => process.exit(0)));
    });
}
