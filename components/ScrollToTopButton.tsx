import React from 'react';
import { cn } from '../utils/cn';

interface ScrollToTopButtonProps {
    show: boolean;
    onClick: () => void;
    ariaLabel?: string;
}

/**
 * Composant ScrollToTopButton - Bouton flottant pour remonter en haut de page
 * 
 * @example
 * <ScrollToTopButton
 *   show={showScrollTop}
 *   onClick={scrollToTop}
 *   ariaLabel="Scroll to top"
 * />
 */
export const ScrollToTopButton: React.FC<ScrollToTopButtonProps> = ({
    show,
    onClick,
    ariaLabel = 'Scroll to top'
}) => {
    return (
        <button
            onClick={onClick}
            className={cn(
                "fixed bottom-6 right-4 md:right-6",
                "bg-poke-yellow hover:bg-poke-yellow-light text-gray-900",
                "rounded-full p-3 sm:p-4 shadow-lg",
                "transition-all duration-300 z-50",
                show
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-16 pointer-events-none"
            )}
            aria-label={ariaLabel}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 sm:h-6 sm:w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
        </button>
    );
};

export default ScrollToTopButton;
