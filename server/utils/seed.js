/* eslint-disable no-console */
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const HolidayEvent = require('../models/HolidayEvent');

/**
 * Clean Seeder Utility
 * Seeds default Super Admin account and initial HolidayEvent if empty.
 */
const seedDatabase = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Seeding default Super Admin account...');
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('admin123', salt);
      await User.create({
        username: 'admin',
        passwordHash,
        name: 'Super Admin',
        role: 'superadmin',
      });
      console.log('Super Admin user created successfully.');
      console.log('Credentials: Username "admin" | Password "admin123"');
    } else {
      console.log('User accounts already exist. Skipping Super Admin seeding.');
    }

    const holidayCount = await HolidayEvent.countDocuments();
    if (holidayCount === 0) {
      console.log('Seeding default active HolidayEvent...');
      const now = new Date();
      const start = new Date(now);
      start.setDate(start.getDate() - 2);
      start.setHours(0, 0, 0, 0);

      const end = new Date(now);
      end.setDate(end.getDate() + 14);
      end.setHours(23, 59, 59, 999);

      await HolidayEvent.create({
        title: 'HUT Republik Indonesia ke-81',
        subtitle:
          'Dirgahayu Republik Indonesia! Bersatu Berdaulat, Nusantara Baru Indonesia Maju 🇮🇩',
        startDate: start,
        endDate: end,
        theme: 'merah-putih',
        emoji: '🇮🇩',
        isActive: true,
      });
      console.log('Default active HolidayEvent seeded successfully.');
    }
  } catch (err) {
    console.error('Error seeding database:', err.message);
  }
};

module.exports = seedDatabase;
