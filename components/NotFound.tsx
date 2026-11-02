import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { MasterBallIcon } from './Icons';

const NotFound: React.FC = () => {
    const { t, lp } = useLanguage();
    return (
        <main className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 text-center bg-gray-900 text-white">
            <MasterBallIcon className="w-16 h-16" />
            <h1 className="text-3xl font-bold text-yellow-400">{t('not_found_title')}</h1>
            <p className="text-gray-300">{t('not_found_text')}</p>
            <Link
                to={lp('collection')}
                className="mt-2 inline-flex items-center justify-center h-11 px-6 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
                {t('not_found_home')}
            </Link>
        </main>
    );
};

export default NotFound;
