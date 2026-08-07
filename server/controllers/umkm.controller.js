const Umkm = require('../models/Umkm');

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
      filter.categoryType = categoryType.toLowerCase();
    }

    if (subCategory && subCategory !== 'all') {
      filter.subCategory = subCategory;
    }

    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
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
    res.status(500).json({ error: err.message });
  }
};

/**
 * @desc    Get single UMKM item by ID
 * @route   GET /api/umkm/:id
 */
const getUmkmById = async (req, res) => {
  try {
    const item = await Umkm.findById(req.params.id)
      .populate('ownerUser', 'name email role phone avatar')
      .populate('createdBy', 'name email role');

    if (!item) {
      return res.status(404).json({ error: 'Data UMKM tidak ditemukan.' });
    }

    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @desc    Increment view count for a single UMKM item
 * @route   POST /api/umkm/:id/view
 */
const incrementUmkmViewCount = async (req, res) => {
  try {
    const item = await Umkm.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewsCount: 1 } },
      { new: true }
    ).select('viewsCount');

    if (!item) {
      return res.status(404).json({ error: 'Data UMKM tidak ditemukan.' });
    }

    res.json({ viewsCount: item.viewsCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const sanitizeCertificationDocs = (docs) => {
  if (!Array.isArray(docs)) return [];
  return docs.filter(
    (doc) => doc && typeof doc.fileUrl === 'string' && doc.fileUrl.trim() !== ''
  );
};

/**
 * @desc    Create new UMKM item
 * @route   POST /api/umkm
 */
const createUmkm = async (req, res) => {
  try {
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
    } = req.body;

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
    res.status(400).json({ error: err.message });
  }
};

/**
 * @desc    Update existing UMKM item
 * @route   PUT /api/umkm/:id
 */
const updateUmkm = async (req, res) => {
  try {
    const existing = await Umkm.findById(req.params.id);
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

    const updateData = { ...req.body };
    if (updateData.certificationDocs) {
      updateData.certificationDocs = sanitizeCertificationDocs(
        updateData.certificationDocs
      );
    }

    const updated = await Umkm.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * @desc    Delete UMKM item
 * @route   DELETE /api/umkm/:id
 */
const deleteUmkm = async (req, res) => {
  try {
    const existing = await Umkm.findById(req.params.id);
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

    await Umkm.findByIdAndDelete(req.params.id);
    res.json({ message: 'Data UMKM berhasil dihapus.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @desc    Toggle verify status
 * @route   PATCH /api/umkm/:id/verify
 */
const toggleVerifyUmkm = async (req, res) => {
  try {
    const item = await Umkm.findById(req.params.id);
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
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getUmkms,
  getUmkmById,
  incrementUmkmViewCount,
  createUmkm,
  updateUmkm,
  deleteUmkm,
  toggleVerifyUmkm,
};
