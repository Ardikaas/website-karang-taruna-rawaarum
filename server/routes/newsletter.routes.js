const express = require('express');
const router = express.Router();
const { createSubscriber, getSubscribers, deleteSubscriber, broadcastNewsletter } = require('../controllers/newsletter.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

router.post('/', createSubscriber);
router.get('/', authMiddleware, getSubscribers);
router.delete('/:id', authMiddleware, deleteSubscriber);
router.post('/broadcast', authMiddleware, broadcastNewsletter);

module.exports = router;
