import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useLegalModal } from '../contexts/LegalModalContext';
import { changelogEN } from '../i18n/changelog-en';
import { changelogFR } from '../i18n/changelog-fr';
import { changelogJP } from '../i18n/changelog-jp';
import { changelogES } from '../i18n/changelog-es';

export const ChangeLog: React.FC = () => {
    const { language } = useLanguage();
    const { close } = useLegalModal();

    const content = {
        fr: changelogFR,
        en: changelogEN,
        jp: changelogJP,
        es: changelogES
    };

    const t = content[language as keyof typeof content] || content.en;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-gray-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 p-6 rounded-t-xl">
                    <div className="flex justify-between items-center">
                        <h2 className="text-3xl font-bold text-white">{t.title}</h2>
                        <button
                            onClick={close}
                            className="text-white hover:text-gray-200 transition-colors"
                            aria-label={t.close}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Latest Update */}
                    <div className="bg-gray-900 rounded-lg p-5 border border-purple-500/30">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-2xl">🔒</span>
                            <h3 className="text-xl font-bold text-white">{t.sectionTitle}</h3>
                        </div>
                        <p className="text-gray-400 text-sm mb-4">{t.date}</p>

                        {/* Features */}
                        <div className="mb-4">
                            <h4 className="text-purple-400 font-semibold mb-2">{t.features}</h4>
                            <ul className="space-y-2">
                                {t.featuresList.map((feature, index) => (
                                    <li key={index} className="text-gray-300 text-sm flex items-start gap-2">
                                        <span className="text-green-400 mt-1">✓</span>
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Security */}
                        {t.security && t.securityList && (
                            <div className="mb-4">
                                <h4 className="text-purple-400 font-semibold mb-2">{t.security}</h4>
                                <ul className="space-y-2">
                                    {t.securityList.map((item, index) => (
                                        <li key={index} className="text-gray-300 text-sm flex items-start gap-2">
                                            <span className="text-blue-400 mt-1">✓</span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Technical Details */}
                        {t.technical && t.technicalList && (
                            <div>
                                <h4 className="text-purple-400 font-semibold mb-2">{t.technical}</h4>
                                <ul className="space-y-2">
                                    {t.technicalList.map((detail, index) => (
                                        <li key={index} className="text-gray-300 text-sm flex items-start gap-2">
                                            <span className="text-yellow-400 mt-1">•</span>
                                            <span>{detail}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-gray-800 border-t border-gray-700 p-4 rounded-b-xl">
                    <button
                        onClick={close}
                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
                    >
                        {t.close}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChangeLog;
