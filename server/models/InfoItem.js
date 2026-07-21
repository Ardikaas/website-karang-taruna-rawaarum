const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const InfoItemSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, required: true, enum: ['loker', 'umkm', 'kegiatan', 'pengumuman'] },
  date: { type: String, required: true },
  imageUrl: { type: String, required: true },
  badge: { type: String, required: true },
  linkText: { type: String, default: 'Lihat Selengkapnya' }
}, { timestamps: true });

module.exports = mongoose.model('InfoItem', InfoItemSchema);
