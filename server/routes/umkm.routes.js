const express = require('express');
const router = express.Router();
const {
  getUmkms,
  getUmkmById,
  incrementUmkmViewCount,
  incrementUmkmClickCount,
  createUmkm,
  updateUmkm,
  deleteUmkm,
  toggleVerifyUmkm,
} = require('../controllers/umkm.controller');
const {
  verifyToken,
  requireRole,
  requireAdmin,
} = require('../middleware/auth.middleware');
const { viewClickLimiter } = require('../middleware/rateLimiter');

const allowedUmkmRoles = requireRole('superadmin', 'admin', 'pengurus');

// Public endpoints with rate limiter protection
router.get('/', getUmkms);
router.get('/:id', getUmkmById);
router.post('/:id/view', viewClickLimiter, incrementUmkmViewCount);
router.post('/:id/click', viewClickLimiter, incrementUmkmClickCount);

// Protected Admin / Pengurus endpoints
router.post('/', verifyToken, allowedUmkmRoles, createUmkm);
router.put('/:id', verifyToken, allowedUmkmRoles, updateUmkm);
router.delete('/:id', verifyToken, allowedUmkmRoles, deleteUmkm);
router.patch('/:id/verify', verifyToken, requireAdmin, toggleVerifyUmkm);

module.exports = router;
