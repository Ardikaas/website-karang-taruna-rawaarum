const express = require('express');
const router = express.Router();
const { getPartners, createPartner, updatePartner, deletePartner } = require('../controllers/partner.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

router.get('/', getPartners);
router.post('/', authMiddleware, createPartner);
router.put('/:id', authMiddleware, updatePartner);
router.delete('/:id', authMiddleware, deletePartner);

module.exports = router;
