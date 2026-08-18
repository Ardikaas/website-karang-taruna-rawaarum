const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  authMiddleware,
  requireRole,
} = require('../middleware/auth.middleware');
const { uploadLimiter } = require('../middleware/rateLimiter');

// Ensure upload directory exists
const UPLOAD_DIR = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer Storage Configuration with strict filename sanitization
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    // Sanitize extension to prevent null-byte injection and multi-extension tricks
    const rawExt = path.extname(file.originalname).toLowerCase();
    const safeExt = ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(rawExt)
      ? rawExt
      : '.png';
    cb(null, 'img-' + uniqueSuffix + safeExt);
  },
});

// File Filter Configuration (Strict image extensions and MIME types)
const fileFilter = (_req, file, cb) => {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
  ];

  const ext = path.extname(file.originalname).toLowerCase();
  const isExtValid = allowedExtensions.includes(ext);
  const isMimeValid = allowedMimes.includes(file.mimetype.toLowerCase());

  if (isExtValid && isMimeValid) {
    return cb(null, true);
  }

  cb(
    new Error(
      'Hanya file gambar resmi (jpg, jpeg, png, webp, gif) yang diperbolehkan!'
    )
  );
};

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // Max 15MB
  fileFilter,
});

const allowedUploadRoles = requireRole('superadmin', 'admin', 'pengurus');

/**
 * @desc    Upload an image
 * @route   POST /api/upload
 * @access  Protected (admin, pengurus)
 */
router.post(
  '/',
  authMiddleware,
  allowedUploadRoles,
  uploadLimiter,
  upload.single('image'),
  (req, res) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ error: 'Silakan pilih file gambar untuk di-upload.' });
      }

      // Return the relative URL path of the uploaded file
      const imageUrl = `/uploads/${req.file.filename}`;
      res.json({
        success: true,
        message: 'Gambar berhasil di-upload.',
        imageUrl,
        url: imageUrl,
      });
    } catch (_err) {
      res
        .status(500)
        .json({ error: 'Terjadi kesalahan saat mengunggah gambar.' });
    }
  },
  (error, _req, res, _next) => {
    // Handle multer error (e.g. file size exceeded or invalid MIME type)
    res
      .status(400)
      .json({ error: error.message || 'Gagal mengunggah file gambar.' });
  }
);

module.exports = router;
