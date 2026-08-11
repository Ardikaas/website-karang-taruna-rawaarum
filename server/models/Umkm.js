const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UmkmItemSchema = new Schema({
  name: { type: String, required: true },
  price: { type: String, default: '' },
  description: { type: String, default: '' },
  isAvailable: { type: Boolean, default: true },
  clicksCount: { type: Number, default: 0 },
});

const CertificationDocSchema = new Schema({
  title: { type: String, required: true },
  fileUrl: { type: String, required: true },
});

const UmkmSchema = new Schema(
  {
    title: { type: String, required: true },
    ownerName: { type: String, default: '' },
    // Relational reference to User model (Future integration space)
    ownerUser: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },

    categoryType: {
      type: String,
      enum: ['produk', 'jasa'],
      default: 'produk',
    },
    subCategory: { type: String, default: 'Lainnya' },
    description: { type: String, required: true },

    // Status & Badge
    isVerified: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ['aktif', 'tutup_sementara'],
      default: 'aktif',
    },
    badge: { type: String, default: 'UMKM Binaan' },

    // Contact & Location
    whatsapp: { type: String, default: '' },
    address: { type: String, default: '' },
    googleMapsUrl: { type: String, default: '' },
    operatingHours: { type: String, default: '08:00 - 20:00 WIB' },
    socialInstagram: { type: String, default: '' },

    // Pricing & Certifications (Text & Document Scans)
    priceRange: { type: String, default: '' },
    certifications: [{ type: String }],
    certificationDocs: [CertificationDocSchema],

    // Images
    imageUrl: { type: String, required: true },
    images: [{ type: String }],

    // Catalog Items List (Menu / Services)
    itemsList: [UmkmItemSchema],

    viewsCount: { type: Number, default: 0 },
    whatsappClicksCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Umkm', UmkmSchema);
