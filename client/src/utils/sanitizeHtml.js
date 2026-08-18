/**
 * Clean and sanitize rich HTML strings before rendering in React
 * Strips script tags, iframes, event handlers (onload, onerror, etc.),
 * and malicious javascript: pseudo-protocols to prevent Stored XSS.
 *
 * @param {string} rawHtml
 * @returns {string} Safe HTML string
 */
export const sanitizeHtml = (rawHtml = '') => {
  if (!rawHtml || typeof rawHtml !== 'string') return '';

  return rawHtml
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/<applet\b[^<]*(?:(?!<\/applet>)<[^<]*)*<\/applet>/gi, '')
    .replace(/<meta\b[^>]*>/gi, '')
    .replace(/<link\b[^>]*>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/on\w+\s*=\s*(['"]).*?\1/gi, '')
    .replace(/on\w+\s*=\s*[^>\s]+/gi, '')
    .replace(/href\s*=\s*(['"])javascript:[^'"]*\1/gi, 'href="#"')
    .replace(/src\s*=\s*(['"])javascript:[^'"]*\1/gi, 'src=""')
    .replace(/href\s*=\s*['"]?javascript:[^>\s]*/gi, 'href="#"')
    .trim();
};

export default sanitizeHtml;
