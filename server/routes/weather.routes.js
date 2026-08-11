const express = require('express');
const router = express.Router();
const {
  getWeatherHistory,
  triggerRecord,
  clearHistory,
} = require('../controllers/weather.controller');

// GET past weather history snapshots
router.get('/history', getWeatherHistory);

// POST manual weather snapshot trigger
router.post('/record', triggerRecord);

// DELETE clear all old history snapshots
router.delete('/history', clearHistory);

module.exports = router;
