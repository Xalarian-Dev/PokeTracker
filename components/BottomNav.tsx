import React from 'react';
import { NavLink } from 'react-router-dom';
import { SignInButton, useUser } from '@clerk/react';
import { User as UserIcon } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { NAV_ITEMS } from './navItems';

const itemClass = (active: boolean) =>
    `flex flex-col items-center justify-center gap-0.5 min-h-14 w-full text-xs font-medium transition-colors ${
        active ? 'text-yellow-400' : 'text-gray-300 hover:text-white'
    }`;

/** Barre de navigation du bas, visible sur mobile uniquement (5 entrées) */
const BottomNav: React.FC = () => {
    const { t } = useLanguage();
    const { user } = useUser();

    return (
        <nav
            aria-label={t('nav_main')}
            className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-gray-800 border-t border-gray-700"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
            <ul className="grid grid-cols-5">
                {NAV_ITEMS.map(({ to, labelKey, icon: Icon, end }) => (
                    <li key={to}>
                        <NavLink to={to} end={end} className={({ isActive }) => itemClass(isActive)}>
                            <Icon className="w-5 h-5" aria-hidden="true" />
                            <span className="truncate max-w-full px-0.5">{t(labelKey)}</span>
                        </NavLink>
                    </li>
                ))}
                <li>
                    {user ? (
                        <NavLink to="/profile" className={({ isActive }) => itemClass(isActive)}>
                            <UserIcon className="w-5 h-5" aria-hidden="true" />
                            <span>{t('profile')}</span>
                        </NavLink>
                    ) : (
                        <SignInButton mode="modal">
                            <button type="button" className={itemClass(false)}>
                                <UserIcon className="w-5 h-5" aria-hidden="true" />
                                <span>{t('login')}</span>
                            </button>
                        </SignInButton>
                    )}
                </li>
            </ul>
        </nav>
    );
};

export default BottomNav;
