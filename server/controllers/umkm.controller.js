const Umkm = require('../models/Umkm');
const {
  isValidObjectId,
  sanitizeInput,
  sanitizeObject,
  safeErrorMessage,
} = require('../utils/security');

/**
 * @desc    Get all UMKM items with search and category filtering
 * @route   GET /api/umkm
 * @query   ?categoryType=produk|jasa &search=... &subCategory=...
 */
const getUmkms = async (req, res) => {
  try {
    const { categoryType, search, subCategory } = req.query;
    const filter = {};

    if (categoryType && categoryType !== 'all') {
      filter.categoryType = sanitizeInput(categoryType.toLowerCase());
    }

    if (subCategory && subCategory !== 'all') {
      filter.subCategory = sanitizeInput(subCategory);
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const sanitizedSearch = search
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(sanitizedSearch, 'i');
      filter.$or = [
        { title: regex },
        { description: regex },
        { ownerName: regex },
        { address: regex },
        { subCategory: regex },
      ];
    }

    const items = await Umkm.find(filter)
      .populate('ownerUser', 'name email role phone avatar')
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res
      .status(500)
      .json({ error: safeErrorMessage(err, 'Gagal mengambil data UMKM.') });
  }
};

/**
 * @desc    Get single UMKM item by ID
 * @route   GET /api/umkm/:id
 */
const getUmkmById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'ID UMKM tidak valid.' });
    }

    const item = await Umkm.findById(id)
      .populate('ownerUser', 'name email role phone avatar')
      .populate('createdBy', 'name email role');

    if (!item) {
      return res.status(404).json({ error: 'Data UMKM tidak ditemukan.' });
    }

    res.json(item);
  } catch (err) {
    res
      .status(500)
      .json({ error: safeErrorMessage(err, 'Gagal mengambil detail UMKM.') });
  }
};

/**
 * @desc    Increment view count for a single UMKM item
 * @route   POST /api/umkm/:id/view
 */
const incrementUmkmViewCount = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'ID UMKM tidak valid.' });
    }

    const item = await Umkm.findByIdAndUpdate(
      id,
      { $inc: { viewsCount: 1 } },
      { new: true }
    ).select('viewsCount');

    if (!item) {
      return res.status(404).json({ error: 'Data UMKM tidak ditemukan.' });
    }

    res.json({ viewsCount: item.viewsCount });
  } catch (err) {
    res.status(500).json({
      error: safeErrorMessage(err, 'Gagal memperbarui tayangan UMKM.'),
    });
  }
};

const sanitizeCertificationDocs = (docs) => {
  if (!Array.isArray(docs)) return [];
  return docs
    .filter(
      (doc) =>
        doc && typeof doc.fileUrl === 'string' && doc.fileUrl.trim() !== ''
    )
    .map((doc) => ({
      name: sanitizeInput(doc.name || 'Sertifikasi'),
      fileUrl: sanitizeInput(doc.fileUrl),
      type: sanitizeInput(doc.type || 'image'),
    }));
};

/**
 * @desc    Create new UMKM item
 * @route   POST /api/umkm
 */
const createUmkm = async (req, res) => {
  try {
    const sanitizedBody = sanitizeObject(req.body);
    const {
      title,
      ownerName,
      categoryType,
      subCategory,
      description,
      isVerified,
      status,
      badge,
      whatsapp,
      address,
      googleMapsUrl,
      operatingHours,
      socialInstagram,
      priceRange,
      certifications,
      imageUrl,
      images,
      itemsList,
    } = sanitizedBody;

    if (!title || !description) {
      return res
        .status(400)
        .json({ error: 'Nama Usaha dan Deskripsi wajib diisi.' });
    }

    const newUmkm = new Umkm({
      title,
      ownerName: ownerName || '',
      ownerUser: req.body.ownerUser || (req.user ? req.user._id : null),
      createdBy: req.user ? req.user._id : null,
      categoryType: categoryType || 'produk',
      subCategory: subCategory || 'Kuliner',
      description,
      isVerified: isVerified !== undefined ? isVerified : true,
      status: status || 'aktif',
      badge: badge || (categoryType === 'jasa' ? 'UMKM Jasa' : 'UMKM Produk'),
      whatsapp: whatsapp || '',
      address: address || '',
      googleMapsUrl: googleMapsUrl || '',
      operatingHours: operatingHours || '08:00 - 20:00 WIB',
      socialInstagram: socialInstagram || '',
      priceRange: priceRange || '',
      certifications: Array.isArray(certifications) ? certifications : [],
      certificationDocs: sanitizeCertificationDocs(req.body.certificationDocs),
      imageUrl: imageUrl || '/assets/potensi_umkm.png',
      images: Array.isArray(images) ? images : [],
      itemsList: Array.isArray(itemsList) ? itemsList : [],
    });

    const saved = await newUmkm.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message || 'Gagal menambahkan UMKM.' });
  }
};

/**
 * @desc    Update existing UMKM item
 * @route   PUT /api/umkm/:id
 */
const updateUmkm = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'ID UMKM tidak valid.' });
    }

    const existing = await Umkm.findById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Data UMKM tidak ditemukan.' });
    }

    // Role-based restriction for Pengurus: can only edit own UMKM
    if (req.user && req.user.role === 'pengurus') {
      const isOwner =
        (existing.createdBy &&
          existing.createdBy.toString() === req.user._id.toString()) ||
        (existing.ownerUser &&
          existing.ownerUser.toString() === req.user._id.toString());
      if (!isOwner) {
        return res.status(403).json({
          error:
            'Akses ditolak. Anda hanya diperbolehkan mengedit UMKM yang Anda daftarkan sendiri.',
        });
      }
    }

    const sanitizedBody = sanitizeObject(req.body);
    const updateData = { ...sanitizedBody };
    if (updateData.certificationDocs) {
      updateData.certificationDocs = sanitizeCertificationDocs(
        req.body.certificationDocs
      );
    }

    const updated = await Umkm.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message || 'Gagal memperbarui UMKM.' });
  }
};

/**
 * @desc    Delete UMKM item
 * @route   DELETE /api/umkm/:id
 */
const deleteUmkm = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'ID UMKM tidak valid.' });
    }

    const existing = await Umkm.findById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Data UMKM tidak ditemukan.' });
    }

    // Role-based restriction for Pengurus: can only delete own UMKM
    if (req.user && req.user.role === 'pengurus') {
      const isOwner =
        (existing.createdBy &&
          existing.createdBy.toString() === req.user._id.toString()) ||
        (existing.ownerUser &&
          existing.ownerUser.toString() === req.user._id.toString());
      if (!isOwner) {
        return res.status(403).json({
          error:
            'Akses ditolak. Anda hanya diperbolehkan menghapus UMKM yang Anda daftarkan sendiri.',
        });
      }
    }

    await Umkm.findByIdAndDelete(id);
    res.json({ message: 'Data UMKM berhasil dihapus.', id });
  } catch (err) {
    res
      .status(500)
      .json({ error: safeErrorMessage(err, 'Gagal menghapus UMKM.') });
  }
};

/**
 * @desc    Toggle verify status
 * @route   PATCH /api/umkm/:id/verify
 */
const toggleVerifyUmkm = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'ID UMKM tidak valid.' });
    }

    const item = await Umkm.findById(id);
    if (!item) {
      return res.status(404).json({ error: 'Data UMKM tidak ditemukan.' });
    }

    item.isVerified = !item.isVerified;
    await item.save();

    res.json({
      message: `Status verifikasi berhasil diubah menjadi ${item.isVerified ? 'Terverifikasi' : 'Belum Terverifikasi'}.`,
      isVerified: item.isVerified,
    });
  } catch (err) {
    res.status(500).json({
      error: safeErrorMessage(err, 'Gagal mengubah verifikasi UMKM.'),
    });
  }
};

/**
 * @desc    Increment WhatsApp click counter for UMKM and optional specific item
 * @route   POST /api/umkm/:id/click
 * @body    { itemId?: string }
 */
const incrementUmkmClickCount = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'ID UMKM tidak valid.' });
    }

    const { itemId } = req.body || {};
    const item = await Umkm.findById(id);

    if (!item) {
      return res.status(404).json({ error: 'Data UMKM tidak ditemukan.' });
    }

    item.whatsappClicksCount = (item.whatsappClicksCount || 0) + 1;

    if (itemId && isValidObjectId(itemId) && Array.isArray(item.itemsList)) {
      const targetSub = item.itemsList.id(itemId);
      if (targetSub) {
        targetSub.clicksCount = (targetSub.clicksCount || 0) + 1;
      }
    }

    await item.save();

    res.json({
      whatsappClicksCount: item.whatsappClicksCount,
      itemsList: item.itemsList,
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: safeErrorMessage(err, 'Gagal mencatat klik WhatsApp.') });
  }
};

module.exports = {
  getUmkms,
  getUmkmById,
  incrementUmkmViewCount,
  incrementUmkmClickCount,
  createUmkm,
  updateUmkm,
  deleteUmkm,
  toggleVerifyUmkm,
};
