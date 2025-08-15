/**
 * Class Names Utility
 * Utility function for combining and merging CSS classes with Tailwind CSS
 * Based on clsx and tailwind-merge for optimal class handling
 */

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combine and merge CSS classes with Tailwind CSS optimization
 * @param inputs - CSS classes to combine
 * @returns Merged and optimized CSS class string
 * 
 * @example
 * ```tsx
 * import { cn } from '@/utils/class-names'
 * 
 * // Basic usage
 * <div className={cn('base-class', 'conditional-class')}>
 * 
 * // With conditional classes
 * <div className={cn(
 *   'base-class',
 *   isActive && 'active-class',
 *   variant === 'primary' && 'primary-class'
 * )}>
 * 
 * // With Tailwind CSS optimization
 * <div className={cn('p-4 bg-blue-500', 'p-2 bg-red-500')}>
 * // Result: 'p-2 bg-red-500' (later classes override earlier ones)
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Alias for backward compatibility
export const classNames = cn
