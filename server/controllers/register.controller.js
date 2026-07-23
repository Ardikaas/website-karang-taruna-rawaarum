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

/**
 * @desc    Delete a registration by ID
 * @route   DELETE /api/register/:id
 * @access  Protected (admin)
 */
const deleteRegistration = async (req, res) => {
  try {
    const deleted = await Registration.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: 'Data pendaftaran tidak ditemukan.' });
    }

    res.json({ message: 'Data pendaftaran berhasil dihapus.', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


/**
 * @desc    Update a registration status (Pending/Approved/Rejected)
 * @route   PATCH /api/register/:id/status
 * @access  Protected (admin)
 */
const updateRegistrationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !['Pending', 'Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status tidak valid. Harus Pending, Approved, atau Rejected.' });
    }

    const updated = await Registration.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Data pendaftaran tidak ditemukan.' });
    }

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  createRegistration,
  getRegistrations,
  deleteRegistration,
  updateRegistrationStatus,
};
