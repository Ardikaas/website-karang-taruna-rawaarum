const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PartnerSchema = new Schema({
  name: { type: String, required: true },
  category: { type: String, default: 'Industri & Swasta' }, // e.g. "Pemerintahan", "Industri & Swasta", "Lembaga Pendidikan", "UMKM Local"
  description: { type: String, default: '' },
  logoUrl: { type: String, default: '' }, // Custom uploaded logo file path
  websiteUrl: { type: String, default: '#' },
}, { timestamps: true });

module.exports = mongoose.model('Partner', PartnerSchema);
