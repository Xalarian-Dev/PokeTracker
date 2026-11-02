import React, { createContext, useContext, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LANGS, LANG_COOKIE, localePath, splitLangPath, type Language } from '../utils/langRoutes';
import * as frTranslations from '../i18n/fr';
import * as enTranslations from '../i18n/en';
import * as jpTranslations from '../i18n/jp';
import * as esTranslations from '../i18n/es';

interface TranslationModule {
  ui: typeof frTranslations.ui;
  pokemon: typeof frTranslations.pokemon;
  games: typeof frTranslations.games;
  gameVersions: Record<string, string>;
}

const translations: Record<Language, TranslationModule> = {
  fr: frTranslations as TranslationModule,
  en: enTranslations as TranslationModule,
  jp: jpTranslations as TranslationModule,
  es: esTranslations as TranslationModule,
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
  getPokemonName: (id: string) => string;
  getGameName: (id: string) => string;
  getGameList: () => Record<string, string>;
  getRegionName: (id: string) => string;
  /** Adresse d'une page dans la langue courante : lp('collection') → /fr/collection */
  lp: (rest?: string) => string;
  gameVersions: Record<string, string>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

/** Langue mémorisée (choix précédent), sinon langue du navigateur, sinon anglais */
export const detectLanguage = (): Language => {
  try {
    const stored = localStorage.getItem('shinyTrackerLang');
    if ((LANGS as readonly string[]).includes(stored ?? '')) return stored as Language;
  } catch { /* stockage indisponible */ }
  const browserLang = (typeof navigator !== 'undefined' ? navigator.language : '').toLowerCase();
  if (browserLang.startsWith('fr')) return 'fr';
  if (browserLang.startsWith('ja')) return 'jp';
  if (browserLang.startsWith('es')) return 'es';
  return 'en';
};

/**
 * La langue vient de l'adresse (/fr/…, /en/…, /es/…, /jp/…). Changer de langue change l'adresse
 * sans recharger la page. Sans préfixe (ancienne adresse), on prend le choix mémorisé puis la langue
 * du navigateur : le routeur redirige alors vers l'adresse avec préfixe.
 */
export const LanguageProvider = ({ children }: React.PropsWithChildren) => {
  const { pathname, search, hash } = useLocation();
  const navigate = useNavigate();
  const { lang: urlLang, rest } = splitLangPath(pathname);
  const language: Language = urlLang ?? detectLanguage();

  // Mémorise la langue en cours : localStorage (appareil) et cookie (lu par le serveur sur « / »)
  useEffect(() => {
    if (!urlLang) return;
    try { localStorage.setItem('shinyTrackerLang', urlLang); } catch { /* ignoré */ }
    document.cookie = `${LANG_COOKIE}=${urlLang}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
  }, [urlLang]);

  const handleSetLanguage = useCallback((lang: Language) => {
    if (lang === language && urlLang) return;
    navigate(`${localePath(lang, rest)}${search}${hash}`);
  }, [language, urlLang, rest, search, hash, navigate]);

  const lp = useCallback((page = '') => localePath(language, page), [language]);

  const t = (key: string, replacements?: Record<string, string | number>): string => {
    const resolve = (ui: Record<string, unknown>, path: string): string => {
      const parts = path.split('.');
      let current: unknown = ui;
      for (const part of parts) {
        if (current == null || typeof current !== 'object') return '';
        current = (current as Record<string, unknown>)[part];
      }
      return typeof current === 'string' ? current : '';
    };
    let translation = resolve(translations[language].ui as Record<string, unknown>, key)
      || resolve(translations['en'].ui as Record<string, unknown>, key)
      || key;
    if (replacements) {
      Object.keys(replacements).forEach(rKey => {
        translation = translation.replace(`{${rKey}}`, String(replacements[rKey]));
      });
    }
    return translation;
  };

  const getPokemonName = (id: string): string => {
    const key = id as keyof typeof frTranslations.pokemon;
    return translations[language].pokemon[key] || `Pokémon #${id}`;
  };

  const getGameName = (id: string): string => {
    const versions = translations[language].gameVersions || translations['en'].gameVersions;
    if (versions && versions[id]) {
      return versions[id];
    }

    // Check game groups (e.g. 'swsh' -> 'Sword / Shield')
    const key = id as keyof typeof frTranslations.games;
    return translations[language].games[key] || id;
  };

  const getGameList = (): Record<string, string> => {
    return translations[language].games;
  }

  const getRegionName = (id: string): string => {
    const regions = (translations[language].ui as any).regions || (translations['en'].ui as any).regions;
    return regions[id] || id;
  };

  const gameVersions = useMemo(() => {
    return translations[language].gameVersions || translations['en'].gameVersions || {};
  }, [language]);

  const contextValue = useMemo(() => ({
    language,
    setLanguage: handleSetLanguage,
    t,
    getPokemonName,
    getGameName,
    getGameList,
    getRegionName,
    lp,
    gameVersions,
  }), [language, t, gameVersions, lp, handleSetLanguage]);

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
