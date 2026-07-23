const express = require('express');
const router = express.Router();
const { login, getMe, changePassword } = require('../controllers/auth.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const rateLimiter = require('../middleware/rateLimiter');

// Limit login attempts: max 5 login requests per 10 minutes per IP
const loginLimiter = rateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: 'Terlalu banyak percobaan login. Akun Anda ditangguhkan sementara. Silakan coba lagi dalam 10 menit.'
});

router.post('/login', loginLimiter, login);
router.get('/me', authMiddleware, getMe);
router.put('/change-password', authMiddleware, changePassword);

module.exports = router;
