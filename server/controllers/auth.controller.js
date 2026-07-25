const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const {
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
} = require('../middleware/auth.middleware');

// Helper to generate Access Token (15 min)
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username, role: user.role || 'admin' },
    ACCESS_TOKEN_SECRET,
    { expiresIn: '15m' }
  );
};

// Helper to generate Refresh Token (7 days)
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username },
    REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );
};

/**
 * @desc    Login — returns accessToken & refreshToken
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: 'Username dan password wajib diisi.' });
    }

    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Username atau password salah.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Username atau password salah.' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Hash refresh token for DB storage
    const salt = await bcrypt.genSalt(10);
    const tokenHash = await bcrypt.hash(refreshToken, salt);

    if (!user.refreshTokens) user.refreshTokens = [];
    user.refreshTokens.push({ tokenHash, createdAt: new Date() });

    // Keep max 5 active session refresh tokens per user
    if (user.refreshTokens.length > 5) {
      user.refreshTokens = user.refreshTokens.slice(-5);
    }

    await user.save();

    res.json({
      token: accessToken, // for backward compatibility
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        username: user.username,
        name: user.name || 'Pengurus',
        role: user.role || 'admin',
        imageUrl: user.imageUrl || '',
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @desc    Refresh Token — Token Rotation Strategy
 * @route   POST /api/auth/refresh
 * @access  Public
 */
const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(401).json({ error: 'Refresh token wajib disertakan.' });
    }

    // Verify JWT payload
    let decoded;
    try {
      decoded = jwt.verify(token, REFRESH_TOKEN_SECRET);
    } catch (_err) {
      return res
        .status(401)
        .json({ error: 'Refresh token tidak valid atau sudah kadaluarsa.' });
    }

    const user = await User.findById(decoded.id);
    if (!user || !user.refreshTokens || user.refreshTokens.length === 0) {
      return res
        .status(401)
        .json({ error: 'Sesi telah berakhir, silakan login kembali.' });
    }

    // Find matched stored token hash
    let matchedTokenIndex = -1;
    for (let i = 0; i < user.refreshTokens.length; i++) {
      const isMatch = await bcrypt.compare(
        token,
        user.refreshTokens[i].tokenHash
      );
      if (isMatch) {
        matchedTokenIndex = i;
        break;
      }
    }

    if (matchedTokenIndex === -1) {
      // Security Alert: Token reuse detected! Revoke all session tokens for safety.
      user.refreshTokens = [];
      await user.save();
      return res
        .status(401)
        .json({
          error:
            'Terdeteksi penyalahgunaan token. Semua sesi telah dicabut untuk keamanan.',
        });
    }

    // Rotate tokens: generate new pair & replace used token
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    const salt = await bcrypt.genSalt(10);
    const newTokenHash = await bcrypt.hash(newRefreshToken, salt);

    user.refreshTokens[matchedTokenIndex] = {
      tokenHash: newTokenHash,
      createdAt: new Date(),
    };
    await user.save();

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @desc    Logout — revokes refresh token
 * @route   POST /api/auth/logout
 * @access  Public / Protected
 */
const logout = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;
    if (token) {
      try {
        const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET);
        const user = await User.findById(decoded.id);
        if (user && user.refreshTokens) {
          // Remove matching refresh token
          const updatedTokens = [];
          for (const rt of user.refreshTokens) {
            const isMatch = await bcrypt.compare(token, rt.tokenHash);
            if (!isMatch) updatedTokens.push(rt);
          }
          user.refreshTokens = updatedTokens;
          await user.save();
        }
      } catch (_err) {
        // Token invalid, ignore
      }
    }
    res.json({ message: 'Logout berhasil.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @desc    Verify token and return current user info
 * @route   GET /api/auth/me
 * @access  Protected
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      '-passwordHash -refreshTokens'
    );
    if (!user) {
      return res.status(404).json({ error: 'User tidak ditemukan.' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @desc    Change user password
 * @route   PUT /api/auth/change-password
 * @access  Protected
 */
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: 'Password lama dan baru wajib diisi.' });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ error: 'Password baru minimal harus 6 karakter.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User tidak ditemukan.' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Password lama salah.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    // Invalidate all existing refresh tokens on password change
    user.refreshTokens = [];
    await user.save();

    res.json({
      message: 'Password berhasil diperbarui. Silakan login kembali.',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @desc    Update user profile (Name, Username, Email, Phone, Social Media) & log activity
 * @route   PUT /api/auth/profile
 * @access  Protected
 */
const updateProfile = async (req, res) => {
  try {
    const ActivityLog = require('../models/ActivityLog');
    const { name, username, email, phone, imageUrl, socials } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User tidak ditemukan.' });
    }

    // Check username uniqueness if changed
    if (username && username.toLowerCase() !== user.username) {
      const existing = await User.findOne({ username: username.toLowerCase() });
      if (existing) {
        return res
          .status(400)
          .json({ error: 'Username sudah digunakan oleh akun lain.' });
      }
      user.username = username.toLowerCase();
    }

    const changes = [];
    if (name && name !== user.name) {
      changes.push(`Nama: '${user.name}' -> '${name}'`);
      user.name = name;
    }
    if (email !== undefined && email !== user.email) {
      changes.push(`Email: '${user.email}' -> '${email}'`);
      user.email = email;
    }
    if (phone !== undefined && phone !== user.phone) {
      changes.push(`Phone: '${user.phone}' -> '${phone}'`);
      user.phone = phone;
    }
    if (imageUrl !== undefined) {
      const imgString =
        typeof imageUrl === 'object' && imageUrl !== null
          ? imageUrl.imageUrl || imageUrl.url || ''
          : String(imageUrl || '');
      if (imgString !== user.imageUrl) {
        changes.push(`Foto profil diubah`);
        user.imageUrl = imgString;
      }
    }
    if (Array.isArray(socials)) {
      const validSocials = socials
        .slice(0, 3)
        .filter((s) => s.platform && (s.username || s.url));
      user.socials = validSocials;
      changes.push(`Media Sosial (${validSocials.length} item)`);
    }

    await user.save();

    // Automatic Synchronization with Struktur Organisasi (Pengurus collection)
    try {
      const Pengurus = require('../models/Pengurus');
      let pengurusMember = await Pengurus.findOne({
        $or: [
          { userId: user._id },
          {
            name: new RegExp(
              `^${user.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`,
              'i'
            ),
          },
          {
            name: new RegExp(
              `^${user.username.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`,
              'i'
            ),
          },
        ],
      });

      if (pengurusMember) {
        pengurusMember.userId = user._id;
        if (user.name) pengurusMember.name = user.name;
        if (user.imageUrl) pengurusMember.imageUrl = user.imageUrl;
        if (Array.isArray(user.socials) && user.socials.length > 0) {
          pengurusMember.socials = user.socials.map((s) => ({
            platform: String(s.platform || '').toLowerCase(),
            handle: String(s.username || s.platform || ''),
            url: String(s.url || '#'),
          }));
        }
        await pengurusMember.save();
      }
    } catch (_syncErr) {
      // Ignore sync error to avoid blocking profile update
    }

    // Create Activity Log Entry
    const detailMsg =
      changes.length > 0
        ? `Memperbarui profil: ${changes.join(', ')}`
        : 'Memperbarui profil tanpa perubahan data';
    await ActivityLog.create({
      userId: user._id,
      userName: user.name || user.username,
      userRole: user.role || 'pengurus',
      action: 'UPDATE_PROFILE',
      details: detailMsg,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '',
    });

    const updatedUser = await User.findById(user._id).select(
      '-passwordHash -refreshTokens'
    );
    res.json({
      message: 'Profil berhasil diperbarui.',
      user: updatedUser,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @desc    Get user activity logs
 * @route   GET /api/auth/logs
 * @access  Protected
 */
const getActivityLogs = async (req, res) => {
  try {
    const ActivityLog = require('../models/ActivityLog');
    const logs = await ActivityLog.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  login,
  refreshToken,
  logout,
  getMe,
  changePassword,
  updateProfile,
  getActivityLogs,
};
