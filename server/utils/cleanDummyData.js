/* eslint-disable no-console */
const connectDB = require('../config/db');
const InfoItem = require('../models/InfoItem');
const Program = require('../models/Program');
const Partner = require('../models/Partner');

const cleanDummyData = async () => {
  try {
    await connectDB();
    console.log('Cleaning all dummy data from MongoDB database...');

    const deletedInfo = await InfoItem.deleteMany({});
    console.log(
      `Deleted ${deletedInfo.deletedCount} items from InfoItem (UMKM, Loker, Kegiatan, Pengumuman).`
    );

    const deletedPrograms = await Program.deleteMany({});
    console.log(`Deleted ${deletedPrograms.deletedCount} items from Program.`);

    const deletedPartners = await Partner.deleteMany({});
    console.log(`Deleted ${deletedPartners.deletedCount} items from Partner.`);

    console.log('All dummy data successfully cleared!');
    process.exit(0);
  } catch (err) {
    console.error('Error cleaning dummy data:', err.message);
    process.exit(1);
  }
};

cleanDummyData();
