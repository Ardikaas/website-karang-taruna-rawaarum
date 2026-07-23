const Program = require('../models/Program');

const getPrograms = async (req, res) => {
  try {
    const list = await Program.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createProgram = async (req, res) => {
  try {
    const { title, category, description, icon, target, status } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: 'Judul dan deskripsi program kerja wajib diisi.' });
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
    res.status(400).json({ error: err.message });
  }
};

const updateProgram = async (req, res) => {
  try {
    const updated = await Program.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ error: 'Program tidak ditemukan.' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const deleteProgram = async (req, res) => {
  try {
    const deleted = await Program.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Program tidak ditemukan.' });
    res.json({ message: 'Program kerja berhasil dihapus.', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getPrograms, createProgram, updateProgram, deleteProgram };
