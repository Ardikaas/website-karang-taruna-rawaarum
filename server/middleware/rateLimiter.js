const rateLimitStore = {};

/**
 * Lightweight custom in-memory rate limiter middleware.
 * Keeps track of requests by IP address.
 * 
 * @param {Object} options 
 * @param {number} options.windowMs - Timeframe window in milliseconds (default 15 minutes)
 * @param {number} options.max - Max requests allowed per IP within the window (default 100)
 * @param {string} options.message - Error message when rate limit is exceeded
 */
const rateLimiter = (options = {}) => {
  const windowMs = options.windowMs || 15 * 60 * 1000;
  const max = options.max || 100;
  const message = options.message || 'Terlalu banyak permintaan dari IP ini. Silakan coba beberapa saat lagi.';

  return (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const now = Date.now();

    if (!rateLimitStore[ip]) {
      rateLimitStore[ip] = [];
    }

    // Filter out timestamps outside the current window
    rateLimitStore[ip] = rateLimitStore[ip].filter(timestamp => now - timestamp < windowMs);

    if (rateLimitStore[ip].length >= max) {
      return res.status(429).json({ error: message });
    }

    rateLimitStore[ip].push(now);
    next();
  };
};

module.exports = rateLimiter;
