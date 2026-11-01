import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const DISMISSED_KEY = 'poketracker_domain_banner_dismissed';
const SEEN_KEY = 'poketracker_domain_banner_seen';
const FROM_PARAM = 'depuis';
const FROM_VALUE = 'vercel';

/**
 * Bandeau affiché aux visiteurs redirigés depuis l'ancienne adresse (vercel.app) : la redirection
 * ajoute ?depuis=vercel. Il invite à mettre à jour le favori, puisque cette redirection disparaîtra.
 * Le paramètre est retiré de l'adresse pour ne pas être copié/partagé ; le bandeau reste affiché
 * pendant la visite (sessionStorage) jusqu'à ce qu'on le ferme (mémorisé sur l'appareil).
 */
export const DomainMoveBanner: React.FC = () => {
    const { t } = useLanguage();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        try {
            if (localStorage.getItem(DISMISSED_KEY)) return;
            const url = new URL(window.location.href);
            if (url.searchParams.get(FROM_PARAM) === FROM_VALUE) {
                sessionStorage.setItem(SEEN_KEY, '1');
                url.searchParams.delete(FROM_PARAM);
                window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
            }
            if (sessionStorage.getItem(SEEN_KEY)) setVisible(true);
        } catch {
            // stockage indisponible : pas de bandeau
        }
    }, []);

    if (!visible) return null;

    const dismiss = () => {
        try { localStorage.setItem(DISMISSED_KEY, '1'); } catch { /* ignoré */ }
        setVisible(false);
    };

    return (
        <div role="region" aria-label={t('domain_move_title')} className="bg-purple-900/70 border-b border-purple-500">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-start sm:items-center gap-3">
                <svg className="w-6 h-6 shrink-0 text-yellow-300 mt-0.5 sm:mt-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4L12 2z" />
                </svg>
                <p className="flex-1 text-sm text-white leading-relaxed">
                    <strong className="font-semibold">{t('domain_move_title')}</strong>{' '}
                    {t('domain_move_message')}
                </p>
                <button
                    type="button"
                    onClick={dismiss}
                    aria-label={t('domain_move_close')}
                    className="shrink-0 -my-1 -mr-2 w-11 h-11 flex items-center justify-center rounded-lg text-gray-200 hover:text-white hover:bg-white/10 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
};
