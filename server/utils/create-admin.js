/* eslint-disable no-console */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');

const createAdminUser = async () => {
  try {
    await connectDB();

    const username = 'admin';
    const rawPassword = 'admin123';

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(rawPassword, salt);

    let user = await User.findOne({ username });
    if (user) {
      user.passwordHash = passwordHash;
      user.role = 'superadmin';
      user.name = 'Super Admin';
      await user.save();
      console.log('✅ Account "admin" updated & reset successfully!');
    } else {
      user = await User.create({
        username,
        passwordHash,
        name: 'Super Admin',
        role: 'superadmin',
      });
      console.log('✅ Admin user created successfully!');
    }

    console.log('------------------------------------');
    console.log(`Username : ${username}`);
    console.log(`Password : ${rawPassword}`);
    console.log(`Role     : superadmin`);
    console.log('------------------------------------');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating admin user:', err.message);
    process.exit(1);
  }
};

createAdminUser();
