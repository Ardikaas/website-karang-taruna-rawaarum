const express = require('express');
const router = express.Router();
const {
  getPengurus,
  createPengurus,
  updatePengurus,
  deletePengurus,
  generatePengurusAccounts,
} = require('../controllers/pengurus.controller');
const {
  authMiddleware,
  requireAdmin,
} = require('../middleware/auth.middleware');

router.get('/', getPengurus);
router.post(
  '/generate-accounts',
  authMiddleware,
  requireAdmin,
  generatePengurusAccounts
);
router.post('/', authMiddleware, requireAdmin, createPengurus);
router.put('/:id', authMiddleware, requireAdmin, updatePengurus);
router.delete('/:id', authMiddleware, requireAdmin, deletePengurus);

module.exports = router;
