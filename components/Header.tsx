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
    <header className="bg-gray-800/80 backdrop-blur-sm shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
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
