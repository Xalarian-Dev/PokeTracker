import React, { useState, useCallback, useMemo, lazy, Suspense, useEffect } from 'react';
import { ClerkProvider, SignedIn, SignedOut, useUser, useClerk } from '@clerk/clerk-react';
import ShinyTracker from './components/ShinyTracker';
import { ErrorBoundary } from './components/ErrorBoundary';
const ProfilePage = lazy(() => import('./components/ProfilePage'));
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

const AppContent = () => {
  const { user: clerkUser, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [currentPage, setCurrentPage] = useState<'tracker' | 'profile'>('tracker');
  const { getPokemonName, t } = useLanguage();
  const { currentPage: legalPage } = useLegalModal();

  // Initialize metadata management
  useMetadata();

  // Initialize Clerk token management for API authentication
  useClerkToken();

  // Initialize session timeout for authenticated users
  const { showWarning, secondsRemaining, resetTimer } = useSessionTimeout();

  // Handle session expired event from API errors
  useEffect(() => {
    const handleSessionExpired = async () => {
      // Show alert to user
      alert(t('sessionTimeout.sessionExpired'));

      // Sign out and refresh page
      try {
        await signOut();
      } catch (error) {
        console.error('Error during logout:', error);
      } finally {
        // Always refresh to clear state
        window.location.reload();
      }
    };

    window.addEventListener('session-expired', handleSessionExpired);
    return () => window.removeEventListener('session-expired', handleSessionExpired);
  }, [signOut, t]);


  // Convert Clerk user to our User type
  const user: User | null = useMemo(() => {
    if (!clerkUser) return null;
    return {
      email: clerkUser.primaryEmailAddress?.emailAddress || '',
      username: clerkUser.username || clerkUser.firstName || clerkUser.id,
    };
  }, [clerkUser]);

  const pokemonList: Pokemon[] = useMemo(() => {
    return BASE_POKEMON_LIST.map(pokemon => ({
      ...pokemon,
      name: getPokemonName(pokemon.id),
    }));
  }, [getPokemonName]);

  const handleLogout = useCallback(() => {
    // Clerk handles logout via SignOutButton in Header
  }, []);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Main Content */}
      <div className="flex-1">
        <SignedOut>
          <ShinyTracker
            user={null}
            onLogout={handleLogout}
            pokemonList={pokemonList}
          />
        </SignedOut>

        <SignedIn>
          {currentPage === 'tracker' ? (
            <ShinyTracker
              user={user}
              onLogout={handleLogout}
              onProfileClick={() => setCurrentPage('profile')}
              pokemonList={pokemonList}
            />
          ) : (
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-yellow-400"></div>
              </div>
            }>
              <ProfilePage onBack={() => setCurrentPage('tracker')} />
            </Suspense>
          )}
        </SignedIn>
      </div>

      {/* Footer */}
      <Footer />

      {/* Cookie Notice Banner (informative only) */}
      <CookieConsent />

      {/* Session Timeout Warning Modal */}
      {showWarning && clerkUser && (
        <SessionTimeoutWarning
          secondsRemaining={secondsRemaining}
          onStayConnected={resetTimer}
        />
      )}

      {/* Legal Modals */}
      <Suspense fallback={null}>
        {legalPage === 'privacy' && <PrivacyPolicy />}
        {legalPage === 'terms' && <TermsOfService />}
        {legalPage === 'changelog' && <ChangeLog />}
      </Suspense>
    </div>
  );
};


const App = () => {
  return (
    <ClerkProvider
      publishableKey={clerkPublishableKey}
      appearance={clerkAppearance}
      isSatellite={false}
    >
      <LanguageProvider>
        <LegalModalProvider>
          <ErrorBoundary>
            <AppContent />
          </ErrorBoundary>
        </LegalModalProvider>
      </LanguageProvider>
    </ClerkProvider>
  );
};

export default App;
