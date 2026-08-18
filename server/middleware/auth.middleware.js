/* eslint-disable no-console */
const jwt = require('jsonwebtoken');

if (
  process.env.NODE_ENV === 'production' &&
  (!process.env.ACCESS_TOKEN_SECRET || !process.env.REFRESH_TOKEN_SECRET)
) {
  console.error(
    'PERINGATAN KEAMANAN PRODUKSI: ACCESS_TOKEN_SECRET atau REFRESH_TOKEN_SECRET belum diatur di .env!'
  );
}

const ACCESS_TOKEN_SECRET =
  process.env.ACCESS_TOKEN_SECRET ||
  process.env.JWT_SECRET ||
  'karangtaruna_access_secret_key_2026';
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || 'karangtaruna_refresh_secret_key_2026';

/**
 * Express middleware to verify Access Token from Authorization header.
 * Attaches decoded user payload to req.user if valid.
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ error: 'Akses ditolak. Access token tidak ditemukan.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
    const userId = decoded.id || decoded._id;
    req.user = {
      ...decoded,
      id: userId,
      _id: userId,
    };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'TokenExpired',
        message: 'Access token sudah kadaluarsa.',
      });
    }
    return res
      .status(401)
      .json({ error: 'TokenInvalid', message: 'Token tidak valid.' });
  }
};

/**
 * Express middleware for Role-Based Access Control (RBAC).
 * Restricts access to specific user roles (e.g. 'admin', 'superadmin', 'pengurus').
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res
        .status(401)
        .json({ error: 'Akses ditolak. Silakan login terlebih dahulu.' });
    }
    const userRole = req.user.role || 'user';
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error:
          'Akses ditolak. Anda tidak memiliki izin untuk melakukan aksi ini.',
      });
    }
    next();
  };
};

// Shortcut for admin-only endpoints
const requireAdmin = requireRole('admin', 'superadmin');

module.exports = {
  authMiddleware,
  verifyToken: authMiddleware,
  requireRole,
  requireAdmin,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  JWT_SECRET: ACCESS_TOKEN_SECRET,
};
