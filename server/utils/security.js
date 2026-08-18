const mongoose = require('mongoose');

/**
 * Validate whether a string is a valid 24-hex-character MongoDB ObjectId
 * @param {string|any} id
 * @returns {boolean}
 */
const isValidObjectId = (id) => {
  if (!id || typeof id !== 'string') return false;
  return mongoose.Types.ObjectId.isValid(id) && /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Sanitize string by stripping dangerous scripts, event handlers, and pseudo-protocols
 * @param {string} str
 * @returns {string}
 */
const sanitizeInput = (str = '') => {
  if (typeof str !== 'string') return str;
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/data\s*:\s*text\/html/gi, '')
    .trim();
};

/**
 * Recursively sanitize string values in an object or array
 * @param {any} data
 * @returns {any}
 */
const sanitizeObject = (data) => {
  if (!data || typeof data !== 'object') {
    return typeof data === 'string' ? sanitizeInput(data) : data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeObject(item));
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(data)) {
    // Prevent prototype pollution
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue;
    }
    sanitized[key] = sanitizeObject(value);
  }
  return sanitized;
};

/**
 * Safe error message formatter to avoid leaking internal database details or stack traces
 * @param {Error} err
 * @param {string} fallbackMsg
 * @returns {string}
 */
const safeErrorMessage = (
  err,
  fallbackMsg = 'Terjadi kesalahan pada server.'
) => {
  if (process.env.NODE_ENV !== 'production' && err && err.message) {
    return err.message;
  }
  return fallbackMsg;
};

module.exports = {
  isValidObjectId,
  sanitizeInput,
  sanitizeObject,
  safeErrorMessage,
};
