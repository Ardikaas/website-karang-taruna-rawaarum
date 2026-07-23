const express = require('express');
const router = express.Router();
const { createRegistration, getRegistrations, deleteRegistration, updateRegistrationStatus } = require('../controllers/register.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

router.post('/', createRegistration);
router.get('/', authMiddleware, getRegistrations);
router.delete('/:id', authMiddleware, deleteRegistration);
router.patch('/:id/status', authMiddleware, updateRegistrationStatus);

module.exports = router;
