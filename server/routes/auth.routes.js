const express = require('express');
const router = express.Router();
const {
  login,
  refreshToken,
  logout,
  getMe,
  changePassword,
  updateProfile,
  getActivityLogs,
} = require('../controllers/auth.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const rateLimiter = require('../middleware/rateLimiter');

// Limit login attempts: max 10 login requests per 10 minutes per IP
const loginLimiter = rateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 10,
  message: 'Terlalu banyak percobaan login. Silakan coba lagi dalam 10 menit.',
});

router.post('/login', loginLimiter, login);
router.post('/refresh', refreshToken);
router.post('/logout', logout);
router.get('/me', authMiddleware, getMe);
router.put('/change-password', authMiddleware, changePassword);
router.put('/profile', authMiddleware, updateProfile);
router.get('/logs', authMiddleware, getActivityLogs);

module.exports = router;
