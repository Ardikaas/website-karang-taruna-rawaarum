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

router.post('/', createMessage);
router.get('/', authMiddleware, getMessages);
router.get('/:id', authMiddleware, getMessageById);
router.put('/:id', authMiddleware, updateMessageStatus);
router.delete('/:id', authMiddleware, deleteMessage);

module.exports = router;
