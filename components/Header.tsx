import React from 'react';
import { SignInButton, SignOutButton, useUser } from '@clerk/clerk-react';
import type { User } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { MasterBallIcon } from './Icons';
import { Button } from './ui';
import LanguageSelector from './LanguageSelector';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  onProfileClick?: () => void;
  displayName?: string | null;
}

const Header: React.FC<HeaderProps> = ({
  user,
  onLogout,
  onProfileClick,
  displayName
}) => {
  const { user: clerkUser } = useUser();
  const { t } = useLanguage();

  return (
    <header className="bg-gray-800/80 backdrop-blur-sm shadow-lg fixed md:sticky top-0 left-0 right-0 z-50">
      <div className="w-full md:container mx-auto px-2 md:px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="flex-shrink-0 h-6 w-6 sm:h-8 sm:w-8">
              <MasterBallIcon className="w-full h-full" />
            </div>
            <h1 className="text-base sm:text-xl font-bold text-yellow-400">
              {t('shiny_tracker_title')}
            </h1>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Trainer Name */}
            {clerkUser && (
              <span className="hidden md:block text-gray-300 text-sm">
                {t('trainer')}: <span className="font-semibold text-white">
                  {displayName || clerkUser.username || clerkUser.firstName || 'Trainer'}
                </span>
              </span>
            )}

            {/* Ko-fi */}
            <a
              href="https://ko-fi.com/xalarian"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-yellow-400 transition-colors duration-200"
              aria-label="Support on Ko-fi"
              title="Support on Ko-fi"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.831 6.649-6.916zm-11.062 3.511c-1.246 1.453-4.011 3.976-4.011 3.976s-.121.119-.31.023c-.076-.057-.108-.09-.108-.09-.443-.441-3.368-3.049-4.034-3.954-.709-.965-1.041-2.7-.091-3.71.951-1.01 3.005-1.086 4.363.407 0 0 1.565-1.782 3.468-.963 1.904.82 1.832 3.011.723 4.311zm6.173.478c-.928.116-1.682.028-1.682.028V7.284h1.77s1.971.551 1.971 2.638c0 1.913-.985 2.667-2.059 3.015z" />
              </svg>
            </a>

            {/* Language Selector */}
            <LanguageSelector />

            {/* Profile Button */}
            {clerkUser && onProfileClick && (
              <Button
                variant="secondary"
                onClick={onProfileClick}
                className="flex items-center space-x-1 sm:space-x-2"
              >
                <span>👤</span>
                <span className="hidden sm:inline">{t('profile')}</span>
              </Button>
            )}

            {/* Login/Logout Button */}
            {clerkUser ? (
              <SignOutButton>
                <Button variant="destructive" size="sm">
                  {t('logout')}
                </Button>
              </SignOutButton>
            ) : (
              <SignInButton mode="modal">
                <Button size="sm">
                  {t('login')}
                </Button>
              </SignInButton>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
