const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProgramSchema = new Schema({
  title: { type: String, required: true },
  category: { type: String, required: true }, // e.g. "Ekonomi Kreatif", "Sosial & Lingkungan", "Olahraga & Seni"
  description: { type: String, required: true },
  icon: { type: String, default: 'fa-briefcase' }, // FontAwesome icon class
  target: { type: String, default: 'Seluruh Pemuda Rawa Arum' },
  status: { type: String, enum: ['Rencana', 'Berjalan', 'Selesai'], default: 'Berjalan' },
}, { timestamps: true });

module.exports = mongoose.model('Program', ProgramSchema);
