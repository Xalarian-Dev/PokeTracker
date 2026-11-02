import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getGdprTranslations } from '../i18n/gdpr-index';
import { LEGAL_SECTIONS, LEGAL_UPDATED, type LegalPageId } from '../utils/seoPages';

const DATE_LOCALE = { fr: 'fr-FR', en: 'en-US', es: 'es-ES', jp: 'ja-JP' } as const;

/** Confidentialité et conditions d'utilisation : une vraie page, avec sa propre adresse (/<langue>/privacy, /<langue>/terms) */
const LegalPage: React.FC<{ kind: LegalPageId }> = ({ kind }) => {
    const { language } = useLanguage();
    const texts = getGdprTranslations(language) as unknown as Record<string, string>;
    const updated = new Date(`${LEGAL_UPDATED}T12:00:00Z`).toLocaleDateString(DATE_LOCALE[language], { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });

    return (
        <main className="max-w-4xl mx-auto px-4 py-10 text-white">
            <h1 className="text-3xl font-bold text-yellow-400 mb-2">{texts[`${kind}_title`]}</h1>
            <p className="text-sm text-gray-400 mb-6">{texts[`${kind}_last_updated`]}: {updated}</p>
            <p className="text-gray-300 leading-relaxed mb-8">{texts[`${kind}_intro`]}</p>
            <div className="space-y-8">
                {Array.from({ length: LEGAL_SECTIONS[kind] }, (_, i) => i + 1).map(n => (
                    <section key={n}>
                        <h2 className="text-xl font-semibold text-white mb-3">{texts[`${kind}_section${n}_title`]}</h2>
                        <div className="text-gray-300 leading-relaxed whitespace-pre-line">{texts[`${kind}_section${n}_content`]}</div>
                    </section>
                ))}
            </div>
        </main>
    );
};

export default LegalPage;
