const SiteSettings = require('../models/SiteSettings');

/**
 * @desc    Get site settings (single document)
 * @route   GET /api/settings
 * @access  Public
 */
const getSettings = async (req, res) => {
  try {
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = await SiteSettings.create({
        misiList: [
          'Mewujudkan pemuda yang bertakwa, berakhlak mulia, dan berpengetahuan luas.',
          'Meningkatkan jiwa kewirausahaan dan kemandirian ekonomi pemuda kelurahan.',
          'Mendorong aksi tanggap sosial, pelestarian lingkungan, dan kemanusiaan.',
          'Mempererat tali silaturahmi dan solidaritas antar pemuda se-Kelurahan Rawa Arum.'
        ]
      });
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @desc    Update site settings
 * @route   PUT /api/settings
 * @access  Protected (admin)
 */
const updateSettings = async (req, res) => {
  try {
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = new SiteSettings(req.body);
    } else {
      Object.assign(settings, req.body);
    }
    const saved = await settings.save();
    res.json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  getSettings,
  updateSettings,
};
