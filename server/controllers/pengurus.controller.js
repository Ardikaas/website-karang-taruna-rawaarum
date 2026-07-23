const Pengurus = require('../models/Pengurus');

/**
 * @desc    Get all pengurus members
 * @route   GET /api/pengurus
 * @access  Public
 */
const getPengurus = async (req, res) => {
  try {
    const list = await Pengurus.find().sort({ category: 1, level: 1, createdAt: 1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @desc    Create a new pengurus member
 * @route   POST /api/pengurus
 * @access  Protected (admin)
 */
const createPengurus = async (req, res) => {
  try {
    const { name, role, category, level, bidangId, bidangTitle, imageUrl, isKoordinator } = req.body;

    if (!name || !role || !category) {
      return res.status(400).json({ error: 'Nama, jabatan (role), dan kategori wajib diisi.' });
    }

    const newMember = new Pengurus({
      name,
      role,
      category,
      level: level || 3,
      bidangId: bidangId || '',
      bidangTitle: bidangTitle || '',
      imageUrl: imageUrl || '',
      isKoordinator: isKoordinator || false,
    });

    const saved = await newMember.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * @desc    Update a pengurus member by ID
 * @route   PUT /api/pengurus/:id
 * @access  Protected (admin)
 */
const updatePengurus = async (req, res) => {
  try {
    const { name, role, category, level, bidangId, bidangTitle, imageUrl, isKoordinator } = req.body;

    const updated = await Pengurus.findByIdAndUpdate(
      req.params.id,
      { name, role, category, level, bidangId, bidangTitle, imageUrl, isKoordinator },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Data pengurus tidak ditemukan.' });
    }

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * @desc    Delete a pengurus member by ID
 * @route   DELETE /api/pengurus/:id
 * @access  Protected (admin)
 */
const deletePengurus = async (req, res) => {
  try {
    const deleted = await Pengurus.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: 'Data pengurus tidak ditemukan.' });
    }

    res.json({ message: 'Anggota pengurus berhasil dihapus.', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getPengurus,
  createPengurus,
  updatePengurus,
  deletePengurus,
};
