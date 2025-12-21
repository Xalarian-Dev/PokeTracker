
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface LoginScreenProps {
  onLogin: (username: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (username.trim()) {
      onLogin(username.trim());
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 px-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-2xl shadow-lg">
        <div className="text-center">
            <div className="flex justify-center mx-auto mb-4 h-16 w-16">
                <img src="https://www.freeiconspng.com/uploads/pokeball-pokemon-ball-png-images-4.png" alt="Pokeball"/>
            </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">
            {t('welcome_trainer')}
          </h1>
          <p className="mt-2 text-lg text-gray-400">
            {t('login_prompt')}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                {t('username_placeholder')}
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-4 border border-gray-700 bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 focus:z-10 sm:text-sm"
                placeholder={t('username_placeholder')}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-gray-900 bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-yellow-500 transition-colors"
            >
              {t('start_hunt')}
            </button>
          </div>
        </form>
         <div className="text-center text-xs text-gray-500 pt-4">
            <p><strong>{t('disclaimer').split(':')[0]}:</strong>{t('disclaimer').substring(t('disclaimer').indexOf(':') + 1)}</p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
