import React, { createContext, useContext, useState, ReactNode } from 'react';

type LegalPage = 'privacy' | 'terms' | null;

interface LegalModalContextType {
    currentPage: LegalPage;
    openPrivacy: () => void;
    openTerms: () => void;
    close: () => void;
}

const LegalModalContext = createContext<LegalModalContextType | undefined>(undefined);

export const LegalModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentPage, setCurrentPage] = useState<LegalPage>(null);

    const openPrivacy = () => setCurrentPage('privacy');
    const openTerms = () => setCurrentPage('terms');
    const close = () => setCurrentPage(null);

    return (
        <LegalModalContext.Provider value={{ currentPage, openPrivacy, openTerms, close }}>
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
