import { useAuth } from '@clerk/clerk-react';
import { useEffect } from 'react';

/**
 * Hook to manage Clerk session token for API authentication
 * Stores the getToken function in window for use by API requests
 * This ensures we always get a fresh token, avoiding expiration issues
 */
export function useClerkToken() {
    const { getToken, isSignedIn } = useAuth();

    useEffect(() => {
        if (isSignedIn) {
            // Store getToken function for API requests
            // This allows API calls to always get a fresh token
            (window as any).__clerk_getToken = getToken;
        } else {
            // Clear function when user signs out
            (window as any).__clerk_getToken = null;
        }
    }, [isSignedIn, getToken]);
}
