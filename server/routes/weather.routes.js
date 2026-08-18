const express = require('express');
const router = express.Router();
const {
  getWeatherHistory,
  triggerRecord,
  clearHistory,
} = require('../controllers/weather.controller');
const {
  authMiddleware,
  requireAdmin,
} = require('../middleware/auth.middleware');

// GET past weather history snapshots (Public for CuacaPage)
router.get('/history', getWeatherHistory);

// POST manual weather snapshot trigger (Protected)
router.post('/record', authMiddleware, triggerRecord);

// DELETE clear all old history snapshots (Protected Admin Only)
router.delete('/history', authMiddleware, requireAdmin, clearHistory);

module.exports = router;
