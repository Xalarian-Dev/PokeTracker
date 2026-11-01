import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { CommunityFeed } from '../components/CommunityFeed';

/** Fil de la communauté : derniers shiny capturés par les dresseurs */
const CommunityPage: React.FC = () => {
    const { t } = useLanguage();

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex items-center gap-3 mb-4">
                <h1 className="text-3xl font-bold text-white">{t('community_feed')}</h1>
                <span className="flex items-center gap-1.5 text-xs text-green-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" aria-hidden="true" />
                    {t('community_feed_live')}
                </span>
            </div>
            <CommunityFeed variant="grid" />
        </div>
    );
};

export default CommunityPage;
