const express = require('express');
const router = express.Router();
const {
  getSettings,
  updateSettings,
} = require('../controllers/settings.controller');
const {
  authMiddleware,
  requireAdmin,
} = require('../middleware/auth.middleware');

router.get('/', getSettings);
router.put('/', authMiddleware, requireAdmin, updateSettings);

module.exports = router;
