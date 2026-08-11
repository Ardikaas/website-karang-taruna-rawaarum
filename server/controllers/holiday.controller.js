const HolidayEvent = require('../models/HolidayEvent');

/**
 * @desc    Get all currently active holiday events (public display)
 * @route   GET /api/holidays/active
 */
const getActiveHolidays = async (req, res) => {
  try {
    const now = new Date();
    const items = await HolidayEvent.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    }).sort({ startDate: 1 });

    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @desc    Get all holiday events for admin management
 * @route   GET /api/holidays
 * @access  Protected (admin/pengurus)
 */
const getAllHolidays = async (req, res) => {
  try {
    const items = await HolidayEvent.find().sort({ startDate: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @desc    Create a new holiday event
 * @route   POST /api/holidays
 * @access  Protected (admin/pengurus)
 */
const parseStartOfDay = (dateInput) => {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return d;
  d.setHours(0, 0, 0, 0);
  return d;
};

const parseEndOfDay = (dateInput) => {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return d;
  d.setHours(23, 59, 59, 999);
  return d;
};

/**
 * @desc    Create a new holiday event
 * @route   POST /api/holidays
 * @access  Protected (admin/pengurus)
 */
const createHoliday = async (req, res) => {
  try {
    const {
      title,
      subtitle,
      startDate,
      endDate,
      theme,
      customColor,
      bannerImageUrl,
      particleImages,
      emoji,
      isActive,
    } = req.body;

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ error: 'Tanggal mulai dan tanggal selesai wajib diisi.' });
    }

    const start = parseStartOfDay(startDate);
    const end = parseEndOfDay(endDate);

    if (end < start) {
      return res
        .status(400)
        .json({ error: 'Tanggal selesai harus setelah tanggal mulai.' });
    }

    const item = new HolidayEvent({
      title: title ? title.trim() : '',
      subtitle: subtitle ? subtitle.trim() : '',
      startDate: start,
      endDate: end,
      theme: theme || 'merah-putih',
      customColor: customColor || '',
      bannerImageUrl: bannerImageUrl || '',
      particleImages: Array.isArray(particleImages) ? particleImages : [],
      emoji: emoji || '🎉',
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
 * @desc    Update a holiday event
 * @route   PUT /api/holidays/:id
 * @access  Protected (admin/pengurus)
 */
const updateHoliday = async (req, res) => {
  try {
    const {
      title,
      subtitle,
      startDate,
      endDate,
      theme,
      customColor,
      bannerImageUrl,
      particleImages,
      emoji,
      isActive,
    } = req.body;

    const item = await HolidayEvent.findById(req.params.id);
    if (!item) {
      return res
        .status(404)
        .json({ error: 'Data hari besar tidak ditemukan.' });
    }

    if (title !== undefined) item.title = title ? title.trim() : '';
    if (subtitle !== undefined) item.subtitle = subtitle ? subtitle.trim() : '';
    if (startDate !== undefined) item.startDate = parseStartOfDay(startDate);
    if (endDate !== undefined) item.endDate = parseEndOfDay(endDate);
    if (theme !== undefined) item.theme = theme;
    if (customColor !== undefined) item.customColor = customColor;
    if (bannerImageUrl !== undefined) item.bannerImageUrl = bannerImageUrl;
    if (particleImages !== undefined)
      item.particleImages = Array.isArray(particleImages) ? particleImages : [];
    if (isActive !== undefined) item.isActive = isActive;

    if (item.endDate < item.startDate) {
      return res
        .status(400)
        .json({ error: 'Tanggal selesai harus setelah tanggal mulai.' });
    }

    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @desc    Toggle active status of a holiday event
 * @route   PATCH /api/holidays/:id/toggle
 * @access  Protected (admin/pengurus)
 */
const toggleHolidayStatus = async (req, res) => {
  try {
    const item = await HolidayEvent.findById(req.params.id);
    if (!item) {
      return res
        .status(404)
        .json({ error: 'Data hari besar tidak ditemukan.' });
    }

    item.isActive = !item.isActive;
    await item.save();

    res.json({
      message: `Status hari besar berhasil diubah menjadi ${item.isActive ? 'Aktif' : 'Nonaktif'}.`,
      item,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @desc    Delete a holiday event
 * @route   DELETE /api/holidays/:id
 * @access  Protected (admin/pengurus)
 */
const deleteHoliday = async (req, res) => {
  try {
    const item = await HolidayEvent.findByIdAndDelete(req.params.id);
    if (!item) {
      return res
        .status(404)
        .json({ error: 'Data hari besar tidak ditemukan.' });
    }

    res.json({
      message: 'Data hari besar berhasil dihapus.',
      id: req.params.id,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getActiveHolidays,
  getAllHolidays,
  createHoliday,
  updateHoliday,
  toggleHolidayStatus,
  deleteHoliday,
};
