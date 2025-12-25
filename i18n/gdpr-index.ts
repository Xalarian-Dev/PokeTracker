// GDPR translations index
import { gdprFr } from './gdpr-fr';
import { gdprEn } from './gdpr-en';
import { gdprJp } from './gdpr-jp';

export const gdprTranslations = {
    fr: gdprFr,
    en: gdprEn,
    jp: gdprJp,
};

// Helper function to get GDPR translations for a specific language
export const getGdprTranslations = (language: 'fr' | 'en' | 'jp') => {
    return gdprTranslations[language] || gdprTranslations.en;
};
