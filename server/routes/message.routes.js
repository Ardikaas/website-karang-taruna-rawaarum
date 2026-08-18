const express = require('express');
const router = express.Router();
const {
  createMessage,
  getMessages,
  getMessageById,
  updateMessageStatus,
  deleteMessage,
} = require('../controllers/message.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const rateLimiter = require('../middleware/rateLimiter');

// Limit contact message submissions: max 5 requests per 15 minutes per IP
const messageLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message:
    'Terlalu banyak pengiriman pesan. Silakan coba lagi beberapa saat lagi.',
});

router.post('/', messageLimiter, createMessage);
router.get('/', authMiddleware, getMessages);
router.get('/:id', authMiddleware, getMessageById);
router.put('/:id', authMiddleware, updateMessageStatus);
router.delete('/:id', authMiddleware, deleteMessage);

module.exports = router;
