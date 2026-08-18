const InfoItem = require('../models/InfoItem');
const {
  isValidObjectId,
  sanitizeInput,
  sanitizeObject,
  safeErrorMessage,
} = require('../utils/security');

/**
 * @desc    Get all info items, optionally filtered by type
 * @route   GET /api/info
 * @query   ?type=loker|umkm|kegiatan|pengumuman
 */
const getInfoItems = async (req, res) => {
  try {
    const { type } = req.query;
    const query = {};
    if (type && typeof type === 'string' && type !== 'all') {
      query.type = sanitizeInput(type.toLowerCase());
    }

    const items = await InfoItem.find(query)
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (err) {
    res.status(500).json({
      error: safeErrorMessage(err, 'Gagal mengambil data informasi.'),
    });
  }
};

/**
 * @desc    Get a single info item by ID
 * @route   GET /api/info/:id
 */
const getInfoItemById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'ID informasi tidak valid.' });
    }

    const item = await InfoItem.findById(id).populate(
      'createdBy',
      'name email role'
    );
    if (!item) {
      return res
        .status(404)
        .json({ error: 'Konten informasi tidak ditemukan.' });
    }
    res.json(item);
  } catch (err) {
    res.status(500).json({
      error: safeErrorMessage(err, 'Gagal mengambil detail informasi.'),
    });
  }
};

/**
 * @desc    Increment view count for an info item
 * @route   POST /api/info/:id/view
 */
const incrementInfoViewCount = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'ID informasi tidak valid.' });
    }

    const item = await InfoItem.findByIdAndUpdate(
      id,
      { $inc: { viewsCount: 1 } },
      { new: true }
    ).select('viewsCount');
    if (!item) {
      return res.status(404).json({ error: 'Informasi tidak ditemukan.' });
    }
    res.json({ viewsCount: item.viewsCount });
  } catch (err) {
    res.status(500).json({
      error: safeErrorMessage(err, 'Gagal memperbarui jumlah tayangan.'),
    });
  }
};

/**
 * @desc    Create a new info item
 * @route   POST /api/info
 * @access  Protected (admin, pengurus)
 */
const createInfoItem = async (req, res) => {
  try {
    const sanitizedBody = sanitizeObject(req.body);
    const {
      title,
      description,
      type,
      date,
      imageUrl,
      badge,
      linkText,
      contactType,
      contactUrl,
      whatsappText,
      categoryType,
      address,
      whatsapp,
      images,
      certifications,
      priceRange,
      itemsList,
    } = sanitizedBody;

    if (!title || !description || !type || !date || !imageUrl || !badge) {
      return res
        .status(400)
        .json({ error: 'Harap lengkapi semua field yang wajib diisi.' });
    }

    // Role-based restrictions: Pengurus can ONLY create 'kegiatan' and 'umkm'
    if (req.user && req.user.role === 'pengurus') {
      const allowedTypes = ['kegiatan', 'umkm'];
      if (!allowedTypes.includes(type.toLowerCase())) {
        return res.status(403).json({
          error:
            'Akses ditolak. Pengurus hanya diperbolehkan menerbitkan konten UMKM dan Kegiatan.',
        });
      }
    }

    const newItem = new InfoItem({
      title,
      description,
      type: type.toLowerCase(),
      date,
      imageUrl,
      badge,
      linkText,
      contactType: contactType || 'default',
      contactUrl: contactUrl || '',
      whatsappText: whatsappText || '',
      createdBy: req.user ? req.user.id : null,
      categoryType: categoryType || 'produk',
      address: address || '',
      whatsapp: whatsapp || '',
      images: Array.isArray(images) ? images : [],
      certifications: Array.isArray(certifications) ? certifications : [],
      priceRange: priceRange || '',
      itemsList: Array.isArray(itemsList) ? itemsList : [],
    });
    const savedItem = await newItem.save();

    res.status(201).json(savedItem);
  } catch (err) {
    res
      .status(400)
      .json({ error: err.message || 'Gagal membuat informasi baru.' });
  }
};

/**
 * @desc    Update an info item by ID
 * @route   PUT /api/info/:id
 * @access  Protected (admin, pengurus)
 */
const updateInfoItem = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'ID informasi tidak valid.' });
    }

    const sanitizedBody = sanitizeObject(req.body);
    const {
      title,
      description,
      type,
      date,
      imageUrl,
      badge,
      linkText,
      contactType,
      contactUrl,
      whatsappText,
      categoryType,
      address,
      whatsapp,
      images,
      certifications,
      priceRange,
      itemsList,
    } = sanitizedBody;

    const existing = await InfoItem.findById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Info item tidak ditemukan.' });
    }

    // Role-based restrictions for Pengurus
    if (req.user && req.user.role === 'pengurus') {
      const allowedTypes = ['kegiatan', 'umkm'];
      if (
        !allowedTypes.includes(existing.type.toLowerCase()) ||
        (type && !allowedTypes.includes(type.toLowerCase()))
      ) {
        return res.status(403).json({
          error:
            'Akses ditolak. Pengurus hanya diperbolehkan mengedit konten UMKM dan Kegiatan.',
        });
      }

      // Restrict edit to author only
      if (
        existing.createdBy &&
        existing.createdBy.toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({
          error:
            'Akses ditolak. Anda hanya diperbolehkan mengedit konten yang Anda buat sendiri.',
        });
      }
    }

    const updatePayload = {};
    if (title) updatePayload.title = title;
    if (description) updatePayload.description = description;
    if (type) updatePayload.type = type.toLowerCase();
    if (date) updatePayload.date = date;
    if (imageUrl) updatePayload.imageUrl = imageUrl;
    if (badge) updatePayload.badge = badge;
    if (linkText !== undefined) updatePayload.linkText = linkText;
    if (contactType !== undefined) updatePayload.contactType = contactType;
    if (contactUrl !== undefined) updatePayload.contactUrl = contactUrl;
    if (whatsappText !== undefined) updatePayload.whatsappText = whatsappText;
    if (categoryType !== undefined) updatePayload.categoryType = categoryType;
    if (address !== undefined) updatePayload.address = address;
    if (whatsapp !== undefined) updatePayload.whatsapp = whatsapp;
    if (images !== undefined) updatePayload.images = images;
    if (certifications !== undefined)
      updatePayload.certifications = certifications;
    if (priceRange !== undefined) updatePayload.priceRange = priceRange;
    if (itemsList !== undefined) updatePayload.itemsList = itemsList;

    const updated = await InfoItem.findByIdAndUpdate(id, updatePayload, {
      new: true,
      runValidators: true,
    });

    res.json(updated);
  } catch (err) {
    res
      .status(400)
      .json({ error: err.message || 'Gagal memperbarui informasi.' });
  }
};

/**
 * @desc    Delete an info item by ID
 * @route   DELETE /api/info/:id
 * @access  Protected (admin, pengurus)
 */
const deleteInfoItem = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'ID informasi tidak valid.' });
    }

    const existing = await InfoItem.findById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Info item tidak ditemukan.' });
    }

    // Role-based restrictions for Pengurus
    if (req.user && req.user.role === 'pengurus') {
      const allowedTypes = ['kegiatan', 'umkm'];
      if (!allowedTypes.includes(existing.type.toLowerCase())) {
        return res.status(403).json({
          error:
            'Akses ditolak. Pengurus hanya diperbolehkan menghapus konten UMKM dan Kegiatan.',
        });
      }

      // Restrict delete to author only
      if (
        existing.createdBy &&
        existing.createdBy.toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({
          error:
            'Akses ditolak. Anda hanya diperbolehkan menghapus konten yang Anda buat sendiri.',
        });
      }
    }

    await InfoItem.findByIdAndDelete(id);

    res.json({ message: 'Info item berhasil dihapus.', id });
  } catch (err) {
    res
      .status(500)
      .json({ error: safeErrorMessage(err, 'Gagal menghapus informasi.') });
  }
};

module.exports = {
  getInfoItems,
  getInfoItemById,
  incrementInfoViewCount,
  createInfoItem,
  updateInfoItem,
  deleteInfoItem,
};
