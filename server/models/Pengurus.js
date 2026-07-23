const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PengurusSchema = new Schema({
  name: { type: String, required: true },
  role: { type: String, required: true }, // e.g. "Ketua", "Wakil Ketua I", "Koordinator Bidang", "Anggota"
  category: { type: String, required: true, enum: ['pembina', 'harian', 'bidang'] },
  level: { type: Number, default: 3 }, // For ordering harian members (1 = Ketua, 2 = Wakil, 3 = Sekretaris/Bendahara/etc.)
  bidangId: { type: String, default: '' }, // e.g. "kaderisasi", "advokasi", "media"
  bidangTitle: { type: String, default: '' }, // e.g. "Pemberdayaan Aparatur Organisasi & Kaderisasi"
  imageUrl: { type: String, default: '' }, // Custom uploaded image path
  isKoordinator: { type: Boolean, default: false } // True if they are the koordinator of a bidang
}, { timestamps: true });

module.exports = mongoose.model('Pengurus', PengurusSchema);
