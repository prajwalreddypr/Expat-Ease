/**
 * Shared utilities for forum functionality
 */

/**
 * Formats a date string to a human-readable relative time
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
};

/**
 * Gets the appropriate color classes for a category
 * @param category - The category name
 * @returns CSS classes for the category
 */
export const getCategoryColor = (category: string): string => {
    const colors: { [key: string]: string } = {
        housing: 'bg-blue-100 text-blue-800',
        banking: 'bg-green-100 text-green-800',
        legal: 'bg-purple-100 text-purple-800',
        work: 'bg-orange-100 text-orange-800',
        education: 'bg-indigo-100 text-indigo-800',
        healthcare: 'bg-red-100 text-red-800',
        transportation: 'bg-yellow-100 text-yellow-800',
        social: 'bg-pink-100 text-pink-800',
        general: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.general;
};

/**
 * Gets the display name for a user, with fallback
 * @param user - User object
 * @returns Display name
 */
export const getUserDisplayName = (user: { full_name?: string; email?: string }): string => {
    return user.full_name || user.email || 'Anonymous';
};

/**
 * Gets the first letter of a user's name for avatar
 * @param user - User object
 * @returns First letter uppercase
 */
export const getUserInitial = (user: { full_name?: string; email?: string }): string => {
    const name = getUserDisplayName(user);
    return name.charAt(0).toUpperCase();
};

/**
 * Validates category value
 * @param category - Category to validate
 * @returns Valid category or 'general' as fallback
 */
export const validateCategory = (category: string): string => {
    const validCategories = [
        'housing', 'banking', 'legal', 'work', 'education',
        'healthcare', 'transportation', 'social', 'general'
    ];
    return validCategories.includes(category) ? category : 'general';
};

/**
 * Debounce function for search input
 * @param func - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export const debounce = <T extends (...args: any[]) => any>(
    func: T,
    delay: number
): ((...args: Parameters<T>) => void) => {
    let timeoutId: number;
    return (...args: Parameters<T>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
};
