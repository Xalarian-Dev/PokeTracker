import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { CommunityFeed } from './CommunityFeed';

export const RightSidebar: React.FC = () => {
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Backdrop on mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Panel — toggle button is a child anchored to its left edge */}
            <div
                className={`
                    fixed top-0 right-0 h-full w-72 bg-gray-800 border-l border-gray-700 shadow-2xl
                    transform transition-transform duration-300 ease-in-out z-50
                    flex flex-col
                    ${isOpen ? 'translate-x-0' : 'translate-x-full'}
                `}
            >
                {/* Toggle — sits outside the panel's left edge, moves with it */}
                <button
                    onClick={() => setIsOpen(o => !o)}
                    className="absolute left-0 -translate-x-full top-1/2 -translate-y-1/2 h-16 w-10 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-l-lg flex items-center justify-center text-white shadow-lg z-10"
                    aria-label={isOpen ? t('collapse_filters') : t('community_feed')}
                >
                    {isOpen ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    )}
                </button>

                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 shrink-0">
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="font-semibold text-white text-sm">{t('community_feed')}</span>
                        <span className="flex items-center gap-1 text-[10px] text-green-400 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            {t('community_feed_live')}
                        </span>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-1 rounded hover:bg-gray-700 transition-colors"
                        aria-label="Close"
                    >
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Feed — scrollable */}
                <div className="flex-1 overflow-y-auto">
                    <CommunityFeed />
                </div>
            </div>
        </>
    );
};

export default RightSidebar;
