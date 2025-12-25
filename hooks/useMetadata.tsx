import { useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface MetadataConfig {
    canonicalUrl?: string;
    ogImage?: string;
}

export const useMetadata = (config: MetadataConfig = {}) => {
    const { t, language } = useLanguage();

    const canonicalUrl = config.canonicalUrl || 'https://pokemonshinytracker.vercel.app';
    const ogImage = config.ogImage || '/og-image.png';

    useEffect(() => {
        // Update document title
        document.title = t('seo_title');

        // Update HTML lang attribute
        const htmlElement = document.documentElement;
        const langMap: Record<string, string> = {
            'fr': 'fr',
            'en': 'en',
            'jp': 'ja'
        };
        htmlElement.setAttribute('lang', langMap[language] || 'en');

        // Update meta description
        const updateMetaTag = (name: string, content: string, attribute: 'name' | 'property' = 'name') => {
            let meta = document.querySelector(`meta[${attribute}="${name}"]`);
            if (!meta) {
                meta = document.createElement('meta');
                meta.setAttribute(attribute, name);
                document.head.appendChild(meta);
            }
            meta.setAttribute('content', content);
        };

        // Basic SEO
        updateMetaTag('description', t('seo_description'));
        updateMetaTag('keywords', t('seo_keywords'));

        // Open Graph
        updateMetaTag('og:title', t('seo_og_title'), 'property');
        updateMetaTag('og:description', t('seo_og_description'), 'property');
        updateMetaTag('og:type', 'website', 'property');
        updateMetaTag('og:url', canonicalUrl, 'property');
        updateMetaTag('og:image', `${canonicalUrl}${ogImage}`, 'property');
        updateMetaTag('og:site_name', t('seo_app_name'), 'property');
        updateMetaTag('og:locale', langMap[language] === 'ja' ? 'ja_JP' : langMap[language] === 'fr' ? 'fr_FR' : 'en_US', 'property');

        // Twitter Cards
        updateMetaTag('twitter:card', 'summary_large_image');
        updateMetaTag('twitter:title', t('seo_og_title'));
        updateMetaTag('twitter:description', t('seo_twitter_description'));
        updateMetaTag('twitter:image', `${canonicalUrl}${ogImage}`);

        // Update canonical link
        let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.setAttribute('rel', 'canonical');
            document.head.appendChild(canonical);
        }
        canonical.setAttribute('href', canonicalUrl);

        // Update JSON-LD structured data
        let scriptTag = document.querySelector('script[type="application/ld+json"]');
        if (!scriptTag) {
            scriptTag = document.createElement('script');
            scriptTag.setAttribute('type', 'application/ld+json');
            document.head.appendChild(scriptTag);
        }

        const structuredData = {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": t('seo_app_name'),
            "description": t('seo_description'),
            "url": canonicalUrl,
            "applicationCategory": "GameApplication",
            "operatingSystem": "Web Browser",
            "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
            },
            "inLanguage": [langMap[language] || 'en', 'fr', 'en', 'ja']
        };

        scriptTag.textContent = JSON.stringify(structuredData);
    }, [language, t, canonicalUrl, ogImage]);

    return {
        updateTitle: (title: string) => {
            document.title = title;
        },
        updateDescription: (description: string) => {
            const meta = document.querySelector('meta[name="description"]');
            if (meta) {
                meta.setAttribute('content', description);
            }
        }
    };
};
