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
    const items = await InfoItem.find(query).sort({ createdAt: -1 });

    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @desc    Create a new info item
 * @route   POST /api/info
 */
const createInfoItem = async (req, res) => {
  try {
    const { title, description, type, date, imageUrl, badge, linkText } = req.body;

    if (!title || !description || !type || !date || !imageUrl || !badge) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    const newItem = new InfoItem({ title, description, type, date, imageUrl, badge, linkText });
    const savedItem = await newItem.save();

    res.status(201).json(savedItem);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  getInfoItems,
  createInfoItem,
};
