const express = require('express');
const router = express.Router();
const { getPrograms, createProgram, updateProgram, deleteProgram } = require('../controllers/program.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

router.get('/', getPrograms);
router.post('/', authMiddleware, createProgram);
router.put('/:id', authMiddleware, updateProgram);
router.delete('/:id', authMiddleware, deleteProgram);

module.exports = router;
