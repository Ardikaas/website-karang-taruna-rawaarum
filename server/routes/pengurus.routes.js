const express = require('express');
const router = express.Router();
const { getPengurus, createPengurus, updatePengurus, deletePengurus } = require('../controllers/pengurus.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

router.get('/', getPengurus);
router.post('/', authMiddleware, createPengurus);
router.put('/:id', authMiddleware, updatePengurus);
router.delete('/:id', authMiddleware, deletePengurus);

module.exports = router;
