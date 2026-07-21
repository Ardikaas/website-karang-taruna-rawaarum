const express = require('express');

const router = express.Router();
const { createSubscriber, getSubscribers } = require('../controllers/newsletter.controller');

router.post('/', createSubscriber);
router.get('/', getSubscribers);

module.exports = router;
