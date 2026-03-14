import { useAuth } from '@clerk/clerk-react';
import { useEffect } from 'react';
import { setGetTokenFn, clearGetTokenFn } from '../services/authTokenStore';

/**
 * Hook to manage Clerk session token for API authentication.
 * Stores the getToken function in a module-scoped variable (not window).
 */
export function useClerkToken() {
    const { getToken, isSignedIn } = useAuth();

    useEffect(() => {
        if (isSignedIn) {
            setGetTokenFn(getToken);
        } else {
            clearGetTokenFn();
        }
    }, [isSignedIn, getToken]);
}
