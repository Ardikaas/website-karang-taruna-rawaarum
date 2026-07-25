/* eslint-disable no-console */
const mongoose = require('mongoose');

const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const migrateAdminsToUsers = async () => {
  const mongoUri =
    process.env.MONGODB_URI || 'mongodb://localhost:27017/karangtaruna';
  console.log(`Connecting to MongoDB at: ${mongoUri}...`);

  try {
    await mongoose.connect(mongoUri);
    const db = mongoose.connection.db;

    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((c) => c.name);

    if (collectionNames.includes('admins')) {
      console.log(
        'Collection "admins" ditemukan. Memindahkan data ke tabel "users"...'
      );
      const adminsDocs = await db.collection('admins').find().toArray();

      if (adminsDocs.length > 0) {
        let count = 0;
        for (const doc of adminsDocs) {
          try {
            await db.collection('users').insertOne(doc);
            count++;
          } catch (_dupErr) {
            // Already exists in users collection
          }
        }
        console.log(
          `Berhasil memindahkan/memeriksa ${adminsDocs.length} dokumen (${count} baru ditambahkan ke "users").`
        );
      }

      // Drop old admins collection after migration
      try {
        await db.collection('admins').drop();
        console.log(
          'Tabel "admins" lama telah dihapus. Semua akun kini tersimpan di tabel "users".'
        );
      } catch (_dropErr) {
        // Ignore if already dropped
      }
    } else {
      console.log('Tabel "users" sudah digunakan. Tidak perlu migrasi.');
    }
  } catch (err) {
    console.error('Error during migration:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('Migrasi selesai. Koneksi MongoDB ditutup.');
  }
};

if (require.main === module) {
  migrateAdminsToUsers();
}

module.exports = migrateAdminsToUsers;
