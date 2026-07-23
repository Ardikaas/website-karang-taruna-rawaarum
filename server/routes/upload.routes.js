const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authMiddleware } = require('../middleware/auth.middleware');

// Ensure upload directory exists
const UPLOAD_DIR = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'info-' + uniqueSuffix + ext);
  },
});

// File Filter Configuration (Images only)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;
  const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mime = allowedTypes.test(file.mimetype);

  if (ext && mime) {
    return cb(null, true);
  } else {
    cb(new Error('Hanya file gambar (jpg, jpeg, png, webp, gif) yang diperbolehkan!'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max 5MB
  fileFilter,
});

/**
 * @desc    Upload an image
 * @route   POST /api/upload
 * @access  Protected (admin)
 */
router.post('/', authMiddleware, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Silakan pilih file gambar untuk di-upload.' });
    }

    // Return the relative URL path of the uploaded file
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({
      success: true,
      message: 'Gambar berhasil di-upload.',
      imageUrl,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}, (error, req, res, next) => {
  // Handle multer error (e.g. file size exceeded)
  res.status(400).json({ error: error.message });
});

module.exports = router;
