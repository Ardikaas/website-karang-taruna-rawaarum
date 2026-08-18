const express = require('express');
const router = express.Router();
const {
  getPartners,
  createPartner,
  updatePartner,
  deletePartner,
} = require('../controllers/partner.controller');
const {
  authMiddleware,
  requireAdmin,
} = require('../middleware/auth.middleware');

router.get('/', getPartners);
router.post('/', authMiddleware, requireAdmin, createPartner);
router.put('/:id', authMiddleware, requireAdmin, updatePartner);
router.delete('/:id', authMiddleware, requireAdmin, deletePartner);

module.exports = router;
