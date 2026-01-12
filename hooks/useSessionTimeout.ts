import { useEffect, useState, useCallback, useRef } from 'react';
import { useClerk } from '@clerk/clerk-react';

// Configuration
const INACTIVITY_TIMEOUT = 60 * 60 * 1000; // 1 hour
const WARNING_BEFORE_LOGOUT = 2 * 60 * 1000; // 2 minutes

interface UseSessionTimeoutReturn {
    showWarning: boolean;
    secondsRemaining: number;
    resetTimer: () => void;
}

/**
 * Hook to manage session timeout based on user inactivity
 * Shows a warning modal before auto-logout and refreshes the page after logout
 */
export function useSessionTimeout(): UseSessionTimeoutReturn {
    const { signOut } = useClerk();
    const [showWarning, setShowWarning] = useState(false);
    const [secondsRemaining, setSecondsRemaining] = useState(0);

    const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
    const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
    const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Clear all timers
    const clearAllTimers = useCallback(() => {
        if (inactivityTimerRef.current) {
            clearTimeout(inactivityTimerRef.current);
            inactivityTimerRef.current = null;
        }
        if (warningTimerRef.current) {
            clearTimeout(warningTimerRef.current);
            warningTimerRef.current = null;
        }
        if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
        }
    }, []);

    // Handle logout
    const handleLogout = useCallback(async () => {
        clearAllTimers();
        setShowWarning(false);

        try {
            await signOut();
            // Refresh page to clear state and show login screen
            window.location.reload();
        } catch (error) {
            console.error('Error during logout:', error);
            // Force refresh even if signOut fails
            window.location.reload();
        }
    }, [signOut, clearAllTimers]);

    // Start countdown when warning is shown
    const startCountdown = useCallback(() => {
        setSecondsRemaining(Math.floor(WARNING_BEFORE_LOGOUT / 1000));

        countdownIntervalRef.current = setInterval(() => {
            setSecondsRemaining(prev => {
                if (prev <= 1) {
                    handleLogout();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, [handleLogout]);

    // Reset the inactivity timer
    const resetTimer = useCallback(() => {
        clearAllTimers();
        setShowWarning(false);

        // Set timer to show warning
        inactivityTimerRef.current = setTimeout(() => {
            setShowWarning(true);
            startCountdown();
        }, INACTIVITY_TIMEOUT - WARNING_BEFORE_LOGOUT);

        // Set timer for final logout (backup)
        warningTimerRef.current = setTimeout(() => {
            handleLogout();
        }, INACTIVITY_TIMEOUT);
    }, [clearAllTimers, startCountdown, handleLogout]);

    // Activity event handler
    const handleActivity = useCallback(() => {
        // Only reset if not showing warning
        if (!showWarning) {
            resetTimer();
        }
    }, [showWarning, resetTimer]);

    // Setup activity listeners
    useEffect(() => {
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];

        events.forEach(event => {
            window.addEventListener(event, handleActivity);
        });

        // Start initial timer
        resetTimer();

        return () => {
            events.forEach(event => {
                window.removeEventListener(event, handleActivity);
            });
            clearAllTimers();
        };
    }, [handleActivity, resetTimer, clearAllTimers]);

    return {
        showWarning,
        secondsRemaining,
        resetTimer,
    };
}
