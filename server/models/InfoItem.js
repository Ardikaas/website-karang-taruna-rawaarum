const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const InfoItemSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: {
      type: String,
      required: true,
    },
    date: { type: String, required: true },
    imageUrl: { type: String, required: true },
    badge: { type: String, required: true },
    linkText: { type: String, default: 'Lihat Selengkapnya' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },

    // Custom Action Button & Contact Link Configuration
    contactType: {
      type: String,
      enum: ['default', 'whatsapp', 'link'],
      default: 'default',
    },
    contactUrl: { type: String, default: '' },
    whatsappText: { type: String, default: '' },

    // UMKM Specific Fields (Optional)
    categoryType: {
      type: String,
      enum: ['produk', 'jasa'],
      default: 'produk',
    },
    address: { type: String, default: '' },
    whatsapp: { type: String, default: '' },
    images: [{ type: String }],
    certifications: [{ type: String }],
    priceRange: { type: String, default: '' },
    itemsList: [
      {
        name: { type: String },
        price: { type: String },
        description: { type: String },
        image: { type: String },
      },
    ],
    viewsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('InfoItem', InfoItemSchema);
