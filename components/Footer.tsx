import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getGdprTranslations } from '../i18n/gdpr-index';
import { useLegalModal } from '../contexts/LegalModalContext';

export const Footer: React.FC = () => {
    const { language, t: uiT } = useLanguage();
    const t = getGdprTranslations(language as 'fr' | 'en' | 'jp' | 'es');
    const { openPrivacy, openTerms, openChangelog } = useLegalModal();

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
                            {language === 'es' && 'Sigue tu colección de Pokémon shiny a través de todas las generaciones.'}
                        </p>
                    </div>

                    {/* Legal Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-3">
                            {language === 'fr' && 'Légal'}
                            {language === 'en' && 'Legal'}
                            {language === 'jp' && '法的情報'}
                            {language === 'es' && 'Legal'}
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
                            <li>
                                <button
                                    onClick={openChangelog}
                                    className="text-gray-400 hover:text-purple-400 transition-colors duration-200 text-sm flex items-center gap-1"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {uiT('changelog')}
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
                                {language === 'es' && 'Contáctenos por email'}
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
                                href="https://ko-fi.com/xalarian"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-500 hover:text-yellow-400 transition-colors duration-200"
                                aria-label="Support on Ko-fi"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.831 6.649-6.916zm-11.062 3.511c-1.246 1.453-4.011 3.976-4.011 3.976s-.121.119-.31.023c-.076-.057-.108-.09-.108-.09-.443-.441-3.368-3.049-4.034-3.954-.709-.965-1.041-2.7-.091-3.71.951-1.01 3.005-1.086 4.363.407 0 0 1.565-1.782 3.468-.963 1.904.82 1.832 3.011.723 4.311zm6.173.478c-.928.116-1.682.028-1.682.028V7.284h1.77s1.971.551 1.971 2.638c0 1.913-.985 2.667-2.059 3.015z" />
                                </svg>
                            </a>
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
