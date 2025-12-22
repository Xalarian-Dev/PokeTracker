import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { authService } from '../services/auth';
import type { User } from '../types';
import { MasterBallIcon, FranceFlag, UKFlag, JapanFlag } from './Icons';

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [identifier, setIdentifier] = useState(''); // Email or Username for login
  const [email, setEmail] = useState(''); // For register
  const [username, setUsername] = useState(''); // For register
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { t, language, setLanguage } = useLanguage();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let user: User;
      if (isRegistering) {
        if (!email || !username || !password) {
          throw new Error('All fields are required');
        }
        user = await authService.register(email, username, password);
      } else {
        if (!identifier || !password) {
          throw new Error('All fields are required');
        }
        user = await authService.login(identifier, password);
      }
      onLogin(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth_error'));
    } finally {
      setLoading(false);
    }
  };

  const langButtonClasses = (lang: 'fr' | 'en' | 'jp') =>
    `px-2 py-1 flex items-center justify-center rounded-md transition-colors ${language === lang
      ? 'bg-yellow-400 text-gray-900 border border-yellow-500'
      : 'bg-gray-700 hover:bg-gray-600 text-white'
    }`;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 px-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-2xl shadow-lg relative">
        <div className="absolute top-4 right-4 flex space-x-2">
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

        <div className="text-center pt-4">
          <div className="flex justify-center mx-auto mb-4 h-20 w-20 text-yellow-500 animate-pulse-slow">
            <MasterBallIcon className="w-full h-full" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">
            {t('welcome_trainer')}
          </h1>
          <p className="mt-2 text-lg text-gray-400">
            {isRegistering ? t('register') : t('login_prompt')}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="bg-gray-800/50 rounded-lg p-1 space-y-4">

            {error && (
              <div className="p-3 bg-red-900/50 border border-red-700 text-red-200 rounded text-sm text-center">
                {error}
              </div>
            )}

            {isRegistering ? (
              <>
                <div>
                  <label htmlFor="email" className="sr-only">
                    {t('email_placeholder')}
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-700 bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 focus:z-10 sm:text-sm"
                    placeholder={t('email_placeholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="username" className="sr-only">
                    {t('username_placeholder')}
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-700 bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 focus:z-10 sm:text-sm"
                    placeholder={t('username_placeholder')}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </>
            ) : (
              <div>
                <label htmlFor="identifier" className="sr-only">
                  {t('identifier_placeholder')}
                </label>
                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-700 bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 focus:z-10 sm:text-sm"
                  placeholder={t('identifier_placeholder')}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
              </div>
            )}

            <div>
              <label htmlFor="password" className="sr-only">
                {t('password_placeholder')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-700 bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 focus:z-10 sm:text-sm"
                placeholder={t('password_placeholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col space-y-4">
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-gray-900 bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-yellow-500 transition-colors ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {loading ? t('loading') : (isRegistering ? t('register') : t('login'))}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError(null);
                setPassword('');
              }}
              className="text-sm text-yellow-400 hover:text-yellow-300 transition-colors"
            >
              {isRegistering ? t('switch_to_login') : t('switch_to_register')}
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
