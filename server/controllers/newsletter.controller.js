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

module.exports = {
  createSubscriber,
  getSubscribers,
};
