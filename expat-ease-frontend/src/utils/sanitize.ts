/**
 * HTML sanitization utilities to prevent XSS attacks
 */

/**
 * Sanitizes HTML content by escaping dangerous characters
 * @param content - The content to sanitize
 * @returns Sanitized content safe for rendering
 */
export const sanitizeHtml = (content: string): string => {
    if (!content) return '';

    return content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
};

/**
 * Sanitizes text content for display
 * @param text - The text to sanitize
 * @returns Sanitized text
 */
export const sanitizeText = (text: string): string => {
    if (!text) return '';
    return sanitizeHtml(text);
};

/**
 * Validates and sanitizes user input
 * @param input - The input to validate
 * @param maxLength - Maximum allowed length
 * @returns Sanitized and validated input
 */
export const validateAndSanitizeInput = (input: string, maxLength: number = 2000): string => {
    if (!input) return '';

    // Trim whitespace
    const trimmed = input.trim();

    // Check length
    if (trimmed.length > maxLength) {
        throw new Error(`Input exceeds maximum length of ${maxLength} characters`);
    }

    // Sanitize HTML
    return sanitizeHtml(trimmed);
};

/**
 * Validates question title
 * @param title - The title to validate
 * @returns Sanitized title
 */
export const validateQuestionTitle = (title: string): string => {
    if (!title || !title.trim()) {
        throw new Error('Question title is required');
    }

    const sanitized = validateAndSanitizeInput(title, 200);

    if (sanitized.length < 5) {
        throw new Error('Question title must be at least 5 characters long');
    }

    return sanitized;
};

/**
 * Validates question content
 * @param content - The content to validate
 * @returns Sanitized content
 */
export const validateQuestionContent = (content: string): string => {
    if (!content) return '';

    return validateAndSanitizeInput(content, 2000);
};

/**
 * Validates answer content
 * @param content - The content to validate
 * @returns Sanitized content
 */
export const validateAnswerContent = (content: string): string => {
    if (!content || !content.trim()) {
        throw new Error('Answer content is required');
    }

    const sanitized = validateAndSanitizeInput(content, 2000);

    if (sanitized.length < 10) {
        throw new Error('Answer must be at least 10 characters long');
    }

    return sanitized;
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
