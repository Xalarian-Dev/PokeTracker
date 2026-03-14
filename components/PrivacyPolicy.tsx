import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getGdprTranslations } from '../i18n/gdpr-index';
import { useLegalModal } from '../contexts/LegalModalContext';

export const PrivacyPolicy: React.FC = () => {
    const { language } = useLanguage();
    const { close } = useLegalModal();
    const t = getGdprTranslations(language as 'fr' | 'en' | 'jp' | 'es');

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-purple-500/30">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-800">
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        {t.privacy_title}
                    </h1>
                    <button
                        onClick={close}
                        className="p-2 hover:bg-gray-800 rounded-lg transition-colors duration-200"
                        aria-label="Close"
                    >
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Last Updated */}
                    <p className="text-sm text-gray-400">
                        {t.privacy_last_updated}: {new Date().toLocaleDateString(language === 'fr' ? 'fr-FR' : language === 'jp' ? 'ja-JP' : 'en-US')}
                    </p>

                    {/* Intro */}
                    <p className="text-gray-300 leading-relaxed">{t.privacy_intro}</p>

                    {/* Section 1 */}
                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">{t.privacy_section1_title}</h2>
                        <div className="text-gray-300 leading-relaxed whitespace-pre-line">{t.privacy_section1_content}</div>
                    </section>

                    {/* Section 2 */}
                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">{t.privacy_section2_title}</h2>
                        <div className="text-gray-300 leading-relaxed whitespace-pre-line">{t.privacy_section2_content}</div>
                    </section>

                    {/* Section 3 */}
                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">{t.privacy_section3_title}</h2>
                        <div className="text-gray-300 leading-relaxed whitespace-pre-line">{t.privacy_section3_content}</div>
                    </section>

                    {/* Section 4 */}
                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">{t.privacy_section4_title}</h2>
                        <div className="text-gray-300 leading-relaxed whitespace-pre-line">{t.privacy_section4_content}</div>
                    </section>

                    {/* Section 5 */}
                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">{t.privacy_section5_title}</h2>
                        <div className="text-gray-300 leading-relaxed whitespace-pre-line">{t.privacy_section5_content}</div>
                    </section>

                    {/* Section 6 */}
                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">{t.privacy_section6_title}</h2>
                        <div className="text-gray-300 leading-relaxed whitespace-pre-line">{t.privacy_section6_content}</div>
                    </section>

                    {/* Section 7 */}
                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">{t.privacy_section7_title}</h2>
                        <div className="text-gray-300 leading-relaxed whitespace-pre-line">{t.privacy_section7_content}</div>
                    </section>

                    {/* Section 8 */}
                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">{t.privacy_section8_title}</h2>
                        <div className="text-gray-300 leading-relaxed whitespace-pre-line">{t.privacy_section8_content}</div>
                    </section>

                    {/* Section 9 */}
                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">{t.privacy_section9_title}</h2>
                        <div className="text-gray-300 leading-relaxed whitespace-pre-line">{t.privacy_section9_content}</div>
                    </section>

                    {/* Section 10 */}
                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">{t.privacy_section10_title}</h2>
                        <div className="text-gray-300 leading-relaxed whitespace-pre-line">{t.privacy_section10_content}</div>
                    </section>

                    {/* Section 11 */}
                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">{t.privacy_section11_title}</h2>
                        <div className="text-gray-300 leading-relaxed whitespace-pre-line">{t.privacy_section11_content}</div>
                    </section>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-800">
                    <button
                        onClick={close}
                        className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors duration-200"
                    >
                        {language === 'fr' ? 'Fermer' : language === 'jp' ? '閉じる' : 'Close'}
                    </button>
                </div>
            </div>
        </div>
    );
};
