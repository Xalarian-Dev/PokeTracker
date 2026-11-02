import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { HTML_LANG, LANGS, OG_LOCALE, SITE_URL, localePath, splitLangPath } from '../utils/langRoutes';
import { SEO_PAGES, isLegalPage, legalSeo } from '../utils/seoPages';
import { getGdprTranslations } from '../i18n/gdpr-index';

const OG_IMAGE = `${SITE_URL}/og-image.jpg`;

interface MetadataConfig {
    /** Remplace le titre et la description de la page (ex. profil public) */
    title?: string;
    description?: string;
    /** Force « noindex » (ex. dresseur introuvable) */
    noindex?: boolean;
}

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

    // /fr/collection/ et /fr/collection sont la même page ; « rest » = la page sans le préfixe de langue
    const { rest } = splitLangPath(pathname);
    const isProfile = rest.startsWith('u/');
    const page = SEO_PAGES[rest] ?? (isProfile ? SEO_PAGES[''] : undefined);
    const unknown = !page;
    const key = page ?? SEO_PAGES[''];
    const noindex = Boolean(config.noindex) || Boolean(key.noindex) || unknown;

    useEffect(() => {
        const legal = isLegalPage(rest) ? legalSeo(rest, getGdprTranslations(language) as unknown as Record<string, string>) : null;
        const title = config.title ?? legal?.title ?? t(unknown ? 'not_found_title' : key.title);
        const description = config.description ?? legal?.description ?? t(key.description);
        const canonicalUrl = `${SITE_URL}${localePath(language, rest)}`;
        const htmlLang = HTML_LANG[language] || 'en';

        document.title = title;
        document.documentElement.setAttribute('lang', htmlLang);

        setMeta('name', 'description', description);
        setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');

        // Aperçus de partage
        setMeta('property', 'og:type', 'website');
        setMeta('property', 'og:url', canonicalUrl);
        setMeta('property', 'og:title', config.title ?? legal?.title ?? t(key.ogTitle ?? key.title));
        setMeta('property', 'og:description', config.description ?? legal?.description ?? t(key.ogDescription ?? key.description));
        setMeta('property', 'og:image', OG_IMAGE);
        setMeta('property', 'og:site_name', t('seo_app_name'));
        setMeta('property', 'og:locale', OG_LOCALE[language] || 'en_US');
        setMeta('name', 'twitter:card', 'summary_large_image');
        setMeta('name', 'twitter:url', canonicalUrl);
        setMeta('name', 'twitter:title', config.title ?? legal?.title ?? t(key.ogTitle ?? key.title));
        setMeta('name', 'twitter:description', config.description ?? legal?.description ?? t(key.twitterDescription ?? key.description));
        setMeta('name', 'twitter:image', OG_IMAGE);

        // Adresse canonique : celle de la page elle-même, dans la langue courante
        let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.setAttribute('rel', 'canonical');
            document.head.appendChild(canonical);
        }
        canonical.setAttribute('href', canonicalUrl);

        // Versions de la page dans les autres langues (hreflang), pour les pages indexables
        document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(node => node.remove());
        if (!noindex) {
            const addAlternate = (hreflang: string, href: string) => {
                const link = document.createElement('link');
                link.setAttribute('rel', 'alternate');
                link.setAttribute('hreflang', hreflang);
                link.setAttribute('href', href);
                document.head.appendChild(link);
            };
            for (const lang of LANGS) addAlternate(HTML_LANG[lang], `${SITE_URL}${localePath(lang, rest)}`);
            addAlternate('x-default', `${SITE_URL}${localePath('en', rest)}`);
        }

        // Données structurées de l'application : page d'accueil uniquement. Le bloc « WebSite » du
        // HTML d'origine n'est jamais modifié.
        let app = document.getElementById('ld-webapp');
        if (rest === '') {
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
                url: canonicalUrl,
                applicationCategory: 'GameApplication',
                operatingSystem: 'Web Browser',
                browserRequirements: 'Requires JavaScript. Requires HTML5.',
                offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
                inLanguage: LANGS.map(lang => HTML_LANG[lang]),
            });
        } else if (app) {
            app.remove();
        }
    }, [language, t, rest, config.title, config.description, noindex, unknown, key]);
};
