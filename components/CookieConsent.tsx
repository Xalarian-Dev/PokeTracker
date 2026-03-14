import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getGdprTranslations } from '../i18n/gdpr-index';
import { useCookieConsent } from '../hooks/useCookieConsent';
import { useLegalModal } from '../contexts/LegalModalContext';

export const CookieConsent: React.FC = () => {
    const { language } = useLanguage();
    const { isPending, acceptCookies } = useCookieConsent();
    const { openPrivacy } = useLegalModal();
    const t = getGdprTranslations(language as 'fr' | 'en' | 'jp' | 'es');

    const handleAccept = () => {
        acceptCookies();
    };

    if (!isPending) return null;

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9998]" />

            {/* Banner */}
            <div className="fixed bottom-0 left-0 right-0 z-[9999] animate-slide-up">
                <div className="bg-gray-800 border-t-2 border-purple-500 shadow-2xl">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            {/* Content */}
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                                    🍪 {t.cookie_banner_title}
                                </h3>
                                <p className="text-gray-300 text-sm leading-relaxed">
                                    {t.cookie_banner_message}
                                </p>
                            </div>

                            {/* Button */}
                            <div className="flex gap-3 w-full sm:w-auto">
                                <button
                                    onClick={handleAccept}
                                    className="px-8 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-lg shadow-purple-500/30 w-full sm:w-auto"
                                >
                                    {t.cookie_accept}
                                </button>
                            </div>
                        </div>

                        {/* Learn More Link */}
                        <div className="mt-4 pt-4 border-t border-gray-700">
                            <button
                                onClick={openPrivacy}
                                className="text-sm text-purple-400 hover:text-purple-300 transition-colors duration-200 flex items-center gap-1"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {t.cookie_learn_more}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
        </>
    );
};
