import { useUser } from '@clerk/clerk-react';
import { useEffect } from 'react';

/**
 * Hook to manage Clerk session token for API authentication
 * Stores the token in window for use by API requests
 */
export function useClerkToken() {
    const { user } = useUser();

    useEffect(() => {
        async function updateToken() {
            if (user) {
                try {
                    // Get session token from Clerk
                    const session = await (user as any).getToken();
                    // Store in window for API requests
                    (window as any).__clerk_session_token = session;
                } catch (error) {
                    console.error('Error getting Clerk token:', error);
                }
            } else {
                // Clear token when user signs out
                (window as any).__clerk_session_token = null;
            }
        }

        updateToken();

        // Refresh token every 5 minutes
        const interval = setInterval(updateToken, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, [user]);

    return user;
}
