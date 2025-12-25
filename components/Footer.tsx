import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getGdprTranslations } from '../i18n/gdpr-index';
import { useLegalModal } from '../contexts/LegalModalContext';

export const Footer: React.FC = () => {
    const { language } = useLanguage();
    const t = getGdprTranslations(language as 'fr' | 'en' | 'jp');
    const { openPrivacy, openTerms } = useLegalModal();

    // Multi-layer obfuscation to prevent spam bots
    const handleEmailClick = (e: React.MouseEvent) => {
        e.preventDefault();

        // Layer 1: ROT13 encoding
        const rot13 = (str: string) => {
            return str.replace(/[a-zA-Z]/g, (char) => {
                const start = char <= 'Z' ? 65 : 97;
                return String.fromCharCode(((char.charCodeAt(0) - start + 13) % 26) + start);
            });
        };

        // Layer 2: Base64 encoded and reversed
        // Original: xalarian.dev@gmail.com
        // Reversed: moc.liamg@ved.nairalax
        // Base64 of reversed: bW9jLmxpYW1nQHZlZC5uYWlyYWxheA==
        const encoded = 'bW9jLmxpYW1nQHZlZC5uYWlyYWxheA==';

        try {
            // Decode Base64
            const decoded = atob(encoded);
            // Reverse the string
            const reversed = decoded.split('').reverse().join('');
            // Apply ROT13 (double obfuscation)
            const email = rot13(rot13(reversed)); // Double ROT13 = original

            // Open email client
            window.location.href = `mailto:${email}`;
        } catch (error) {
            console.error('Email decoding failed');
        }
    };

    return (
        <footer className="bg-gray-900 border-t border-gray-800 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
                    {/* About Section */}
                    <div>
                        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                            <span className="text-2xl">✨</span>
                            PokeTracker
                        </h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            {language === 'fr' && 'Suivez votre collection de Pokémon shiny à travers toutes les générations.'}
                            {language === 'en' && 'Track your shiny Pokemon collection across all generations.'}
                            {language === 'jp' && 'すべての世代の色違いポケモンコレクションを追跡します。'}
                        </p>
                    </div>

                    {/* Legal Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-3">
                            {language === 'fr' && 'Légal'}
                            {language === 'en' && 'Legal'}
                            {language === 'jp' && '法的情報'}
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <button
                                    onClick={openPrivacy}
                                    className="text-gray-400 hover:text-purple-400 transition-colors duration-200 text-sm"
                                >
                                    {t.footer_privacy}
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={openTerms}
                                    className="text-gray-400 hover:text-purple-400 transition-colors duration-200 text-sm"
                                >
                                    {t.footer_terms}
                                </button>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-white font-semibold mb-3">{t.footer_contact}</h3>
                        <div className="space-y-2">
                            <a
                                href="#"
                                onClick={handleEmailClick}
                                className="text-gray-400 hover:text-purple-400 transition-colors duration-200 text-sm flex items-center gap-2"
                                // Anti-copy protection
                                onCopy={(e) => e.preventDefault()}
                                style={{ userSelect: 'none' }}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                {language === 'fr' && 'Contactez-nous par email'}
                                {language === 'en' && 'Contact us by email'}
                                {language === 'jp' && 'メールでお問い合わせ'}
                            </a>
                            <p className="text-gray-500 text-xs">
                                {t.footer_made_by} <span className="text-purple-400 font-medium">Xalarian</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-800 pt-6">
                    {/* Copyright and Disclaimer */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-gray-500 text-xs text-center md:text-left">
                            {t.footer_copyright}
                        </p>
                        <div className="flex items-center gap-4">
                            <a
                                href="https://github.com/Xalarian-Dev"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-500 hover:text-purple-400 transition-colors duration-200"
                                aria-label="GitHub"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Pokemon Disclaimer */}
                    <p className="text-gray-600 text-xs text-center mt-4 leading-relaxed max-w-3xl mx-auto">
                        {t.footer_disclaimer}
                    </p>
                </div>
            </div>
        </footer>
    );
};
