import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes
 * Combines clsx for conditional classes and tailwind-merge to handle conflicts
 * 
 * @example
 * cn('px-2 py-1', condition && 'bg-blue-500', 'text-white')
 * cn('px-2', 'px-4') // Returns 'px-4' (tailwind-merge resolves conflict)
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
