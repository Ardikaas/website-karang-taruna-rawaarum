const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AchievementSchema = new Schema(
  {
    memberName: { type: String, required: true },
    title: { type: String, required: true },
    category: {
      type: String,
      enum: ['pendidikan', 'akademik', 'pernikahan', 'prestasi', 'lainnya'],
      default: 'prestasi',
    },
    message: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    date: { type: String, default: '' },
    whatsapp: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Achievement', AchievementSchema);
