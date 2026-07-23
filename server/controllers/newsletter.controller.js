const Subscriber = require('../models/Subscriber');

/**
 * @desc    Subscribe a new email to the newsletter
 * @route   POST /api/newsletter
 */
const createSubscriber = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const existing = await Subscriber.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Email is already subscribed' });
    }

    const newSub = new Subscriber({ email });
    const savedSub = await newSub.save();

    res.status(201).json({ success: true, data: savedSub });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * @desc    Get all newsletter subscribers
 * @route   GET /api/newsletter
 */
const getSubscribers = async (req, res) => {
  try {
    const subscribers = await Subscriber.find().sort({ createdAt: -1 });
    res.json(subscribers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @desc    Delete a subscriber by ID
 * @route   DELETE /api/newsletter/:id
 * @access  Protected (admin)
 */
const deleteSubscriber = async (req, res) => {
  try {
    const deleted = await Subscriber.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: 'Subscriber tidak ditemukan.' });
    }

    res.json({ message: 'Subscriber berhasil dihapus.', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const nodemailer = require('nodemailer');

/**
 * @desc    Broadcast newsletter to all subscribers
 * @route   POST /api/newsletter/broadcast
 * @access  Protected (admin)
 */
const broadcastNewsletter = async (req, res) => {
  try {
    const { subject, content } = req.body;

    if (!subject || !content) {
      return res.status(400).json({ error: 'Subjek dan isi pesan wajib diisi.' });
    }

    const subscribers = await Subscriber.find({}, 'email');
    if (subscribers.length === 0) {
      return res.status(400).json({ error: 'Belum ada subscriber newsletter terdaftar.' });
    }

    const emailList = subscribers.map(sub => sub.email);

    // Configure Nodemailer Transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Mail Options
    const mailOptions = {
      from: `"Karang Taruna Rawa Arum" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER, // Send to self
      bcc: emailList,            // Hide recipient list from subscribers
      subject: subject,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #edf2f7; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 20px; border-bottom: 1px solid #edf2f7; padding-bottom: 20px;">
            <h2 style="color: #0b2545; margin: 0;">Karang Taruna Kelurahan Rawa Arum</h2>
            <p style="color: #f97316; font-size: 0.9rem; margin: 5px 0 0;">Update Newsletter Resmi</p>
          </div>
          <div style="line-height: 1.6; color: #2d3748; font-size: 1rem;">
            ${content.replace(/\n/g, '<br />')}
          </div>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #edf2f7; text-align: center; font-size: 0.8rem; color: #718096;">
            <p style="margin: 0;">Pesan ini dikirim secara otomatis ke pelanggan newsletter Karang Taruna Rawa Arum.</p>
            <p style="margin: 5px 0 0;">Kecamatan Grogol, Kota Cilegon, Banten &bull; © 2026</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: `Newsletter berhasil disebarkan ke ${emailList.length} subscriber.`,
      count: emailList.length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createSubscriber,
  getSubscribers,
  deleteSubscriber,
  broadcastNewsletter,
};
