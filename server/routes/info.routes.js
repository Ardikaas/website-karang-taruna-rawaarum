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
const {
  authMiddleware,
  requireRole,
} = require('../middleware/auth.middleware');
const { viewClickLimiter } = require('../middleware/rateLimiter');

const allowedInfoRoles = requireRole('superadmin', 'admin', 'pengurus');

router.get('/', getInfoItems);
router.get('/:id', getInfoItemById);
router.post('/:id/view', viewClickLimiter, incrementInfoViewCount);
router.post('/', authMiddleware, allowedInfoRoles, createInfoItem);
router.put('/:id', authMiddleware, allowedInfoRoles, updateInfoItem);
router.delete('/:id', authMiddleware, allowedInfoRoles, deleteInfoItem);

module.exports = router;
