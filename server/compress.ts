// Compression (brotli ou gzip) des fichiers texte du site : HTML, JavaScript, CSS, JSON, SVG, XML.
// Le résultat est gardé en mémoire (quelques fichiers seulement) et recalculé si le fichier change.
import fs from 'node:fs';
import zlib from 'node:zlib';
import { promisify } from 'node:util';
import type http from 'node:http';

const brotli = promisify(zlib.brotliCompress);
const gzip = promisify(zlib.gzip);

const COMPRESSIBLE = /^(text\/|application\/(javascript|json|xml|manifest\+json)|image\/svg\+xml)/;
const MIN_BYTES = 1024;

type Encoding = 'br' | 'gzip';
const cache = new Map<string, Buffer>();

function pickEncoding(req: http.IncomingMessage): Encoding | null {
    const accepted = String(req.headers['accept-encoding'] || '');
    if (/\bbr\b/.test(accepted)) return 'br';
    if (/\bgzip\b/.test(accepted)) return 'gzip';
    return null;
}

/**
 * Envoie un fichier compressé si le type s'y prête et si le navigateur l'accepte.
 * Renvoie false quand le fichier doit être envoyé tel quel (l'appelant s'en charge).
 */
export async function sendCompressed(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    file: string,
    mtimeMs: number,
    size: number,
    contentType: string,
): Promise<boolean> {
    if (!COMPRESSIBLE.test(contentType) || size < MIN_BYTES) return false;
    res.setHeader('Vary', 'Accept-Encoding');
    const encoding = pickEncoding(req);
    if (!encoding) return false;

    const key = `${encoding}:${file}:${mtimeMs}:${size}`;
    let body = cache.get(key);
    if (!body) {
        const raw = await fs.promises.readFile(file);
        body = encoding === 'br'
            ? await brotli(raw, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 5 } })
            : await gzip(raw, { level: 9 });
        // on ne garde que la version courante de chaque fichier
        for (const k of cache.keys()) if (k.includes(`:${file}:`)) cache.delete(k);
        cache.set(key, body);
    }
    res.setHeader('Content-Encoding', encoding);
    res.setHeader('Content-Length', body.length);
    if (req.method === 'HEAD') res.end(); else res.end(body);
    return true;
}
