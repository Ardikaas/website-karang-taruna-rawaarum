const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'karangtaruna_rawa_arum_secret_key_2024';

/**
 * Express middleware to verify JWT token from Authorization header.
 * Attaches decoded admin payload to req.admin if valid.
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Akses ditolak. Token tidak ditemukan.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token tidak valid atau sudah kadaluarsa.' });
  }
};

module.exports = { authMiddleware, JWT_SECRET };
