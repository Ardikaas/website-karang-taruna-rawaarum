const mongoose = require('mongoose');

/**
 * Developer-Only Forensic Audit Log Schema (Anti-Corruption Ledger)
 * Stores immutable, append-only records of EVERY creation, edit, and deletion of financial transactions.
 * Accessible ONLY at the database level (MongoDB Compass / Mongo Shell / Mongoose connection) by Developer.
 */
const FinanceAuditLogSchema = new mongoose.Schema(
  {
    originalTransactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Finance',
    },
    action: {
      type: String,
      enum: ['CREATE', 'UPDATE', 'DELETE'],
      required: true,
    },
    performedBy: {
      type: String,
      required: true,
    },
    deviceMetadata: {
      type: String,
      default: '',
    },
    clientIp: {
      type: String,
      default: '',
    },
    userAgent: {
      type: String,
      default: '',
    },
    changesSummary: {
      type: String,
      required: true,
    },
    fieldDiffs: [
      {
        field: String,
        oldValue: mongoose.Schema.Types.Mixed,
        newValue: mongoose.Schema.Types.Mixed,
      },
    ],
    // Full immutable snapshot of the transaction object at the moment of action
    transactionSnapshot: {
      title: String,
      type: String,
      amount: Number,
      date: Date,
      category: String,
      description: String,
      proofUrl: String,
      proofName: String,
      recordedBy: String,
      editHistory: Array,
      createdAt: Date,
      updatedAt: Date,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('FinanceAuditLog', FinanceAuditLogSchema);
