const express = require('express');
const router = express.Router();
const {
  getPrograms,
  createProgram,
  updateProgram,
  deleteProgram,
} = require('../controllers/program.controller');
const {
  authMiddleware,
  requireAdmin,
} = require('../middleware/auth.middleware');

router.get('/', getPrograms);
router.post('/', authMiddleware, requireAdmin, createProgram);
router.put('/:id', authMiddleware, requireAdmin, updateProgram);
router.delete('/:id', authMiddleware, requireAdmin, deleteProgram);

module.exports = router;
