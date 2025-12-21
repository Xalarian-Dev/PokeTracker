
import React from 'react';
import type { User } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface HeaderProps {
  user: User;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  const { language, setLanguage, t } = useLanguage();

  const langButtonClasses = (lang: 'fr' | 'en') => 
    `px-3 py-1 text-sm font-medium rounded-md transition-colors ${
      language === lang 
      ? 'bg-yellow-400 text-gray-900' 
      : 'bg-gray-700 hover:bg-gray-600 text-white'
    }`;

  return (
    <header className="bg-gray-800/80 backdrop-blur-sm shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
             <div className="flex-shrink-0 h-8 w-8">
                 <img src="https://www.freeiconspng.com/uploads/pokeball-pokemon-ball-png-images-4.png" alt="Pokeball"/>
            </div>
            <h1 className="text-xl font-bold text-yellow-400">{t('shiny_tracker_title')}</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="hidden sm:block text-gray-300">
              {t('trainer')}: <span className="font-semibold text-white">{user.username}</span>
            </span>
            <div className="flex items-center space-x-2 bg-gray-900/50 p-1 rounded-lg">
                <button onClick={() => setLanguage('fr')} className={langButtonClasses('fr')}>FR</button>
                <button onClick={() => setLanguage('en')} className={langButtonClasses('en')}>EN</button>
            </div>
            <button
              onClick={onLogout}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
            >
              {t('logout')}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
