import React from 'react';
import { cn } from '../../utils/cn';

export type FilterChipVariant = 'filter' | 'game';

export interface FilterChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    label: string;
    isActive: boolean;
    variant?: FilterChipVariant;
}

/**
 * Composant FilterChip réutilisable pour les filtres
 * Utilisé dans SearchBar pour les filtres de génération, région et jeux
 * 
 * @example
 * <FilterChip
 *   label="Gen 1"
 *   isActive={true}
 *   variant="filter"
 *   onClick={handleClick}
 * />
 */
export const FilterChip: React.FC<FilterChipProps> = ({
    label,
    isActive,
    variant = 'filter',
    className,
    onClick,
    ...props
}) => {
    const baseClasses = "font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800";

    const variantClasses = {
        filter: cn(
            "px-2 py-1 sm:px-3 sm:py-1.5 text-xs rounded-lg focus:ring-poke-yellow",
            isActive
                ? "bg-poke-yellow text-gray-900"
                : "bg-dark-700 hover:bg-dark-600 text-white"
        ),
        game: cn(
            "px-2 py-1 text-xs rounded-full focus:ring-blue-500 whitespace-nowrap",
            isActive
                ? "bg-blue-500 text-white"
                : "bg-dark-700 hover:bg-dark-600 text-white"
        ),
    };

    return (
        <button
            onClick={onClick}
            onMouseDown={(e) => e.preventDefault()} // Prevent focus on click
            className={cn(baseClasses, variantClasses[variant], className)}
            {...props}
        >
            {label}
        </button>
    );
};

export default FilterChip;
