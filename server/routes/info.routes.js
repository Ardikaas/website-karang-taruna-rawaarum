const express = require('express');
const router = express.Router();
const {
  getInfoItems,
  getInfoItemById,
  incrementInfoViewCount,
  createInfoItem,
  updateInfoItem,
  deleteInfoItem,
} = require('../controllers/info.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

router.get('/', getInfoItems);
router.get('/:id', getInfoItemById);
router.post('/:id/view', incrementInfoViewCount);
router.post('/', authMiddleware, createInfoItem);
router.put('/:id', authMiddleware, updateInfoItem);
router.delete('/:id', authMiddleware, deleteInfoItem);

module.exports = router;
