import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { SignInButton, SignOutButton, useUser } from '@clerk/react';
import { User as UserIcon } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { MasterBallIcon } from './Icons';
import { Button } from './ui';
import LanguageSelector from './LanguageSelector';
import { NAV_ITEMS } from './navItems';

interface HeaderProps {
  trainerId?: string | null;
}

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `inline-flex items-center gap-2 h-10 px-3 rounded-md text-sm font-medium transition-colors ${
    isActive ? 'bg-gray-700 text-yellow-400' : 'text-gray-300 hover:text-white hover:bg-gray-700/60'
  }`;

/** En-tête : logo, navigation principale (ordinateur), langue, compte. Sur mobile la navigation est dans la barre du bas. */
const Header: React.FC<HeaderProps> = ({ trainerId }) => {
  const { user: clerkUser } = useUser();
  const { t } = useLanguage();

  return (
    <header className="bg-gray-800/95 backdrop-blur-xs shadow-lg sticky top-0 z-40">
      <div className="w-full mx-auto px-2 md:px-4 lg:px-8 max-w-7xl 2xl:max-w-[1600px]">
        <div className="flex items-center justify-between h-16 gap-2">
          <div className="flex items-center gap-4 min-w-0">
            <Link to="/" className="flex items-center gap-2 sm:gap-3 shrink-0" aria-label={t('shiny_tracker_title')}>
              <span className="shrink-0 h-6 w-6 sm:h-8 sm:w-8">
                <MasterBallIcon className="w-full h-full" />
              </span>
              <span className="text-base sm:text-xl font-bold text-yellow-400 truncate hidden sm:inline md:hidden lg:inline">{t('shiny_tracker_title')}</span>
            </Link>

            <nav aria-label={t('nav_main')} className="hidden md:block shrink-0">
              <ul className="flex items-center gap-1">
                {NAV_ITEMS.map(({ to, labelKey, icon: Icon, end }) => (
                  <li key={to}>
                    <NavLink to={to} end={end} className={navLinkClass} title={t(labelKey)} aria-label={t(labelKey)}>
                      <Icon className="w-4 h-4" aria-hidden="true" />
                      <span className="hidden 2xl:inline">{t(labelKey)}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {clerkUser && trainerId && (
              <span className="hidden xl:block shrink-0 whitespace-nowrap text-gray-300 text-sm max-w-48 truncate" title={`${t('trainer')}: ${trainerId}`}>
                {t('trainer')}: <span className="font-semibold text-yellow-400 font-mono">{trainerId}</span>
              </span>
            )}

            <a
              href="https://ko-fi.com/xalarian"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex p-2 -m-2 text-gray-300 hover:text-yellow-400 transition-colors duration-200"
              aria-label={t('support_kofi')}
              title={t('support_kofi')}
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.831 6.649-6.916zm-11.062 3.511c-1.246 1.453-4.011 3.976-4.011 3.976s-.121.119-.31.023c-.076-.057-.108-.09-.108-.09-.443-.441-3.368-3.049-4.034-3.954-.709-.965-1.041-2.7-.091-3.71.951-1.01 3.005-1.086 4.363.407 0 0 1.565-1.782 3.468-.963 1.904.82 1.832 3.011.723 4.311zm6.173.478c-.928.116-1.682.028-1.682.028V7.284h1.77s1.971.551 1.971 2.638c0 1.913-.985 2.667-2.059 3.015z" />
              </svg>
            </a>

            <LanguageSelector />

            {clerkUser && (
              <Button asChild variant="secondary" className="hidden md:inline-flex gap-2">
                <Link to="/profile" title={t('profile')} aria-label={t('profile')}>
                  <UserIcon className="w-4 h-4" aria-hidden="true" />
                  <span className="hidden 2xl:inline">{t('profile')}</span>
                </Link>
              </Button>
            )}

            {clerkUser ? (
              <SignOutButton>
                <Button variant="destructive" size="sm">{t('logout')}</Button>
              </SignOutButton>
            ) : (
              <SignInButton mode="modal">
                <Button size="sm" className="hidden md:inline-flex">{t('login')}</Button>
              </SignInButton>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
