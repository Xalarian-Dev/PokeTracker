import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { FranceFlag, UKFlag, JapanFlag, SpainFlag } from './Icons';
import { cn } from '../utils/cn';

/**
 * Composant LanguageSelector réutilisable
 * Permet de changer la langue de l'application
 */
export const LanguageSelector: React.FC = () => {
    const { language, setLanguage } = useLanguage();

    const langButtonClasses = (lang: 'fr' | 'en' | 'jp' | 'es') =>
        cn(
            "px-2 py-1 flex items-center justify-center rounded-md transition-colors",
            language === lang
                ? "bg-poke-yellow text-gray-900 border border-poke-yellow-dark"
                : "bg-dark-700 hover:bg-dark-600 text-white"
        );

    return (
        <div className="flex items-center space-x-1 sm:space-x-2 bg-gray-900/50 p-1 rounded-lg">
            <button
                onClick={() => setLanguage('en')}
                className={langButtonClasses('en')}
                title="English"
            >
                <UKFlag className="w-5 h-3 sm:w-6 sm:h-4 shadow-sm" />
            </button>
            <button
                onClick={() => setLanguage('fr')}
                className={langButtonClasses('fr')}
                title="Français"
            >
                <FranceFlag className="w-5 h-3 sm:w-6 sm:h-4 shadow-sm" />
            </button>
            <button
                onClick={() => setLanguage('es')}
                className={langButtonClasses('es')}
                title="Español"
            >
                <SpainFlag className="w-5 h-3 sm:w-6 sm:h-4 shadow-sm" />
            </button>
            <button
                onClick={() => setLanguage('jp')}
                className={langButtonClasses('jp')}
                title="日本語"
            >
                <JapanFlag className="w-5 h-3 sm:w-6 sm:h-4 shadow-sm" />
            </button>
        </div>
    );
};

export default LanguageSelector;
