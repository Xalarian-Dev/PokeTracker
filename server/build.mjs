// Construit le serveur Docker : un seul fichier (dist-server/server.mjs).
// Les fonctions `api/*` importent './_lib/supabase.js' : ici cet import est redirigé vers
// server/pg-shim.ts (Postgres ordinaire) ; sur Vercel, il reste le vrai client Supabase.
import { build } from 'esbuild';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');

await build({
    entryPoints: [path.join(root, 'server/index.ts')],
    outfile: path.join(root, 'dist-server/server.mjs'),
    bundle: true,
    platform: 'node',
    format: 'esm',
    target: 'node22',
    minify: false,
    sourcemap: false,
    // pg-native est une option facultative de pg (non installée)
    external: ['pg-native'],
    banner: { js: "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);" },
    plugins: [
        {
            name: 'supabase-vers-postgres',
            setup(b) {
                b.onResolve({ filter: /(^|\/)_lib\/supabase\.js$/ }, () => ({
                    path: path.join(root, 'server/pg-shim.ts'),
                }));
            },
        },
    ],
    logLevel: 'info',
});
