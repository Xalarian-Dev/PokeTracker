import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../utils/cn';

/**
 * Composant LanguageSelector réutilisable
 * Permet de changer la langue de l'application
 */
export const LanguageSelector: React.FC = () => {
    const { language, setLanguage } = useLanguage();

    const LANGS: { code: 'fr' | 'en' | 'es' | 'jp'; short: string; name: string; htmlLang: string }[] = [
        { code: 'fr', short: 'FR', name: 'Français', htmlLang: 'fr' },
        { code: 'en', short: 'EN', name: 'English', htmlLang: 'en' },
        { code: 'es', short: 'ES', name: 'Español', htmlLang: 'es' },
        { code: 'jp', short: '日本語', name: '日本語', htmlLang: 'ja' },
    ];

    return (
        <div role="group" aria-label="Language" className="flex items-center gap-1 bg-gray-900/50 p-1 rounded-lg">
            {LANGS.map(l => (
                <button
                    key={l.code}
                    type="button"
                    onClick={() => setLanguage(l.code)}
                    lang={l.htmlLang}
                    title={l.name}
                    aria-label={l.name}
                    aria-pressed={language === l.code}
                    className={cn(
                        "min-h-8 min-w-8 px-2 text-xs font-semibold rounded-md transition-colors",
                        language === l.code
                            ? "bg-poke-yellow text-gray-900"
                            : "bg-dark-700 hover:bg-dark-600 text-white"
                    )}
                >
                    {l.short}
                </button>
            ))}
        </div>
    );
};

export default LanguageSelector;
