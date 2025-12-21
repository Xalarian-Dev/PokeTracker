
import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import * as frTranslations from '../i18n/fr';
import * as enTranslations from '../i18n/en';

const translations = { 
    fr: frTranslations, 
    en: enTranslations 
};

type Language = 'fr' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof frTranslations.ui, replacements?: Record<string, string | number>) => string;
  getPokemonName: (id: string) => string;
  getGameName: (id: string) => string;
  getGameList: () => Record<string, string>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: React.PropsWithChildren) => {
  const [language, setLanguage] = useState<Language>('fr');

  useEffect(() => {
    const storedLang = localStorage.getItem('shinyTrackerLang');
    if (storedLang === 'fr' || storedLang === 'en') {
      setLanguage(storedLang);
    }
  }, []);

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
    const key = id as keyof typeof frTranslations.games;
    return translations[language].games[key] || id;
  };

  const getGameList = (): Record<string, string> => {
    return translations[language].games;
  }

  const contextValue = useMemo(() => ({
    language,
    setLanguage: handleSetLanguage,
    t,
    getPokemonName,
    getGameName,
    getGameList,
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
