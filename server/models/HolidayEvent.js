const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const HolidayEventSchema = new Schema(
  {
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    theme: {
      type: String,
      enum: [
        'merah-putih',
        'religi-hijau',
        'natal',
        'tahun-baru',
        'kartini',
        'custom',
      ],
      default: 'merah-putih',
    },
    customColor: { type: String, default: '' },
    bannerImageUrl: { type: String, default: '' },
    particleImages: { type: [String], default: [] },
    emoji: { type: String, default: '🎉' },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('HolidayEvent', HolidayEventSchema);
