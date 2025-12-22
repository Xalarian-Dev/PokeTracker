import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import * as frTranslations from '../i18n/fr';
import * as enTranslations from '../i18n/en';
import * as jpTranslations from '../i18n/jp';

const translations = {
  fr: frTranslations,
  en: enTranslations,
  jp: jpTranslations
};

type Language = 'fr' | 'en' | 'jp';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof frTranslations.ui, replacements?: Record<string, string | number>) => string;
  getPokemonName: (id: string) => string;
  getGameName: (id: string) => string;
  getGameList: () => Record<string, string>;
  getRegionName: (id: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: React.PropsWithChildren) => {
  const [language, setLanguage] = useState<Language>(() => {
    // 1. Check local storage
    const storedLang = localStorage.getItem('shinyTrackerLang');
    if (storedLang === 'fr' || storedLang === 'en' || storedLang === 'jp') {
      return storedLang as Language;
    }

    // 2. Check browser language
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('fr')) {
      return 'fr';
    }
    if (browserLang.startsWith('ja')) {
      return 'jp';
    }

    // 3. Default
    return 'en';
  });

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('shinyTrackerLang', lang);
  };

  const t = (key: keyof typeof frTranslations.ui, replacements?: Record<string, string | number>): string => {
    let translation = translations[language].ui[key] || translations['en'].ui[key];
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
    // Check individual versions first (e.g. 'sw' -> 'Sword')
    // @ts-ignore
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
    // @ts-ignore - regions might not exist yet on all translation objects during migration
    const regions = translations[language].ui.regions || translations['en'].ui.regions;
    return regions[id] || id;
  };

  const contextValue = useMemo(() => ({
    language,
    setLanguage: handleSetLanguage,
    t,
    getPokemonName,
    getGameName,
    getGameList,
    getRegionName,
  }), [language, t]);

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
