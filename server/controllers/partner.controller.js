const Partner = require('../models/Partner');

const getPartners = async (req, res) => {
  try {
    const list = await Partner.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createPartner = async (req, res) => {
  try {
    const { name, category, description, logoUrl, websiteUrl } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Nama instansi/mitra wajib diisi.' });
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
    res.status(400).json({ error: err.message });
  }
};

const updatePartner = async (req, res) => {
  try {
    const updated = await Partner.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ error: 'Data mitra tidak ditemukan.' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const deletePartner = async (req, res) => {
  try {
    const deleted = await Partner.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Data mitra tidak ditemukan.' });
    res.json({ message: 'Mitra berhasil dihapus.', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getPartners, createPartner, updatePartner, deletePartner };
