const express = require('express');
const router = express.Router();
const {
  getTransactions,
  getFinanceSummary,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} = require('../controllers/finance.controller');
const {
  authMiddleware,
  requireRole,
} = require('../middleware/auth.middleware');

const allowedFinanceRoles = requireRole('superadmin', 'admin', 'pengurus');

router.get('/', getTransactions);
router.get('/summary', getFinanceSummary);
router.get('/:id', getTransactionById);
router.post('/', authMiddleware, allowedFinanceRoles, createTransaction);
router.put('/:id', authMiddleware, allowedFinanceRoles, updateTransaction);
router.delete('/:id', authMiddleware, allowedFinanceRoles, deleteTransaction);

module.exports = router;
