
import React from 'react';
import type { User } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { LuxuryBallIcon, MasterBallIcon, FranceFlag, UKFlag, JapanFlag } from './Icons';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  onLoginClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, onLoginClick }) => {
  const { language, setLanguage, t } = useLanguage();

  const langButtonClasses = (lang: 'fr' | 'en' | 'jp') =>
    `px-2 py-1 flex items-center justify-center rounded-md transition-colors ${language === lang
      ? 'bg-yellow-400 text-gray-900 border border-yellow-500'
      : 'bg-gray-700 hover:bg-gray-600 text-white'
    }`;

  return (
    <header className="bg-gray-800/80 backdrop-blur-sm shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0 h-8 w-8">
              <MasterBallIcon className="w-full h-full" />
            </div>
            <h1 className="text-xl font-bold text-yellow-400">{t('shiny_tracker_title')}</h1>
          </div>
          <div className="flex items-center space-x-4">
            {user && (
              <span className="hidden sm:block text-gray-300">
                {t('trainer')}: <span className="font-semibold text-white">{user.username}</span>
              </span>
            )}
            <div className="flex items-center space-x-2 bg-gray-900/50 p-1 rounded-lg">
              <button
                onClick={() => setLanguage('en')}
                className={langButtonClasses('en')}
                title="English"
              >
                <UKFlag className="w-6 h-4 shadow-sm" />
              </button>
              <button
                onClick={() => setLanguage('fr')}
                className={langButtonClasses('fr')}
                title="Français"
              >
                <FranceFlag className="w-6 h-4 shadow-sm" />
              </button>
              <button
                onClick={() => setLanguage('jp')}
                className={langButtonClasses('jp')}
                title="日本語"
              >
                <JapanFlag className="w-6 h-4 shadow-sm" />
              </button>
            </div>
            {user ? (
              <button
                onClick={onLogout}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
              >
                {t('logout')}
              </button>
            ) : (
              <button
                onClick={onLoginClick}
                className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-2 px-4 rounded-lg transition-colors text-sm"
              >
                {t('login')}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
