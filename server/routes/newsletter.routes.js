const express = require('express');
const router = express.Router();
const {
  createSubscriber,
  getSubscribers,
  deleteSubscriber,
  broadcastNewsletter,
} = require('../controllers/newsletter.controller');
const {
  authMiddleware,
  requireAdmin,
} = require('../middleware/auth.middleware');
const rateLimiter = require('../middleware/rateLimiter');

// Limit newsletter subscription: max 5 requests per 15 minutes per IP
const subscribeLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message:
    'Terlalu banyak percobaan pendaftaran email. Silakan coba lagi nanti.',
});

router.post('/', subscribeLimiter, createSubscriber);
router.get('/', authMiddleware, requireAdmin, getSubscribers);
router.delete('/:id', authMiddleware, requireAdmin, deleteSubscriber);
router.post('/broadcast', authMiddleware, requireAdmin, broadcastNewsletter);

module.exports = router;
