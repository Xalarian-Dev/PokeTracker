import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

/** Adresse officielle du site (domaine sans www) : base des adresses canoniques et de l'image de partage */
export const SITE_URL = 'https://pokemonshinytracker.com';
const OG_IMAGE = `${SITE_URL}/og-image.jpg`;

interface PageKeys {
    title: string;
    description: string;
    /** Textes dédiés aux aperçus de partage (sinon : titre et description de la page) */
    ogTitle?: string;
    ogDescription?: string;
    twitterDescription?: string;
    /** Page privée ou sans intérêt pour la recherche */
    noindex?: boolean;
}

/** Textes (clés de traduction) de chaque page de l'application */
const PAGES: Record<string, PageKeys> = {
    '/': { title: 'seo_title', description: 'seo_description', ogTitle: 'seo_og_title', ogDescription: 'seo_og_description', twitterDescription: 'seo_twitter_description' },
    '/collection': { title: 'seo_collection_title', description: 'seo_collection_description' },
    '/stats': { title: 'seo_stats_title', description: 'seo_stats_description' },
    '/communaute': { title: 'seo_community_title', description: 'seo_community_description' },
    '/chasse': { title: 'seo_hunt_title', description: 'seo_hunt_description' },
    '/profile': { title: 'seo_title', description: 'seo_description', noindex: true },
};

interface MetadataConfig {
    /** Remplace le titre et la description de la page (ex. profil public) */
    title?: string;
    description?: string;
    /** Force « noindex » (ex. dresseur introuvable) */
    noindex?: boolean;
}

const LANG_MAP: Record<string, string> = { fr: 'fr', en: 'en', jp: 'ja', es: 'es' };
const LOCALE_MAP: Record<string, string> = { ja: 'ja_JP', fr: 'fr_FR', es: 'es_ES', en: 'en_US' };

function setMeta(attribute: 'name' | 'property', key: string, content: string) {
    let meta = document.querySelector(`meta[${attribute}="${key}"]`);
    if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, key);
        document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
}

/**
 * Balises SEO de la page courante : titre, description, adresse canonique PROPRE À CHAQUE PAGE,
 * aperçus de partage, langue, « noindex » pour les pages privées ou inconnues.
 */
export const useMetadata = (config: MetadataConfig = {}) => {
    const { t, language } = useLanguage();
    const { pathname } = useLocation();

    // /collection/ et /collection sont la même page
    const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
    const isProfile = path.startsWith('/u/');
    const page = PAGES[path] ?? (isProfile ? PAGES['/'] : undefined);
    const unknown = !page;
    const key = page ?? PAGES['/'];
    const noindex = Boolean(config.noindex) || Boolean(key.noindex) || unknown;

    useEffect(() => {
        const title = config.title ?? t(unknown ? 'not_found_title' : key.title);
        const description = config.description ?? t(key.description);
        const canonicalUrl = `${SITE_URL}${path}`;
        const htmlLang = LANG_MAP[language] || 'en';

        document.title = title;
        document.documentElement.setAttribute('lang', htmlLang);

        setMeta('name', 'description', description);
        setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');

        // Aperçus de partage
        setMeta('property', 'og:type', 'website');
        setMeta('property', 'og:url', canonicalUrl);
        setMeta('property', 'og:title', config.title ?? t(key.ogTitle ?? key.title));
        setMeta('property', 'og:description', config.description ?? t(key.ogDescription ?? key.description));
        setMeta('property', 'og:image', OG_IMAGE);
        setMeta('property', 'og:site_name', t('seo_app_name'));
        setMeta('property', 'og:locale', LOCALE_MAP[htmlLang] || 'en_US');
        setMeta('name', 'twitter:card', 'summary_large_image');
        setMeta('name', 'twitter:url', canonicalUrl);
        setMeta('name', 'twitter:title', config.title ?? t(key.ogTitle ?? key.title));
        setMeta('name', 'twitter:description', config.description ?? t(key.twitterDescription ?? key.description));
        setMeta('name', 'twitter:image', OG_IMAGE);

        // Adresse canonique : celle de la page elle-même
        let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.setAttribute('rel', 'canonical');
            document.head.appendChild(canonical);
        }
        canonical.setAttribute('href', canonicalUrl);

        // Données structurées de l'application : page d'accueil uniquement. Le bloc « WebSite » du
        // HTML d'origine n'est jamais modifié.
        let app = document.getElementById('ld-webapp');
        if (path === '/') {
            if (!app) {
                app = document.createElement('script');
                app.id = 'ld-webapp';
                app.setAttribute('type', 'application/ld+json');
                document.head.appendChild(app);
            }
            app.textContent = JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'WebApplication',
                name: t('seo_app_name'),
                description,
                url: `${SITE_URL}/`,
                applicationCategory: 'GameApplication',
                operatingSystem: 'Web Browser',
                browserRequirements: 'Requires JavaScript. Requires HTML5.',
                offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
                inLanguage: ['fr', 'en', 'ja', 'es'],
            });
        } else if (app) {
            app.remove();
        }
    }, [language, t, path, config.title, config.description, noindex, unknown, key]);
};
