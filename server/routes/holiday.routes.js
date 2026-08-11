const express = require('express');
const router = express.Router();
const {
  getActiveHolidays,
  getAllHolidays,
  createHoliday,
  updateHoliday,
  toggleHolidayStatus,
  deleteHoliday,
} = require('../controllers/holiday.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Public route for Home Page strip banner
router.get('/active', getActiveHolidays);

// Protected Admin / Pengurus routes
router.get('/', verifyToken, getAllHolidays);
router.post('/', verifyToken, createHoliday);
router.put('/:id', verifyToken, updateHoliday);
router.patch('/:id/toggle', verifyToken, toggleHolidayStatus);
router.delete('/:id', verifyToken, deleteHoliday);

module.exports = router;
