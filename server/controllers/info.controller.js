const InfoItem = require('../models/InfoItem');

/**
 * @desc    Get all info items, optionally filtered by type
 * @route   GET /api/info
 * @query   ?type=loker|umkm|kegiatan|pengumuman
 */
const getInfoItems = async (req, res) => {
  try {
    const { type } = req.query;
    const query = type && type !== 'all' ? { type } : {};
    const items = await InfoItem.find(query)
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @desc    Get a single info item by ID
 * @route   GET /api/info/:id
 */
const getInfoItemById = async (req, res) => {
  try {
    const item = await InfoItem.findById(req.params.id).populate(
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
    res.status(500).json({ error: err.message });
  }
};

/**
 * @desc    Increment view count for an info item
 * @route   POST /api/info/:id/view
 */
const incrementInfoViewCount = async (req, res) => {
  try {
    const item = await InfoItem.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewsCount: 1 } },
      { new: true }
    ).select('viewsCount');
    if (!item) {
      return res.status(404).json({ error: 'Informasi tidak ditemukan.' });
    }
    res.json({ viewsCount: item.viewsCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @desc    Create a new info item
 * @route   POST /api/info
 * @access  Protected (admin)
 */
const createInfoItem = async (req, res) => {
  try {
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
    } = req.body;

    if (!title || !description || !type || !date || !imageUrl || !badge) {
      return res
        .status(400)
        .json({ error: 'Please provide all required fields' });
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
      type,
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
    res.status(400).json({ error: err.message });
  }
};

/**
 * @desc    Update an info item by ID
 * @route   PUT /api/info/:id
 * @access  Protected (admin)
 */
const updateInfoItem = async (req, res) => {
  try {
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
    } = req.body;

    const existing = await InfoItem.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Info item tidak ditemukan.' });
    }

    // Role-based restrictions for Pengurus
    if (req.user && req.user.role === 'pengurus') {
      const allowedTypes = ['kegiatan', 'umkm'];
      if (
        !allowedTypes.includes(existing.type.toLowerCase()) ||
        !allowedTypes.includes(type.toLowerCase())
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

    const updatePayload = {
      title,
      description,
      type,
      date,
      imageUrl,
      badge,
      linkText,
    };

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

    const updated = await InfoItem.findByIdAndUpdate(
      req.params.id,
      updatePayload,
      { new: true, runValidators: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * @desc    Delete an info item by ID
 * @route   DELETE /api/info/:id
 * @access  Protected (admin)
 */
const deleteInfoItem = async (req, res) => {
  try {
    const existing = await InfoItem.findById(req.params.id);
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

    await InfoItem.findByIdAndDelete(req.params.id);

    res.json({ message: 'Info item berhasil dihapus.', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
