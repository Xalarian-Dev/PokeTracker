// Pages HTML par langue : le serveur écrit, pour chaque page et chaque langue, le titre, la description,
// l'adresse canonique, les versions hreflang, les aperçus de partage et un contenu texte visible
// sans JavaScript (que React remplace au chargement). Les robots qui n'exécutent pas le JavaScript
// (aperçus Discord/X, robots d'IA) lisent donc la bonne langue et un vrai contenu.
import fs from 'node:fs';
import path from 'node:path';
import { ui as frUi } from '../i18n/fr';
import { ui as enUi } from '../i18n/en';
import { ui as esUi } from '../i18n/es';
import { ui as jpUi } from '../i18n/jp';
import {
    HTML_LANG, LANGS, OG_LOCALE, SITE_URL, localePath,
    type Language,
} from '../utils/langRoutes';
import { LEGAL_SECTIONS, LEGAL_UPDATED, SEO_PAGES, isLegalPage, legalSeo } from '../utils/seoPages';
import { getGdprTranslations } from '../i18n/gdpr-index';

const UI: Record<Language, Record<string, unknown>> = {
    fr: frUi as Record<string, unknown>,
    en: enUi as Record<string, unknown>,
    es: esUi as Record<string, unknown>,
    jp: jpUi as Record<string, unknown>,
};

/** Texte traduit (repli sur l'anglais, puis sur la clé), comme la fonction t() de l'application */
function tr(lang: Language, key: string): string {
    const value = UI[lang][key];
    if (typeof value === 'string' && value) return value;
    const fallback = UI.en[key];
    return typeof fallback === 'string' && fallback ? fallback : key;
}

const escapeHtml = (text: string) =>
    text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const OG_IMAGE = `${SITE_URL}/og-image.jpg`;

// ---------------------------------------------------------------------------------------------
// Modèle HTML : le index.html construit par Vite, relu si le fichier change

let template: { mtimeMs: number; html: string } | null = null;

function readTemplate(staticDir: string): string | null {
    const file = path.join(staticDir, 'index.html');
    if (!fs.existsSync(file)) return null;
    const { mtimeMs } = fs.statSync(file);
    if (!template || template.mtimeMs !== mtimeMs) {
        template = { mtimeMs, html: fs.readFileSync(file, 'utf8') };
    }
    return template.html;
}

// ---------------------------------------------------------------------------------------------
// Balises <head>

interface PageMeta {
    title: string;
    description: string;
    ogTitle: string;
    ogDescription: string;
    twitterDescription: string;
    noindex: boolean;
}

function pageMeta(lang: Language, rest: string, notFound: boolean): PageMeta {
    if (notFound) {
        const title = tr(lang, 'not_found_title');
        return { title, description: tr(lang, 'not_found_text'), ogTitle: title, ogDescription: tr(lang, 'not_found_text'), twitterDescription: tr(lang, 'not_found_text'), noindex: true };
    }
    if (isLegalPage(rest)) {
        const { title, description } = legalSeo(rest, getGdprTranslations(lang) as unknown as Record<string, string>);
        return { title, description, ogTitle: title, ogDescription: description, twitterDescription: description, noindex: false };
    }
    // profil public (u/<identifiant>) : textes de l'accueil, comme côté navigateur
    const keys = SEO_PAGES[rest] ?? SEO_PAGES[''];
    return {
        title: tr(lang, keys.title),
        description: tr(lang, keys.description),
        ogTitle: tr(lang, keys.ogTitle ?? keys.title),
        ogDescription: tr(lang, keys.ogDescription ?? keys.description),
        twitterDescription: tr(lang, keys.twitterDescription ?? keys.description),
        noindex: Boolean(keys.noindex),
    };
}

function renderHead(lang: Language, rest: string, notFound: boolean): string {
    const meta = pageMeta(lang, rest, notFound);
    const canonical = `${SITE_URL}${localePath(lang, rest)}`;
    const lines: string[] = [
        `<title>${escapeHtml(meta.title)}</title>`,
        `<meta name="description" content="${escapeHtml(meta.description)}" />`,
        `<meta name="robots" content="${meta.noindex ? 'noindex, nofollow' : 'index, follow'}" />`,
        '<meta name="author" content="PokeTracker" />',
        '<meta name="application-name" content="PokeTracker" />',
        `<link rel="canonical" href="${canonical}" />`,
    ];
    if (!meta.noindex) {
        for (const l of LANGS) lines.push(`<link rel="alternate" hreflang="${HTML_LANG[l]}" href="${SITE_URL}${localePath(l, rest)}" />`);
        lines.push(`<link rel="alternate" hreflang="x-default" href="${SITE_URL}${localePath('en', rest)}" />`);
    }
    lines.push(
        '<meta property="og:type" content="website" />',
        `<meta property="og:url" content="${canonical}" />`,
        `<meta property="og:title" content="${escapeHtml(meta.ogTitle)}" />`,
        `<meta property="og:description" content="${escapeHtml(meta.ogDescription)}" />`,
        `<meta property="og:image" content="${OG_IMAGE}" />`,
        '<meta property="og:image:type" content="image/jpeg" />',
        '<meta property="og:image:width" content="1200" />',
        '<meta property="og:image:height" content="630" />',
        '<meta property="og:image:alt" content="PokeTracker" />',
        `<meta property="og:site_name" content="${escapeHtml(tr(lang, 'seo_app_name'))}" />`,
        `<meta property="og:locale" content="${OG_LOCALE[lang]}" />`,
        ...LANGS.filter(l => l !== lang).map(l => `<meta property="og:locale:alternate" content="${OG_LOCALE[l]}" />`),
        '<meta name="twitter:card" content="summary_large_image" />',
        `<meta name="twitter:url" content="${canonical}" />`,
        `<meta name="twitter:title" content="${escapeHtml(meta.ogTitle)}" />`,
        `<meta name="twitter:description" content="${escapeHtml(meta.twitterDescription)}" />`,
        `<meta name="twitter:image" content="${OG_IMAGE}" />`,
        '<meta name="twitter:image:alt" content="PokeTracker" />',
    );
    if (rest === '' && !notFound) {
        // même bloc que celui que l'application maintient côté navigateur (id « ld-webapp »)
        const json = JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: tr(lang, 'seo_app_name'),
            description: meta.description,
            url: canonical,
            applicationCategory: 'GameApplication',
            operatingSystem: 'Web Browser',
            browserRequirements: 'Requires JavaScript. Requires HTML5.',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
            inLanguage: LANGS.map(l => HTML_LANG[l]),
        }).replace(/</g, '\\u003c');
        lines.push(`<script id="ld-webapp" type="application/ld+json">${json}</script>`);
    }
    return lines.map(line => `  ${line}`).join('\n');
}

// ---------------------------------------------------------------------------------------------
// Contenu visible sans JavaScript (remplacé par l'application au chargement)

const NAV_LABELS: { page: string; key: string }[] = [
    { page: '', key: 'shiny_tracker_title' },
    { page: 'collection', key: 'nav_collection' },
    { page: 'stats', key: 'stats_tab' },
    { page: 'communaute', key: 'community_feed' },
    { page: 'chasse', key: 'nav_hunt' },
];
const LEGAL_LABELS: { page: string; key: 'footer_privacy' | 'footer_terms' }[] = [
    { page: 'privacy', key: 'footer_privacy' },
    { page: 'terms', key: 'footer_terms' },
];

const LEGAL_DATE_LOCALE: Record<Language, string> = { fr: 'fr-FR', en: 'en-US', es: 'es-ES', jp: 'ja-JP' };
const LANG_NAMES: Record<Language, string> = { fr: 'Français', en: 'English', es: 'Español', jp: '日本語' };

function renderBody(lang: Language, rest: string, notFound: boolean): string {
    const meta = pageMeta(lang, rest, notFound);
    const link = (href: string, text: string, extra = '') =>
        `<a href="${href}"${extra} style="color:#facc15">${escapeHtml(text)}</a>`;

    const parts: string[] = [];
    parts.push('<header>');
    parts.push(`<nav aria-label="${escapeHtml(tr(lang, 'nav_main'))}"><ul style="display:flex;flex-wrap:wrap;gap:1rem;list-style:none;padding:0;margin:0 0 2rem">`
        + NAV_LABELS.map(({ page, key }) => `<li>${link(localePath(lang, page), tr(lang, key))}</li>`).join('')
        + '</ul></nav>');
    parts.push('</header>');

    if (notFound) {
        parts.push(`<h1>${escapeHtml(meta.title)}</h1>`);
        parts.push(`<p>${escapeHtml(meta.description)}</p>`);
    } else if (isLegalPage(rest)) {
        const texts = getGdprTranslations(lang) as unknown as Record<string, string>;
        const updated = new Date(`${LEGAL_UPDATED}T12:00:00Z`).toLocaleDateString(LEGAL_DATE_LOCALE[lang], { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
        const paragraphs = (text: string) => text.split(/\n{2,}/).map(block => `<p>${escapeHtml(block).replace(/\n/g, '<br>')}</p>`).join('');
        parts.push(`<h1 style="color:#facc15">${escapeHtml(texts[`${rest}_title`])}</h1>`);
        parts.push(`<p>${escapeHtml(texts[`${rest}_last_updated`])} : ${escapeHtml(updated)}</p>`);
        parts.push(paragraphs(texts[`${rest}_intro`]));
        for (let n = 1; n <= LEGAL_SECTIONS[rest]; n++) {
            parts.push(`<h2>${escapeHtml(texts[`${rest}_section${n}_title`])}</h2>${paragraphs(texts[`${rest}_section${n}_content`])}`);
        }
    } else if (rest === '') {
        parts.push(`<h1 style="color:#facc15">${escapeHtml(tr(lang, 'home_hero_title'))}</h1>`);
        parts.push(`<p>${escapeHtml(tr(lang, 'home_hero_subtitle'))}</p>`);
        parts.push(`<h2>${escapeHtml(tr(lang, 'home_how_title'))}</h2><ol>`
            + [1, 2, 3].map(n => `<li><strong>${escapeHtml(tr(lang, `home_step${n}_title`))}</strong> ${escapeHtml(tr(lang, `home_step${n}_text`))}</li>`).join('')
            + '</ol>');
        parts.push(`<h2>${escapeHtml(tr(lang, 'home_features_title'))}</h2><ul>`
            + [1, 2, 3, 4, 5, 6].map(n => `<li><strong>${escapeHtml(tr(lang, `home_f${n}_title`))}</strong> ${escapeHtml(tr(lang, `home_f${n}_text`))}</li>`).join('')
            + '</ul>');
    } else {
        // « Collection de Pokémon shiny - PokeTracker » → « Collection de Pokémon shiny »
        const heading = meta.title.replace(/\s+[-–|]\s+PokeTracker$/, '');
        parts.push(`<h1 style="color:#facc15">${escapeHtml(heading)}</h1>`);
        parts.push(`<p>${escapeHtml(meta.description)}</p>`);
    }

    parts.push(`<nav aria-label="Legal" style="margin-top:2rem"><ul style="display:flex;flex-wrap:wrap;gap:1rem;list-style:none;padding:0">`
        + LEGAL_LABELS.map(({ page, key }) => `<li>${link(localePath(lang, page), (getGdprTranslations(lang) as unknown as Record<string, string>)[key])}</li>`).join('')
        + '</ul></nav>');

    // Même page dans les autres langues (liens explorables par les robots)
    parts.push(`<nav aria-label="Language" style="margin-top:2rem"><ul style="display:flex;flex-wrap:wrap;gap:1rem;list-style:none;padding:0">`
        + LANGS.map(l => `<li>${link(localePath(l, notFound ? '' : rest), LANG_NAMES[l], ` hreflang="${HTML_LANG[l]}" lang="${HTML_LANG[l]}"`)}</li>`).join('')
        + '</ul></nav>');

    return `<main id="seo-static" style="max-width:48rem;margin:0 auto;padding:2.5rem 1rem;line-height:1.6">${parts.join('')}</main>`;
}

// ---------------------------------------------------------------------------------------------
// Assemblage

export interface RenderedPage { html: string; cacheKey: string | null }

/**
 * HTML d'une page dans une langue, à partir du index.html construit. Renvoie null si ce fichier
 * n'existe pas (site non construit).
 */
export function renderPage(staticDir: string, lang: Language, rest: string, notFound: boolean): RenderedPage | null {
    const base = readTemplate(staticDir);
    if (!base) return null;

    let html = base
        .replace(/<html lang="[^"]*"/, `<html lang="${HTML_LANG[lang]}"`)
        .replace(/[ \t]*<!--seo:start-->[\s\S]*?<!--seo:end-->/, () => renderHead(lang, rest, notFound))
        .replace(/[ \t]*<noscript>[\s\S]*?<\/noscript>\s*/, '')
        .replace('<div id="root"></div>', () => `<div id="root">${renderBody(lang, rest, notFound)}</div>`);

    // Les profils publics (u/<identifiant>) ont une adresse par dresseur : pas de mise en cache de la compression
    const cacheKey = rest.startsWith('u/') ? null : `${lang}:${rest}:${notFound ? '404' : '200'}:${template?.mtimeMs}`;
    return { html, cacheKey };
}
