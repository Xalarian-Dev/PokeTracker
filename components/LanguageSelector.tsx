import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { FranceFlag, UKFlag, JapanFlag, SpainFlag } from './Icons';
import { cn } from '../utils/cn';

type Lang = 'fr' | 'en' | 'es' | 'jp';

const LANGS: { code: Lang; name: string; htmlLang: string; Flag: React.FC<{ className?: string }> }[] = [
    { code: 'en', name: 'English', htmlLang: 'en', Flag: UKFlag },
    { code: 'fr', name: 'Français', htmlLang: 'fr', Flag: FranceFlag },
    { code: 'es', name: 'Español', htmlLang: 'es', Flag: SpainFlag },
    { code: 'jp', name: '日本語', htmlLang: 'ja', Flag: JapanFlag },
];

/**
 * Sélecteur de langue : un drapeau par langue.
 * Chaque bouton garde un nom accessible (la langue écrite dans sa propre langue) et expose son état.
 */
export const LanguageSelector: React.FC = () => {
    const { language, setLanguage } = useLanguage();

    return (
        <div role="group" aria-label="Language" className="flex items-center space-x-1 sm:space-x-2 bg-gray-900/50 p-1 rounded-lg">
            {LANGS.map(({ code, name, htmlLang, Flag }) => (
                <button
                    key={code}
                    type="button"
                    onClick={() => setLanguage(code)}
                    lang={htmlLang}
                    title={name}
                    aria-label={name}
                    aria-pressed={language === code}
                    className={cn(
                        "px-2 py-1 flex items-center justify-center rounded-md transition-colors",
                        language === code
                            ? "bg-poke-yellow text-gray-900 border border-poke-yellow-dark"
                            : "bg-dark-700 hover:bg-dark-600 text-white"
                    )}
                >
                    <Flag className="w-5 h-3 sm:w-6 sm:h-4 shadow-xs" />
                </button>
            ))}
        </div>
    );
};

export default LanguageSelector;
