import React, { useState, useCallback, useMemo, lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ClerkProvider, SignedIn, SignedOut, useUser, useClerk } from '@clerk/clerk-react';
import ShinyTracker from './components/ShinyTracker';
import { ErrorBoundary } from './components/ErrorBoundary';
const ProfilePage = lazy(() => import('./components/ProfilePage'));
const PublicProfilePage = lazy(() => import('./components/PublicProfilePage'));
import { POKEMON_LIST as BASE_POKEMON_LIST } from './data/pokemon';
import type { Pokemon, User } from './types';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { clerkPublishableKey, clerkAppearance } from './clerk-config';
import { useMetadata } from './hooks/useMetadata';
import { useClerkToken } from './hooks/useClerkToken';
import { useSessionTimeout } from './hooks/useSessionTimeout';
import { SessionTimeoutWarning } from './components/SessionTimeoutWarning';
import { CookieConsent } from './components/CookieConsent';
import { Footer } from './components/Footer';
import { LegalModalProvider, useLegalModal } from './contexts/LegalModalContext';
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./components/TermsOfService'));
const ChangeLog = lazy(() => import('./components/ChangeLog'));

const Spinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-yellow-400" />
  </div>
);

const AppContent = () => {
  const { user: clerkUser, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [currentPage, setCurrentPage] = useState<'tracker' | 'profile'>('tracker');
  const { getPokemonName, t } = useLanguage();
  const { currentPage: legalPage } = useLegalModal();

  useMetadata();
  useClerkToken();
  const { showWarning, secondsRemaining, resetTimer } = useSessionTimeout();

  useEffect(() => {
    const handleSessionExpired = async () => {
      alert(t('sessionTimeout.sessionExpired'));
      try { await signOut(); } catch (e) { console.error(e); } finally { window.location.reload(); }
    };
    window.addEventListener('session-expired', handleSessionExpired);
    return () => window.removeEventListener('session-expired', handleSessionExpired);
  }, [signOut, t]);

  const user: User | null = useMemo(() => {
    if (!clerkUser) return null;
    return {
      email: clerkUser.primaryEmailAddress?.emailAddress || '',
      username: clerkUser.username || clerkUser.firstName || clerkUser.id,
    };
  }, [clerkUser]);

  const pokemonList: Pokemon[] = useMemo(() =>
    BASE_POKEMON_LIST.map(pokemon => ({ ...pokemon, name: getPokemonName(pokemon.id) })),
    [getPokemonName]
  );

  if (!isLoaded) return <Spinner />;

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1">
        <SignedOut>
          <ShinyTracker user={null} onLogout={() => {}} pokemonList={pokemonList} />
        </SignedOut>

        <SignedIn>
          {currentPage === 'tracker' ? (
            <ShinyTracker
              user={user}
              onLogout={() => {}}
              onProfileClick={() => setCurrentPage('profile')}
              pokemonList={pokemonList}
            />
          ) : (
            <Suspense fallback={<Spinner />}>
              <ProfilePage onBack={() => setCurrentPage('tracker')} />
            </Suspense>
          )}
        </SignedIn>
      </div>

      <Footer />
      <CookieConsent />

      {showWarning && clerkUser && (
        <SessionTimeoutWarning secondsRemaining={secondsRemaining} onStayConnected={resetTimer} />
      )}

      <Suspense fallback={null}>
        {legalPage === 'privacy' && <PrivacyPolicy />}
        {legalPage === 'terms' && <TermsOfService />}
        {legalPage === 'changelog' && <ChangeLog />}
      </Suspense>
    </div>
  );
};

const App = () => (
  <BrowserRouter>
    <LanguageProvider>
      <Routes>
        {/* Public profile — no Clerk needed */}
        <Route path="/u/:trainerId" element={
          <Suspense fallback={<Spinner />}>
            <PublicProfilePage />
          </Suspense>
        } />

        {/* Main app */}
        <Route path="/*" element={
          <ClerkProvider publishableKey={clerkPublishableKey} appearance={clerkAppearance}>
            <LegalModalProvider>
              <ErrorBoundary>
                <AppContent />
              </ErrorBoundary>
            </LegalModalProvider>
          </ClerkProvider>
        } />
      </Routes>
    </LanguageProvider>
  </BrowserRouter>
);

export default App;
