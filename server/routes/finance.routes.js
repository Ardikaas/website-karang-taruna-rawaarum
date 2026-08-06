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
const { authMiddleware } = require('../middleware/auth.middleware');

router.get('/', getTransactions);
router.get('/summary', getFinanceSummary);
router.get('/:id', getTransactionById);
router.post('/', authMiddleware, createTransaction);
router.put('/:id', authMiddleware, updateTransaction);
router.delete('/:id', authMiddleware, deleteTransaction);

module.exports = router;
