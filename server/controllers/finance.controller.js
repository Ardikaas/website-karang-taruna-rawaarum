const Finance = require('../models/Finance');
const FinanceAuditLog = require('../models/FinanceAuditLog');
const {
  isValidObjectId,
  sanitizeInput,
  sanitizeObject,
  safeErrorMessage,
} = require('../utils/security');

/**
 * @desc    Get financial transactions list with optional filter & search
 * @route   GET /api/finance
 * @query   ?type=pemasukan|pengeluaran&category=...&search=...
 */
const getTransactions = async (req, res) => {
  try {
    const { type, category, search } = req.query;
    const filter = {};

    if (type && type !== 'all') {
      filter.type = sanitizeInput(type.toLowerCase());
    }

    if (category && category !== 'all') {
      filter.category = sanitizeInput(category);
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const sanitizedSearch = search
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { title: { $regex: sanitizedSearch, $options: 'i' } },
        { description: { $regex: sanitizedSearch, $options: 'i' } },
        { category: { $regex: sanitizedSearch, $options: 'i' } },
      ];
    }

    const items = await Finance.find(filter).sort({ date: -1, createdAt: -1 });
    res.json(items);
  } catch (err) {
    res
      .status(500)
      .json({ error: safeErrorMessage(err, 'Gagal mengambil data keuangan.') });
  }
};

/**
 * @desc    Get summary statistics (Total Pemasukan, Total Pengeluaran, Saldo Kas)
 * @route   GET /api/finance/summary
 */
const getFinanceSummary = async (_req, res) => {
  try {
    const items = await Finance.find();

    let totalIncome = 0;
    let totalExpense = 0;
    const categoryBreakdown = {};

    items.forEach((item) => {
      // Strict Integer Arithmetic for IDR Currency (Prevents JS Floating-Point Inaccuracies)
      const amt = Math.round(Math.abs(Number(item.amount) || 0));
      if (item.type === 'pemasukan') {
        totalIncome += amt;
      } else if (item.type === 'pengeluaran') {
        totalExpense += amt;
      }

      if (!categoryBreakdown[item.category]) {
        categoryBreakdown[item.category] = { income: 0, expense: 0, count: 0 };
      }
      categoryBreakdown[item.category].count += 1;
      if (item.type === 'pemasukan') {
        categoryBreakdown[item.category].income += amt;
      } else {
        categoryBreakdown[item.category].expense += amt;
      }
    });

    const balance = totalIncome - totalExpense;

    res.json({
      totalIncome,
      totalExpense,
      balance,
      totalCount: items.length,
      categoryBreakdown,
    });
  } catch (err) {
    res.status(500).json({
      error: safeErrorMessage(err, 'Gagal menghitung ringkasan keuangan.'),
    });
  }
};

/**
 * @desc    Get single transaction by ID
 * @route   GET /api/finance/:id
 */
const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'ID transaksi tidak valid.' });
    }

    const item = await Finance.findById(id);
    if (!item) {
      return res
        .status(404)
        .json({ error: 'Data transaksi kas tidak ditemukan.' });
    }
    res.json(item);
  } catch (err) {
    res.status(500).json({
      error: safeErrorMessage(err, 'Gagal mengambil data transaksi.'),
    });
  }
};

/**
 * @desc    Create new financial transaction entry with Developer Forensic Audit Log
 * @route   POST /api/finance
 * @access  Protected (admin, pengurus)
 */
const createTransaction = async (req, res) => {
  try {
    const sanitizedBody = sanitizeObject(req.body);
    const {
      title,
      type,
      amount,
      date,
      category,
      description,
      proofUrl,
      proofName,
      recordedBy,
    } = sanitizedBody;

    if (!title || !type || amount === undefined || amount === null) {
      return res.status(400).json({
        error:
          'Judul, tipe transaksi (pemasukan/pengeluaran), dan nominal wajib diisi.',
      });
    }

    const editorInfo =
      recordedBy ||
      (req.user
        ? `${req.user.name} (${req.user.role})`
        : 'Bendahara Karang Taruna');
    const clientIp =
      req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';

    const initialLog = {
      action: 'CREATE',
      editorName: editorInfo,
      deviceInfo: recordedBy || 'Perangkat terautentikasi',
      changesSummary: `Pencatatan awal: [Tipe: ${type.toUpperCase()}] | [Nominal: Rp ${Number(amount).toLocaleString('id-ID')}] | [Judul: "${title}"] | [Kategori: "${category || 'Kas Rutin'}"]`,
      timestamp: new Date(),
    };

    const newRecord = new Finance({
      title,
      type: type.toLowerCase(),
      amount: Math.abs(Number(amount)),
      date: date ? new Date(date) : new Date(),
      category: category || 'Kas Rutin',
      description: description || '',
      proofUrl: proofUrl || '',
      proofName: proofName || 'Bukti Transaksi',
      recordedBy: editorInfo,
      editHistory: [initialLog],
    });

    const saved = await newRecord.save();

    // Write to Developer-Only Anti-Corruption Forensic Database Collection
    try {
      await FinanceAuditLog.create({
        originalTransactionId: saved._id,
        action: 'CREATE',
        performedBy: editorInfo,
        deviceMetadata: recordedBy || 'Perangkat terautentikasi',
        clientIp,
        userAgent,
        changesSummary: `MEMBUAT TRANSAKSI BARU: ${type.toUpperCase()} Rp ${Number(amount).toLocaleString('id-ID')} - "${title}" (Kategori: ${category || 'Kas Rutin'})`,
        fieldDiffs: [
          { field: 'title', oldValue: null, newValue: title },
          { field: 'type', oldValue: null, newValue: type.toLowerCase() },
          { field: 'amount', oldValue: null, newValue: Number(amount) },
          {
            field: 'category',
            oldValue: null,
            newValue: category || 'Kas Rutin',
          },
          { field: 'description', oldValue: null, newValue: description || '' },
          {
            field: 'hasProofPhoto',
            oldValue: false,
            newValue: Boolean(proofUrl),
          },
        ],
        transactionSnapshot: saved.toObject(),
        timestamp: new Date(),
      });
    } catch (_auditErr) {
      // Silent error fallback for audit log
    }

    res.status(201).json(saved);
  } catch (err) {
    res
      .status(400)
      .json({ error: err.message || 'Gagal menyimpan transaksi.' });
  }
};

/**
 * @desc    Update financial transaction with Automatic System Audit Logging & Developer Forensic Archive
 * @route   PUT /api/finance/:id
 * @access  Protected (admin, pengurus)
 */
const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'ID transaksi tidak valid.' });
    }

    const sanitizedBody = sanitizeObject(req.body);
    const {
      title,
      type,
      amount,
      date,
      category,
      description,
      proofUrl,
      proofName,
      recordedBy,
    } = sanitizedBody;

    const existing = await Finance.findById(id);
    if (!existing) {
      return res
        .status(404)
        .json({ error: 'Data transaksi kas tidak ditemukan.' });
    }

    const editorInfo =
      recordedBy ||
      (req.user
        ? `${req.user.name} (${req.user.role})`
        : 'Bendahara Karang Taruna');
    const clientIp =
      req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';

    // Calculate detailed field differences for audit trail
    const changes = [];
    const fieldDiffs = [];

    if (title !== undefined && title !== existing.title) {
      changes.push(`Judul: "${existing.title}" -> "${title}"`);
      fieldDiffs.push({
        field: 'title',
        oldValue: existing.title,
        newValue: title,
      });
    }
    if (type !== undefined && type.toLowerCase() !== existing.type) {
      changes.push(
        `Tipe: ${existing.type.toUpperCase()} -> ${type.toUpperCase()}`
      );
      fieldDiffs.push({
        field: 'type',
        oldValue: existing.type,
        newValue: type.toLowerCase(),
      });
    }
    if (amount !== undefined && Number(amount) !== existing.amount) {
      changes.push(
        `Nominal: Rp ${existing.amount.toLocaleString('id-ID')} -> Rp ${Number(amount).toLocaleString('id-ID')}`
      );
      fieldDiffs.push({
        field: 'amount',
        oldValue: existing.amount,
        newValue: Number(amount),
      });
    }
    if (category !== undefined && category !== existing.category) {
      changes.push(`Kategori: "${existing.category}" -> "${category}"`);
      fieldDiffs.push({
        field: 'category',
        oldValue: existing.category,
        newValue: category,
      });
    }
    if (description !== undefined && description !== existing.description) {
      changes.push(`Deskripsi diubah`);
      fieldDiffs.push({
        field: 'description',
        oldValue: existing.description,
        newValue: description,
      });
    }
    if (proofUrl !== undefined && proofUrl !== existing.proofUrl) {
      changes.push(proofUrl ? 'Bukti nota diperbarui' : 'Bukti nota dihapus');
      fieldDiffs.push({
        field: 'proofUrl',
        oldValue: existing.proofUrl ? 'Ada Bukti' : 'Tidak Ada',
        newValue: proofUrl ? 'Ada Bukti' : 'Tidak Ada',
      });
    }

    if (changes.length > 0) {
      const logEntry = {
        action: 'UPDATE',
        editorName: editorInfo,
        deviceInfo: recordedBy || 'Perangkat terautentikasi',
        changesSummary: changes.join(' | '),
        timestamp: new Date(),
      };
      existing.editHistory = existing.editHistory || [];
      existing.editHistory.push(logEntry);
    }

    if (title !== undefined) existing.title = title;
    if (type !== undefined) existing.type = type.toLowerCase();
    if (amount !== undefined) existing.amount = Math.abs(Number(amount));
    if (date !== undefined) existing.date = new Date(date);
    if (category !== undefined) existing.category = category;
    if (description !== undefined) existing.description = description;
    if (proofUrl !== undefined) existing.proofUrl = proofUrl;
    if (proofName !== undefined) existing.proofName = proofName;
    if (recordedBy !== undefined) existing.recordedBy = recordedBy;

    const updated = await existing.save();

    // Write to Developer-Only Anti-Corruption Forensic Database Collection
    if (changes.length > 0) {
      try {
        await FinanceAuditLog.create({
          originalTransactionId: updated._id,
          action: 'UPDATE',
          performedBy: editorInfo,
          deviceMetadata: recordedBy || 'Perangkat terautentikasi',
          clientIp,
          userAgent,
          changesSummary: `MENGUBAH TRANSAKSI: ${changes.join(' | ')}`,
          fieldDiffs,
          transactionSnapshot: updated.toObject(),
          timestamp: new Date(),
        });
      } catch (_auditErr) {
        // Silent error fallback for audit log
      }
    }

    res.json(updated);
  } catch (err) {
    res
      .status(400)
      .json({ error: err.message || 'Gagal memperbarui transaksi.' });
  }
};

/**
 * @desc    Delete financial transaction with Forensic Developer-Only Database Archiving
 * @route   DELETE /api/finance/:id
 * @access  Protected (admin, pengurus)
 */
const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'ID transaksi tidak valid.' });
    }

    const existing = await Finance.findById(id);
    if (!existing) {
      return res
        .status(404)
        .json({ error: 'Data transaksi kas tidak ditemukan.' });
    }

    const deleterInfo =
      req.body?.recordedBy ||
      (req.user
        ? `${req.user.name} (${req.user.role})`
        : 'Perangkat Terautentikasi');
    const clientIp =
      req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';

    // Write Permanent Forensic Snapshot to Hidden Developer Collection BEFORE DELETION
    try {
      await FinanceAuditLog.create({
        originalTransactionId: existing._id,
        action: 'DELETE',
        performedBy: deleterInfo,
        deviceMetadata: deleterInfo,
        clientIp,
        userAgent,
        changesSummary: `MENGHAPUS PERMANEN TRANSAKSI: [Tipe: ${existing.type.toUpperCase()}] [Nominal: Rp ${existing.amount.toLocaleString('id-ID')}] [Judul: "${existing.title}"] [Kategori: "${existing.category}"] [Pencatat Asli: "${existing.recordedBy}"]`,
        fieldDiffs: [
          {
            field: 'status',
            oldValue: 'ACTIVE',
            newValue: 'DELETED_PERMANENTLY',
          },
          { field: 'deletedTitle', oldValue: existing.title, newValue: null },
          { field: 'deletedAmount', oldValue: existing.amount, newValue: 0 },
        ],
        transactionSnapshot: {
          title: existing.title,
          type: existing.type,
          amount: existing.amount,
          date: existing.date,
          category: existing.category,
          description: existing.description,
          proofUrl: existing.proofUrl,
          proofName: existing.proofName,
          recordedBy: existing.recordedBy,
          editHistory: existing.editHistory || [],
          createdAt: existing.createdAt,
          updatedAt: existing.updatedAt,
        },
        timestamp: new Date(),
      });
    } catch (_auditErr) {
      // Silent error fallback for audit log
    }

    await Finance.findByIdAndDelete(id);

    res.json({
      message:
        'Pencatatan transaksi kas berhasil dihapus dari tampilan web (Arsip Forensik Tersimpan Permanen di Database).',
      id,
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: safeErrorMessage(err, 'Gagal menghapus transaksi.') });
  }
};

module.exports = {
  getTransactions,
  getFinanceSummary,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
