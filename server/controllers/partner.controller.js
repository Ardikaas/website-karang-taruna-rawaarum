const Partner = require('../models/Partner');
const {
  isValidObjectId,
  sanitizeObject,
  safeErrorMessage,
} = require('../utils/security');

const getPartners = async (_req, res) => {
  try {
    const list = await Partner.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res
      .status(500)
      .json({ error: safeErrorMessage(err, 'Gagal mengambil data mitra.') });
  }
};

const createPartner = async (req, res) => {
  try {
    const sanitizedBody = sanitizeObject(req.body);
    const { name, category, description, logoUrl, websiteUrl } = sanitizedBody;
    if (!name) {
      return res
        .status(400)
        .json({ error: 'Nama instansi/mitra wajib diisi.' });
    }
    const newDoc = new Partner({
      name,
      category: category || 'Industri & Swasta',
      description: description || '',
      logoUrl: logoUrl || '',
      websiteUrl: websiteUrl || '#',
    });
    const saved = await newDoc.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message || 'Gagal menambahkan mitra.' });
  }
};

const updatePartner = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'ID mitra tidak valid.' });
    }

    const sanitizedBody = sanitizeObject(req.body);
    const updated = await Partner.findByIdAndUpdate(id, sanitizedBody, {
      new: true,
      runValidators: true,
    });
    if (!updated)
      return res.status(404).json({ error: 'Data mitra tidak ditemukan.' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message || 'Gagal memperbarui mitra.' });
  }
};

const deletePartner = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'ID mitra tidak valid.' });
    }

    const deleted = await Partner.findByIdAndDelete(id);
    if (!deleted)
      return res.status(404).json({ error: 'Data mitra tidak ditemukan.' });
    res.json({ message: 'Mitra berhasil dihapus.', id });
  } catch (err) {
    res
      .status(500)
      .json({ error: safeErrorMessage(err, 'Gagal menghapus mitra.') });
  }
};

module.exports = { getPartners, createPartner, updatePartner, deletePartner };
