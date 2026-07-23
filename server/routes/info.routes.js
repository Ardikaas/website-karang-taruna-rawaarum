const express = require('express');
const router = express.Router();
const { getInfoItems, createInfoItem, updateInfoItem, deleteInfoItem } = require('../controllers/info.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

router.get('/', getInfoItems);
router.post('/', authMiddleware, createInfoItem);
router.put('/:id', authMiddleware, updateInfoItem);
router.delete('/:id', authMiddleware, deleteInfoItem);

module.exports = router;
