const Pengurus = require('../models/Pengurus');

/**
 * @desc    Get all pengurus members
 * @route   GET /api/pengurus
 * @access  Public
 */
const getPengurus = async (req, res) => {
  try {
    const list = await Pengurus.find()
      .sort({
        category: 1,
        level: 1,
        createdAt: 1,
      })
      .lean();

    const User = require('../models/User');
    const allUsers = await User.find()
      .select('name username imageUrl socials')
      .lean();

    // Dynamically sync and override profile data from User accounts
    const syncedList = list.map((item) => {
      let matchedUser = null;
      if (item.userId) {
        matchedUser = allUsers.find(
          (u) => String(u._id) === String(item.userId)
        );
      }
      if (!matchedUser) {
        matchedUser = allUsers.find(
          (u) =>
            (u.name && u.name.toLowerCase() === item.name.toLowerCase()) ||
            (u.username && u.username.toLowerCase() === item.name.toLowerCase())
        );
      }

      if (matchedUser) {
        const syncedSocials =
          matchedUser.socials && matchedUser.socials.length > 0
            ? matchedUser.socials.map((s) => ({
                platform: String(s.platform || '').toLowerCase(),
                handle: String(s.username || s.platform || ''),
                url: String(s.url || '#'),
              }))
            : item.socials;

        return {
          ...item,
          name: matchedUser.name || item.name,
          imageUrl: matchedUser.imageUrl || item.imageUrl,
          socials: syncedSocials,
        };
      }
      return item;
    });

    res.json(syncedList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const filterValidSocials = (socialsArr) => {
  if (!Array.isArray(socialsArr)) return [];
  return socialsArr
    .filter((s) => s && typeof s === 'object' && s.platform)
    .map((s) => {
      let handle = String(s.handle || '')
        .trim()
        .slice(0, 80);
      let url = String(s.url || '')
        .trim()
        .slice(0, 500);

      // Block dangerous protocols (XSS security check)
      const lowerUrl = url.toLowerCase();
      if (
        lowerUrl.startsWith('javascript:') ||
        lowerUrl.startsWith('data:') ||
        lowerUrl.startsWith('vbscript:')
      ) {
        url = '#';
      } else if (
        url &&
        !lowerUrl.startsWith('http://') &&
        !lowerUrl.startsWith('https://') &&
        !lowerUrl.startsWith('mailto:') &&
        !lowerUrl.startsWith('tel:')
      ) {
        url = `https://${url}`;
      }

      return {
        platform: String(s.platform || 'instagram')
          .trim()
          .slice(0, 30),
        handle,
        url,
      };
    })
    .filter((s) => s.handle && s.handle !== '@' && s.url && s.url !== '#')
    .slice(0, 3);
};

/**
 * @desc    Create a new pengurus member
 * @route   POST /api/pengurus
 * @access  Protected (admin)
 */
const createPengurus = async (req, res) => {
  try {
    const {
      name,
      role,
      category,
      level,
      bidangId,
      bidangTitle,
      imageUrl,
      isKoordinator,
      socials,
    } = req.body;

    if (!name || !role || !category) {
      return res
        .status(400)
        .json({ error: 'Nama, jabatan (role), dan kategori wajib diisi.' });
    }

    // Auto-link userId if a matching User account exists
    const User = require('../models/User');
    const existingUser = await User.findOne({
      $or: [
        {
          name: new RegExp(
            `^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`,
            'i'
          ),
        },
        {
          username: new RegExp(
            `^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`,
            'i'
          ),
        },
      ],
    });

    const newMember = new Pengurus({
      userId: existingUser ? existingUser._id : undefined,
      name,
      role,
      category,
      level: level || 3,
      bidangId: bidangId || '',
      bidangTitle: bidangTitle || '',
      imageUrl: imageUrl || '',
      isKoordinator: isKoordinator || false,
      socials: filterValidSocials(socials),
    });

    const saved = await newMember.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * @desc    Update a pengurus member by ID
 * @route   PUT /api/pengurus/:id
 * @access  Protected (admin)
 */
const updatePengurus = async (req, res) => {
  try {
    const {
      name,
      role,
      category,
      level,
      bidangId,
      bidangTitle,
      imageUrl,
      isKoordinator,
      socials,
    } = req.body;

    const existingMember = await Pengurus.findById(req.params.id);
    if (!existingMember) {
      return res.status(404).json({ error: 'Data pengurus tidak ditemukan.' });
    }

    const updateData = {
      name,
      role,
      category,
      level,
      bidangId,
      bidangTitle,
      imageUrl,
      isKoordinator,
    };

    const User = require('../models/User');

    // Auto-link userId if not present yet
    let targetUserId = existingMember.userId;
    if (!targetUserId && name) {
      const matchedUser = await User.findOne({
        $or: [
          {
            name: new RegExp(
              `^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`,
              'i'
            ),
          },
          {
            username: new RegExp(
              `^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`,
              'i'
            ),
          },
        ],
      });
      if (matchedUser) {
        targetUserId = matchedUser._id;
        updateData.userId = matchedUser._id;
      }
    }

    if (socials !== undefined) {
      updateData.socials = filterValidSocials(socials);
    }

    const updated = await Pengurus.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    // 2-Way Sync: If linked to a User account, sync Name, Image, & Socials back to User model
    if (targetUserId) {
      try {
        const userUpdate = {};
        if (name) userUpdate.name = name;
        if (imageUrl !== undefined) userUpdate.imageUrl = imageUrl;
        if (socials !== undefined) {
          userUpdate.socials = filterValidSocials(socials).map((s) => ({
            platform: s.platform || 'Instagram',
            username: s.handle || '',
            url: s.url || '#',
          }));
        }
        await User.findByIdAndUpdate(targetUserId, userUpdate);
      } catch (_userSyncErr) {
        // Ignore user sync error if user account deletion or invalid ID
      }
    }

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * @desc    Delete a pengurus member by ID
 * @route   DELETE /api/pengurus/:id
 * @access  Protected (admin)
 */
const deletePengurus = async (req, res) => {
  try {
    const deleted = await Pengurus.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: 'Data pengurus tidak ditemukan.' });
    }

    res.json({
      message: 'Anggota pengurus berhasil dihapus.',
      id: req.params.id,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @desc    Generate user accounts for all pengurus members
 * @route   POST /api/pengurus/generate-accounts
 * @access  Protected (admin/superadmin)
 */
const generatePengurusAccounts = async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const User = require('../models/User');
    const {
      generateCleanUsername,
      generateRandomPassword,
    } = require('../utils/generatePengurusAccounts');

    const superUser = await User.findOne({ username: 'admin' });
    if (superUser) {
      await Pengurus.updateMany(
        { userId: superUser._id, name: { $ne: 'Super Admin' } },
        { $unset: { userId: 1 } }
      );
    }

    const allPengurus = await Pengurus.find().sort({ category: 1, level: 1 });
    const results = [];

    for (const member of allPengurus) {
      const cleanUsername = generateCleanUsername(member.name);

      const orConditions = [{ username: cleanUsername }];
      if (member.userId) {
        orConditions.push({ _id: member.userId });
      }
      if (member.name) {
        orConditions.push({
          name: new RegExp(
            `^${member.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`,
            'i'
          ),
        });
      }

      let existingUser = await User.findOne({ $or: orConditions });

      if (existingUser) {
        if (!member.userId) {
          member.userId = existingUser._id;
          await member.save();
        }
        results.push({
          id: member._id,
          name: member.name,
          role: member.role,
          username: existingUser.username,
          password: '(Sudah Ada Akun)',
          status: 'EKSISTING',
        });
      } else {
        const tempPassword = generateRandomPassword();
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(tempPassword, salt);

        const newUser = await User.create({
          username: cleanUsername,
          passwordHash,
          name: member.name,
          role: 'pengurus',
          imageUrl: member.imageUrl || '',
          socials: (member.socials || []).map((s) => ({
            platform: s.platform || 'Instagram',
            username: s.handle || '',
            url: s.url || '#',
          })),
        });

        member.userId = newUser._id;
        await member.save();

        results.push({
          id: member._id,
          name: member.name,
          role: member.role,
          username: cleanUsername,
          password: tempPassword,
          status: 'BARU DIBUAT',
        });
      }
    }

    res.json({
      message: `Berhasil memproses ${results.length} akun pengurus.`,
      accounts: results,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getPengurus,
  createPengurus,
  updatePengurus,
  deletePengurus,
  generatePengurusAccounts,
};
