import { useState, useEffect } from 'react';

/**
 * Hook to detect if the current device is mobile
 * @returns true if viewport width is less than 640px (Tailwind sm breakpoint)
 */
export function useIsMobile(): boolean {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 640);
        };

        // Check on mount
        checkMobile();

        // Listen for resize events
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return isMobile;
}
