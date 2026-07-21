const Registration = require('../models/Registration');

/**
 * @desc    Submit a new member registration
 * @route   POST /api/register
 */
const createRegistration = async (req, res) => {
  try {
    const { name, email, phone, interest, reason } = req.body;

    if (!name || !email || !phone || !interest || !reason) {
      return res.status(400).json({ error: 'Please fill in all registration fields' });
    }

    const newReg = new Registration({ name, email, phone, interest, reason });
    const savedReg = await newReg.save();

    res.status(201).json({ success: true, data: savedReg });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * @desc    Get all member registrations
 * @route   GET /api/register
 */
const getRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find().sort({ createdAt: -1 });
    res.json(registrations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createRegistration,
  getRegistrations,
};
