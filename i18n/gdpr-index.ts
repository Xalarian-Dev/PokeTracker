// GDPR translations index
import { gdprFr } from './gdpr-fr';
import { gdprEn } from './gdpr-en';
import { gdprJp } from './gdpr-jp';
import { gdprEs } from './gdpr-es';

export const gdprTranslations = {
    fr: gdprFr,
    en: gdprEn,
    jp: gdprJp,
    es: gdprEs,
};

// Helper function to get GDPR translations for a specific language
export const getGdprTranslations = (language: 'fr' | 'en' | 'jp' | 'es') => {
    return gdprTranslations[language] || gdprTranslations.en;
};
