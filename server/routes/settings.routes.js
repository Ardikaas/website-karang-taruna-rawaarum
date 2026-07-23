const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settings.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

router.get('/', getSettings);
router.put('/', authMiddleware, updateSettings);

module.exports = router;
