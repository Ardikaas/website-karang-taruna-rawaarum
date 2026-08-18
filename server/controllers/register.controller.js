const Registration = require('../models/Registration');
const {
  isValidObjectId,
  sanitizeObject,
  safeErrorMessage,
} = require('../utils/security');

/**
 * @desc    Submit a new member registration
 * @route   POST /api/register
 */
const createRegistration = async (req, res) => {
  try {
    const sanitizedBody = sanitizeObject(req.body);
    const { name, email, phone, interest, reason } = sanitizedBody;

    if (!name || !email || !phone || !interest || !reason) {
      return res
        .status(400)
        .json({ error: 'Harap lengkapi semua bidang isian pendaftaran.' });
    }

    const newReg = new Registration({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      interest: interest.trim(),
      reason: reason.trim(),
    });
    const savedReg = await newReg.save();

    res.status(201).json({ success: true, data: savedReg });
  } catch (err) {
    res
      .status(400)
      .json({ error: err.message || 'Gagal mengirim pendaftaran.' });
  }
};

/**
 * @desc    Get all member registrations
 * @route   GET /api/register
 */
const getRegistrations = async (_req, res) => {
  try {
    const registrations = await Registration.find().sort({ createdAt: -1 });
    res.json(registrations);
  } catch (err) {
    res
      .status(500)
      .json({
        error: safeErrorMessage(err, 'Gagal mengambil data pendaftaran.'),
      });
  }
};

/**
 * @desc    Delete a registration by ID
 * @route   DELETE /api/register/:id
 * @access  Protected (admin)
 */
const deleteRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'ID pendaftaran tidak valid.' });
    }

    const deleted = await Registration.findByIdAndDelete(id);

    if (!deleted) {
      return res
        .status(404)
        .json({ error: 'Data pendaftaran tidak ditemukan.' });
    }

    res.json({ message: 'Data pendaftaran berhasil dihapus.', id });
  } catch (err) {
    res
      .status(500)
      .json({ error: safeErrorMessage(err, 'Gagal menghapus pendaftaran.') });
  }
};

/**
 * @desc    Update a registration status (Pending/Approved/Rejected)
 * @route   PATCH /api/register/:id/status
 * @access  Protected (admin)
 */
const updateRegistrationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'ID pendaftaran tidak valid.' });
    }

    const { status } = req.body;

    if (!status || !['Pending', 'Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        error: 'Status tidak valid. Harus Pending, Approved, atau Rejected.',
      });
    }

    const updated = await Registration.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res
        .status(404)
        .json({ error: 'Data pendaftaran tidak ditemukan.' });
    }

    res.json(updated);
  } catch (err) {
    res
      .status(400)
      .json({ error: err.message || 'Gagal mengubah status pendaftaran.' });
  }
};

module.exports = {
  createRegistration,
  getRegistrations,
  deleteRegistration,
  updateRegistrationStatus,
};
