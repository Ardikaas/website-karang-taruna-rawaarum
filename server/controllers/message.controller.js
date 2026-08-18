const Message = require('../models/Message');
const {
  isValidObjectId,
  sanitizeObject,
  safeErrorMessage,
} = require('../utils/security');

/**
 * @desc    Submit a new contact message
 * @route   POST /api/messages
 * @access  Public
 */
const createMessage = async (req, res) => {
  try {
    const sanitizedBody = sanitizeObject(req.body);
    const { name, email, phone, subject, message } = sanitizedBody;

    if (!name || !email || !phone || !message) {
      return res
        .status(400)
        .json({ error: 'Mohon lengkapi semua bidang isian formulir.' });
    }

    const newMessage = new Message({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      subject: subject ? subject.trim() : 'Pertanyaan Umum',
      message: message.trim(),
    });

    const saved = await newMessage.save();
    res.status(201).json({
      message: 'Pesan Anda berhasil dikirim! Tim kami akan segera menanggapi.',
      data: saved,
    });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Gagal mengirim pesan.' });
  }
};

/**
 * @desc    Get all messages
 * @route   GET /api/messages
 * @access  Protected (admin/pengurus)
 */
const getMessages = async (req, res) => {
  try {
    const { status } = req.query;
    const query = status && status !== 'all' ? { status } : {};
    const list = await Message.find(query).sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res
      .status(500)
      .json({ error: safeErrorMessage(err, 'Gagal mengambil pesan.') });
  }
};

/**
 * @desc    Get single message by ID & mark read if unread
 * @route   GET /api/messages/:id
 * @access  Protected (admin/pengurus)
 */
const getMessageById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'ID pesan tidak valid.' });
    }

    const item = await Message.findById(id);
    if (!item) {
      return res.status(404).json({ error: 'Pesan tidak ditemukan.' });
    }

    if (item.status === 'unread') {
      item.status = 'read';
      await item.save();
    }

    res.json(item);
  } catch (err) {
    res
      .status(500)
      .json({ error: safeErrorMessage(err, 'Gagal mengambil pesan.') });
  }
};

/**
 * @desc    Update message status
 * @route   PUT /api/messages/:id
 * @access  Protected (admin/pengurus)
 */
const updateMessageStatus = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'ID pesan tidak valid.' });
    }

    const { status } = req.body;
    const allowed = ['unread', 'read', 'replied', 'archived'];

    if (!allowed.includes(status)) {
      return res.status(400).json({ error: 'Status tidak valid.' });
    }

    const updated = await Message.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Pesan tidak ditemukan.' });
    }

    res.json(updated);
  } catch (err) {
    res
      .status(400)
      .json({ error: err.message || 'Gagal mengubah status pesan.' });
  }
};

/**
 * @desc    Delete a message
 * @route   DELETE /api/messages/:id
 * @access  Protected (admin)
 */
const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'ID pesan tidak valid.' });
    }

    const deleted = await Message.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Pesan tidak ditemukan.' });
    }
    res.json({ message: 'Pesan berhasil dihapus.', id });
  } catch (err) {
    res
      .status(500)
      .json({ error: safeErrorMessage(err, 'Gagal menghapus pesan.') });
  }
};

module.exports = {
  createMessage,
  getMessages,
  getMessageById,
  updateMessageStatus,
  deleteMessage,
};
