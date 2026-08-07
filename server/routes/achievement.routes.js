const express = require('express');
const router = express.Router();
const {
  getActiveAchievements,
  getAllAchievements,
  createAchievement,
  updateAchievement,
  toggleAchievementStatus,
  deleteAchievement,
} = require('../controllers/achievement.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Public route for Home Page banner
router.get('/active', getActiveAchievements);

// Protected Admin / Pengurus routes
router.get('/', verifyToken, getAllAchievements);
router.post('/', verifyToken, createAchievement);
router.put('/:id', verifyToken, updateAchievement);
router.patch('/:id/toggle', verifyToken, toggleAchievementStatus);
router.delete('/:id', verifyToken, deleteAchievement);

module.exports = router;
