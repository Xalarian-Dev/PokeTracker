import { useState, useEffect } from 'react';

const COOKIE_CONSENT_KEY = 'poketracker_cookie_consent';

export type CookieConsentStatus = 'pending' | 'accepted' | 'rejected';

export const useCookieConsent = () => {
    const [consentStatus, setConsentStatus] = useState<CookieConsentStatus>('pending');

    useEffect(() => {
        // Check localStorage for existing consent
        const savedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);

        if (savedConsent === 'accepted') {
            setConsentStatus('accepted');
        } else if (savedConsent === 'rejected') {
            setConsentStatus('rejected');
        } else {
            setConsentStatus('pending');
        }
    }, []);

    const acceptCookies = () => {
        localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
        setConsentStatus('accepted');
    };

    const rejectCookies = () => {
        localStorage.setItem(COOKIE_CONSENT_KEY, 'rejected');
        setConsentStatus('rejected');
    };

    return {
        consentStatus,
        acceptCookies,
        rejectCookies,
        hasConsented: consentStatus === 'accepted',
        hasRejected: consentStatus === 'rejected',
        isPending: consentStatus === 'pending',
    };
};
