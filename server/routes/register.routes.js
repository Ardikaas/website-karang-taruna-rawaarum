const express = require('express');

const router = express.Router();
const { createRegistration, getRegistrations } = require('../controllers/register.controller');

router.post('/', createRegistration);
router.get('/', getRegistrations);

module.exports = router;
