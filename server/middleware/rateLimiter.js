let rateLimitStore = {};

// Periodic garbage collection to remove expired IP keys and prevent memory leaks
setInterval(
  () => {
    const now = Date.now();
    const maxWindowMs = 60 * 60 * 1000; // 1 hour threshold for full cleanup
    for (const ip in rateLimitStore) {
      if (Object.prototype.hasOwnProperty.call(rateLimitStore, ip)) {
        rateLimitStore[ip] = rateLimitStore[ip].filter(
          (timestamp) => now - timestamp < maxWindowMs
        );
        if (rateLimitStore[ip].length === 0) {
          delete rateLimitStore[ip];
        }
      }
    }
  },
  10 * 60 * 1000
);

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
  const message =
    options.message ||
    'Terlalu banyak permintaan dari IP ini. Silakan coba beberapa saat lagi.';

  return (req, res, next) => {
    // Prefer Express req.ip (handles trust proxy setting correctly)
    const ip =
      req.ip ||
      (req.headers['x-forwarded-for']
        ? req.headers['x-forwarded-for'].split(',')[0].trim()
        : null) ||
      req.socket?.remoteAddress ||
      'unknown';
    const now = Date.now();

    if (!rateLimitStore[ip]) {
      rateLimitStore[ip] = [];
    }

    // Filter out timestamps outside the current window
    rateLimitStore[ip] = rateLimitStore[ip].filter(
      (timestamp) => now - timestamp < windowMs
    );

    if (rateLimitStore[ip].length >= max) {
      return res.status(429).json({ error: message });
    }

    rateLimitStore[ip].push(now);
    next();
  };
};

// Pre-configured rate limiters
const viewClickLimiter = rateLimiter({
  windowMs: 60 * 1000,
  max: 60,
  message: 'Terlalu banyak permintaan interaksi. Harap tunggu sebentar.',
});

const uploadLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message:
    'Batas unggah tercapai. Harap tunggu beberapa saat sebelum mengunggah kembali.',
});

module.exports = rateLimiter;
module.exports.rateLimiter = rateLimiter;
module.exports.viewClickLimiter = viewClickLimiter;
module.exports.uploadLimiter = uploadLimiter;
