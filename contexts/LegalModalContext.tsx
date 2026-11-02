import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from './LanguageContext';

/** Seul le journal des nouveautés reste une fenêtre ; confidentialité et conditions sont de vraies pages */
type LegalPage = 'changelog' | null;

interface LegalModalContextType {
    currentPage: LegalPage;
    openPrivacy: () => void;
    openTerms: () => void;
    openChangelog: () => void;
    close: () => void;
}

const LegalModalContext = createContext<LegalModalContextType | undefined>(undefined);

export const LegalModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentPage, setCurrentPage] = useState<LegalPage>(null);
    const navigate = useNavigate();
    const { lp } = useLanguage();

    const openPrivacy = () => navigate(lp('privacy'));
    const openTerms = () => navigate(lp('terms'));
    const openChangelog = () => setCurrentPage('changelog');
    const close = () => setCurrentPage(null);

    return (
        <LegalModalContext.Provider value={{ currentPage, openPrivacy, openTerms, openChangelog, close }}>
            {children}
        </LegalModalContext.Provider>
    );
};

export const useLegalModal = () => {
    const context = useContext(LegalModalContext);
    if (!context) {
        throw new Error('useLegalModal must be used within a LegalModalProvider');
    }
    return context;
};
