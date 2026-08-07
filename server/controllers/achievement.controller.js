const Achievement = require('../models/Achievement');

/**
 * @desc    Get all active achievements for public display (Home Banner Carousel)
 * @route   GET /api/achievements/active
 */
const getActiveAchievements = async (req, res) => {
  try {
    const items = await Achievement.find({ isActive: true }).sort({
      createdAt: -1,
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @desc    Get all achievements for Admin management
 * @route   GET /api/achievements
 * @access  Protected (admin/pengurus)
 */
const getAllAchievements = async (req, res) => {
  try {
    const items = await Achievement.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @desc    Create a new achievement item
 * @route   POST /api/achievements
 * @access  Protected (admin/pengurus)
 */
const createAchievement = async (req, res) => {
  try {
    const {
      memberName,
      title,
      category,
      message,
      imageUrl,
      date,
      whatsapp,
      isActive,
    } = req.body;

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
    res.status(500).json({ error: err.message });
  }
};

/**
 * @desc    Update an achievement item
 * @route   PUT /api/achievements/:id
 * @access  Protected (admin/pengurus)
 */
const updateAchievement = async (req, res) => {
  try {
    const {
      memberName,
      title,
      category,
      message,
      imageUrl,
      date,
      whatsapp,
      isActive,
    } = req.body;

    const item = await Achievement.findById(req.params.id);
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
    res.status(500).json({ error: err.message });
  }
};

/**
 * @desc    Toggle active status of an achievement item
 * @route   PATCH /api/achievements/:id/toggle
 * @access  Protected (admin/pengurus)
 */
const toggleAchievementStatus = async (req, res) => {
  try {
    const item = await Achievement.findById(req.params.id);
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
    res.status(500).json({ error: err.message });
  }
};

/**
 * @desc    Delete an achievement item
 * @route   DELETE /api/achievements/:id
 * @access  Protected (admin/pengurus)
 */
const deleteAchievement = async (req, res) => {
  try {
    const item = await Achievement.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Data apresiasi tidak ditemukan.' });
    }

    res.json({
      message: 'Data apresiasi berhasil dihapus.',
      id: req.params.id,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
