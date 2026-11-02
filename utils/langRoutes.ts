// Adresses du site par langue : /fr/…, /en/…, /es/…, /jp/…
// Module partagé entre l'application (navigateur) et le serveur : aucune dépendance au navigateur.

export const LANGS = ['fr', 'en', 'es', 'jp'] as const;
export type Language = (typeof LANGS)[number];

/** Langue par défaut : visiteur sans préférence connue (et robots) */
export const DEFAULT_LANG: Language = 'en';

/** Nom du cookie qui mémorise la langue choisie (lu par le serveur sur « / » et les anciennes adresses) */
export const LANG_COOKIE = 'shinyTrackerLang';

/** Codes de langue HTML (attribut lang) et locales Open Graph */
export const HTML_LANG: Record<Language, string> = { fr: 'fr', en: 'en', es: 'es', jp: 'ja' };
export const OG_LOCALE: Record<Language, string> = { fr: 'fr_FR', en: 'en_US', es: 'es_ES', jp: 'ja_JP' };

/** Adresse officielle du site (domaine sans www) */
export const SITE_URL = 'https://pokemonshinytracker.com';

/** Pages indexables (le premier élément, '', est l'accueil) */
export const PUBLIC_PAGES = ['', 'collection', 'stats', 'communaute', 'chasse', 'privacy', 'terms'] as const;
/** Pages privées ou sans intérêt pour la recherche, servies elles aussi sous /<langue>/ */
export const OTHER_PAGES = ['profile'] as const;

export const isLanguage = (value: unknown): value is Language =>
    typeof value === 'string' && (LANGS as readonly string[]).includes(value);

/** Retire les « / » finaux (sauf pour la racine) */
export const trimSlashes = (pathname: string) => (pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname);

/** Sépare « /fr/collection » en { lang: 'fr', rest: 'collection' }. Sans préfixe de langue : lang est null. */
export function splitLangPath(pathname: string): { lang: Language | null; rest: string } {
    const clean = trimSlashes(pathname).replace(/^\/+/, '');
    const [first, ...others] = clean.split('/');
    if (isLanguage(first)) return { lang: first, rest: others.join('/') };
    return { lang: null, rest: clean };
}

/**
 * Adresse d'une page dans une langue : localePath('fr', 'collection') → /fr/collection ;
 * l'accueil garde une barre finale (/fr/). Accepte un chemin avec ou sans « / » initial.
 */
export function localePath(lang: Language, rest = ''): string {
    const clean = rest.replace(/^\/+/, '').replace(/\/+$/, '');
    return clean ? `/${lang}/${clean}` : `/${lang}/`;
}

/** Page connue de l'application ? (sert au statut 404 du serveur et à « noindex ») */
export function isKnownPage(rest: string): boolean {
    return (PUBLIC_PAGES as readonly string[]).includes(rest)
        || (OTHER_PAGES as readonly string[]).includes(rest)
        || /^u\/[^/]+$/.test(rest); // profil public : u/<identifiant de dresseur>
}

/** Choisit une langue à partir de l'en-tête Accept-Language (« fr-FR,fr;q=0.9,en;q=0.8 ») */
export function languageFromAcceptHeader(header: string | undefined | null): Language {
    if (!header) return DEFAULT_LANG;
    const entries = header.split(',').map((part, index) => {
        const [tag, ...params] = part.trim().split(';');
        const q = params.map(p => p.trim()).find(p => p.startsWith('q='));
        return { tag: tag.toLowerCase(), q: q ? Number(q.slice(2)) : 1, index };
    }).filter(e => e.tag && !Number.isNaN(e.q) && e.q > 0)
      .sort((a, b) => b.q - a.q || a.index - b.index);
    for (const { tag } of entries) {
        if (tag.startsWith('fr')) return 'fr';
        if (tag.startsWith('ja')) return 'jp';
        if (tag.startsWith('es')) return 'es';
        if (tag.startsWith('en')) return 'en';
    }
    return DEFAULT_LANG;
}

/** Lit la langue mémorisée dans l'en-tête Cookie */
export function languageFromCookie(cookieHeader: string | undefined | null): Language | null {
    if (!cookieHeader) return null;
    for (const part of cookieHeader.split(';')) {
        const [name, value] = part.trim().split('=');
        if (name === LANG_COOKIE && isLanguage(value)) return value;
    }
    return null;
}
