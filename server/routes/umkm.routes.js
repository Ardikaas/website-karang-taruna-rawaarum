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
const { verifyToken } = require('../middleware/auth.middleware');

// Public endpoints
router.get('/', getUmkms);
router.get('/:id', getUmkmById);
router.post('/:id/view', incrementUmkmViewCount);
router.post('/:id/click', incrementUmkmClickCount);

// Protected Admin / Pengurus endpoints
router.post('/', verifyToken, createUmkm);
router.put('/:id', verifyToken, updateUmkm);
router.delete('/:id', verifyToken, deleteUmkm);
router.patch('/:id/verify', verifyToken, toggleVerifyUmkm);

module.exports = router;
