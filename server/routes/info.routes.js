const express = require('express');

const router = express.Router();
const { getInfoItems, createInfoItem } = require('../controllers/info.controller');

router.get('/', getInfoItems);
router.post('/', createInfoItem);

module.exports = router;
