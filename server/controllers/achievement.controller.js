const Achievement = require('../models/Achievement');
const {
  isValidObjectId,
  sanitizeObject,
  safeErrorMessage,
} = require('../utils/security');

/**
 * @desc    Get all active achievements for public display (Home Banner Carousel)
 * @route   GET /api/achievements/active
 */
const getActiveAchievements = async (_req, res) => {
  try {
    const items = await Achievement.find({ isActive: true }).sort({
      createdAt: -1,
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({
      error: safeErrorMessage(err, 'Gagal mengambil apresiasi aktif.'),
    });
  }
};

/**
 * @desc    Get all achievements for Admin management
 * @route   GET /api/achievements
 * @access  Protected (admin/pengurus)
 */
const getAllAchievements = async (_req, res) => {
  try {
    const items = await Achievement.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({
      error: safeErrorMessage(err, 'Gagal mengambil daftar apresiasi.'),
    });
  }
};

/**
 * @desc    Create a new achievement item
 * @route   POST /api/achievements
 * @access  Protected (admin/pengurus)
 */
const createAchievement = async (req, res) => {
  try {
    const sanitizedBody = sanitizeObject(req.body);
    const {
      memberName,
      title,
      category,
      message,
      imageUrl,
      date,
      whatsapp,
      isActive,
    } = sanitizedBody;

    if (!memberName || !title) {
      return res
        .status(400)
        .json({ error: 'Nama anggota dan judul pencapaian wajib diisi.' });
    }

    const item = new Achievement({
      memberName: memberName.trim(),
      title: title.trim(),
      category: category || 'prestasi',
      message: message || '',
      imageUrl: imageUrl || '',
      date: date || '',
      whatsapp: whatsapp || '',
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user ? req.user.id : null,
    });

    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res
      .status(500)
      .json({ error: safeErrorMessage(err, 'Gagal membuat apresiasi.') });
  }
};

/**
 * @desc    Update an achievement item
 * @route   PUT /api/achievements/:id
 * @access  Protected (admin/pengurus)
 */
const updateAchievement = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'ID apresiasi tidak valid.' });
    }

    const sanitizedBody = sanitizeObject(req.body);
    const {
      memberName,
      title,
      category,
      message,
      imageUrl,
      date,
      whatsapp,
      isActive,
    } = sanitizedBody;

    const item = await Achievement.findById(id);
    if (!item) {
      return res.status(404).json({ error: 'Data apresiasi tidak ditemukan.' });
    }

    if (memberName !== undefined) item.memberName = memberName.trim();
    if (title !== undefined) item.title = title.trim();
    if (category !== undefined) item.category = category;
    if (message !== undefined) item.message = message;
    if (imageUrl !== undefined) item.imageUrl = imageUrl;
    if (date !== undefined) item.date = date;
    if (whatsapp !== undefined) item.whatsapp = whatsapp;
    if (isActive !== undefined) item.isActive = isActive;

    await item.save();
    res.json(item);
  } catch (err) {
    res
      .status(500)
      .json({ error: safeErrorMessage(err, 'Gagal memperbarui apresiasi.') });
  }
};

/**
 * @desc    Toggle active status of an achievement item
 * @route   PATCH /api/achievements/:id/toggle
 * @access  Protected (admin/pengurus)
 */
const toggleAchievementStatus = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'ID apresiasi tidak valid.' });
    }

    const item = await Achievement.findById(id);
    if (!item) {
      return res.status(404).json({ error: 'Data apresiasi tidak ditemukan.' });
    }

    item.isActive = !item.isActive;
    await item.save();

    res.json({
      message: `Status apresiasi berhasil diubah menjadi ${item.isActive ? 'Aktif' : 'Nonaktif'}.`,
      item,
    });
  } catch (err) {
    res.status(500).json({
      error: safeErrorMessage(err, 'Gagal mengubah status apresiasi.'),
    });
  }
};

/**
 * @desc    Delete an achievement item
 * @route   DELETE /api/achievements/:id
 * @access  Protected (admin/pengurus)
 */
const deleteAchievement = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'ID apresiasi tidak valid.' });
    }

    const item = await Achievement.findByIdAndDelete(id);
    if (!item) {
      return res.status(404).json({ error: 'Data apresiasi tidak ditemukan.' });
    }

    res.json({
      message: 'Data apresiasi berhasil dihapus.',
      id,
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: safeErrorMessage(err, 'Gagal menghapus apresiasi.') });
  }
};

module.exports = {
  getActiveAchievements,
  getAllAchievements,
  createAchievement,
  updateAchievement,
  toggleAchievementStatus,
  deleteAchievement,
};
