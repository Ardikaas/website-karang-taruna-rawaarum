const Program = require('../models/Program');
const {
  isValidObjectId,
  sanitizeObject,
  safeErrorMessage,
} = require('../utils/security');

const getPrograms = async (_req, res) => {
  try {
    const list = await Program.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res
      .status(500)
      .json({
        error: safeErrorMessage(err, 'Gagal mengambil data program kerja.'),
      });
  }
};

const createProgram = async (req, res) => {
  try {
    const sanitizedBody = sanitizeObject(req.body);
    const { title, category, description, icon, target, status } =
      sanitizedBody;
    if (!title || !description) {
      return res
        .status(400)
        .json({ error: 'Judul dan deskripsi program kerja wajib diisi.' });
    }
    const newDoc = new Program({
      title,
      category: category || 'Umum',
      description,
      icon: icon || 'fa-briefcase',
      target: target || 'Seluruh Pemuda Rawa Arum',
      status: status || 'Berjalan',
    });
    const saved = await newDoc.save();
    res.status(201).json(saved);
  } catch (err) {
    res
      .status(400)
      .json({ error: err.message || 'Gagal membuat program kerja.' });
  }
};

const updateProgram = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'ID program tidak valid.' });
    }

    const sanitizedBody = sanitizeObject(req.body);
    const updated = await Program.findByIdAndUpdate(id, sanitizedBody, {
      new: true,
      runValidators: true,
    });
    if (!updated)
      return res.status(404).json({ error: 'Program tidak ditemukan.' });
    res.json(updated);
  } catch (err) {
    res
      .status(400)
      .json({ error: err.message || 'Gagal memperbarui program kerja.' });
  }
};

const deleteProgram = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'ID program tidak valid.' });
    }

    const deleted = await Program.findByIdAndDelete(id);
    if (!deleted)
      return res.status(404).json({ error: 'Program tidak ditemukan.' });
    res.json({ message: 'Program kerja berhasil dihapus.', id });
  } catch (err) {
    res
      .status(500)
      .json({ error: safeErrorMessage(err, 'Gagal menghapus program kerja.') });
  }
};

module.exports = { getPrograms, createProgram, updateProgram, deleteProgram };
