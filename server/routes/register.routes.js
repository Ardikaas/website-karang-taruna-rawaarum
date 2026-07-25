const express = require('express');
const router = express.Router();
const {
  createRegistration,
  getRegistrations,
  deleteRegistration,
  updateRegistrationStatus,
} = require('../controllers/register.controller');
const {
  authMiddleware,
  requireAdmin,
} = require('../middleware/auth.middleware');

router.post('/', createRegistration);
router.get('/', authMiddleware, requireAdmin, getRegistrations);
router.delete('/:id', authMiddleware, requireAdmin, deleteRegistration);
router.patch(
  '/:id/status',
  authMiddleware,
  requireAdmin,
  updateRegistrationStatus
);

module.exports = router;
