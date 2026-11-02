// Textes SEO (clés de traduction) de chaque page, partagés entre l'application et le serveur
// (le serveur s'en sert pour écrire les balises dans le HTML de chaque page et de chaque langue).

export interface PageKeys {
    title: string;
    description: string;
    /** Textes dédiés aux aperçus de partage (sinon : titre et description de la page) */
    ogTitle?: string;
    ogDescription?: string;
    twitterDescription?: string;
    /** Page privée ou sans intérêt pour la recherche */
    noindex?: boolean;
}

/** Pages de l'application, par chemin sans préfixe de langue ('' = accueil) */
export const SEO_PAGES: Record<string, PageKeys> = {
    '': { title: 'seo_title', description: 'seo_description', ogTitle: 'seo_og_title', ogDescription: 'seo_og_description', twitterDescription: 'seo_twitter_description' },
    'collection': { title: 'seo_collection_title', description: 'seo_collection_description' },
    'stats': { title: 'seo_stats_title', description: 'seo_stats_description' },
    'communaute': { title: 'seo_community_title', description: 'seo_community_description' },
    'chasse': { title: 'seo_hunt_title', description: 'seo_hunt_description' },
    'privacy': { title: 'seo_title', description: 'seo_description' },
    'terms': { title: 'seo_title', description: 'seo_description' },
    'profile': { title: 'seo_title', description: 'seo_description', noindex: true },
};

/** Pages légales : leur titre et leur description viennent des textes juridiques (gdpr-*) */
export const LEGAL_PAGES = ['privacy', 'terms'] as const;
export type LegalPageId = (typeof LEGAL_PAGES)[number];
export const isLegalPage = (rest: string): rest is LegalPageId => (LEGAL_PAGES as readonly string[]).includes(rest);
/** Nombre de rubriques de chaque texte */
export const LEGAL_SECTIONS: Record<LegalPageId, number> = { privacy: 11, terms: 10 };
/** Date de dernière modification du fond des textes légaux (à mettre à jour quand ils changent) */
export const LEGAL_UPDATED = '2026-11-01';

export function legalSeo(page: LegalPageId, texts: Record<string, string>): { title: string; description: string } {
    return {
        title: `${texts[`${page}_title`]} - PokeTracker`,
        description: texts[`${page}_intro`],
    };
}
