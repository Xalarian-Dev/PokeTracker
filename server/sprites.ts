// Sprites des Pokémon servis par notre propre serveur : /sprites/<numéro>.png et /sprites/shiny/<numéro>.png.
// Au premier accès, le sprite est téléchargé depuis le dépôt PokeAPI puis conservé sur disque (volume Docker) :
// les visiteurs ne dépendent plus de GitHub (pas un CDN, débit limité) et profitent d'un cache long.
import fs from 'node:fs';
import path from 'node:path';
import type http from 'node:http';

const UPSTREAM = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/';
const CACHE_DIR = path.resolve(process.env.SPRITES_DIR || 'cache/sprites');
const MAX_BYTES = 2 * 1024 * 1024; // un sprite fait quelques dizaines de Ko
const TIMEOUT_MS = 10_000;

// Seuls les chemins « [shiny/]<numéro ou numéro-forme>.png » sont acceptés (rien d'autre n'atteint le disque)
const SPRITE_PATH = /^\/sprites\/(shiny\/)?(\d{1,5}(?:-[a-z0-9-]{1,40})?)\.png$/;

// Numéros acceptés : Pokédex national (1 à 1025) et formes régionales/alternatives de HOME (10001 et plus, avec marge)
const MAX_DEX_ID = 1025;
const FORM_ID_MIN = 10001;
const FORM_ID_MAX = 10400;

function isPlausibleSprite(idPart: string): boolean {
    const n = Number.parseInt(idPart, 10);
    return (n >= 1 && n <= MAX_DEX_ID) || (n >= FORM_ID_MIN && n <= FORM_ID_MAX);
}

// Mémoire des échecs : une image introuvable ne rappelle pas GitHub pendant ce délai
const MISS_TTL_MS = 5 * 60_000;
const MISS_MAX_ENTRIES = 5000;
const misses = new Map<string, number>();

function recentlyMissed(relative: string): boolean {
    const until = misses.get(relative);
    if (until === undefined) return false;
    if (until > Date.now()) return true;
    misses.delete(relative);
    return false;
}

function rememberMiss(relative: string): void {
    if (misses.size >= MISS_MAX_ENTRIES) {
        // borne mémoire : on retire d'abord les échecs expirés, sinon le plus ancien
        const now = Date.now();
        for (const [key, until] of misses) if (until <= now) misses.delete(key);
        if (misses.size >= MISS_MAX_ENTRIES) misses.delete(misses.keys().next().value as string);
    }
    misses.set(relative, Date.now() + MISS_TTL_MS);
}

const inflight = new Map<string, Promise<boolean>>();

async function download(relative: string, target: string): Promise<boolean> {
    try {
        const response = await fetch(UPSTREAM + relative, { signal: AbortSignal.timeout(TIMEOUT_MS) });
        if (!response.ok || !(response.headers.get('content-type') || '').startsWith('image/')) return false;
        const data = Buffer.from(await response.arrayBuffer());
        if (data.length === 0 || data.length > MAX_BYTES) return false;
        await fs.promises.mkdir(path.dirname(target), { recursive: true });
        const tmp = `${target}.${process.pid}.${Date.now()}.tmp`;
        await fs.promises.writeFile(tmp, data);
        await fs.promises.rename(tmp, target); // écriture atomique
        return true;
    } catch (error) {
        console.error('Sprite : téléchargement impossible', relative, (error as Error).message);
        return false;
    }
}

/** Renvoie true si la requête a été traitée (adresse /sprites/…) */
export async function serveSprite(req: http.IncomingMessage, res: http.ServerResponse, pathname: string): Promise<boolean> {
    if (!pathname.startsWith('/sprites/')) return false;
    const match = SPRITE_PATH.exec(pathname);
    if (!match || !isPlausibleSprite(match[2]) || (req.method !== 'GET' && req.method !== 'HEAD')) {
        res.statusCode = 404;
        res.end('Not found');
        return true;
    }
    const relative = pathname.slice('/sprites/'.length);
    const target = path.join(CACHE_DIR, relative);

    if (!fs.existsSync(target)) {
        if (recentlyMissed(relative)) {
            res.statusCode = 404;
            res.setHeader('Cache-Control', 'no-store');
            res.end('Not found');
            return true;
        }
        let pending = inflight.get(relative);
        if (!pending) {
            pending = download(relative, target).finally(() => inflight.delete(relative));
            inflight.set(relative, pending);
        }
        if (!(await pending)) {
            rememberMiss(relative);
            res.statusCode = 404;
            res.setHeader('Cache-Control', 'no-store');
            res.end('Not found');
            return true;
        }
    }

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=2592000'); // 30 jours
    res.setHeader('X-Content-Type-Options', 'nosniff');
    if (req.method === 'HEAD') { res.end(); return true; }
    fs.createReadStream(target).pipe(res);
    return true;
}
