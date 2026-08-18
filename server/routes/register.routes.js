const express = require('express');
const router = express.Router();
const {
  createRegistration,
  getRegistrations,
  deleteRegistration,
  updateRegistrationStatus,
} = require('../controllers/register.controller');
const {
  authMiddleware,
  requireAdmin,
} = require('../middleware/auth.middleware');
const rateLimiter = require('../middleware/rateLimiter');

// Limit member registration submissions: max 5 requests per 15 minutes per IP
const registerLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Terlalu banyak percobaan pendaftaran. Silakan coba lagi nanti.',
});

router.post('/', registerLimiter, createRegistration);
router.get('/', authMiddleware, requireAdmin, getRegistrations);
router.delete('/:id', authMiddleware, requireAdmin, deleteRegistration);
router.patch(
  '/:id/status',
  authMiddleware,
  requireAdmin,
  updateRegistrationStatus
);

module.exports = router;
