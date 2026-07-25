/* eslint-disable no-console */
const bcrypt = require('bcryptjs');
const User = require('../models/User');

/**
 * Clean Seeder Utility
 * Seeds default Super Admin account if no users exist in the database.
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
  } catch (err) {
    console.error('Error seeding Super Admin account:', err.message);
  }
};

module.exports = seedDatabase;
