const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SiteSettingsSchema = new Schema({
  // Hero Banner
  heroTitle: { type: String, default: 'KARANG TARUNA KELURAHAN RAWA ARUM' },
  heroSubtitle: { type: String, default: 'Muda, Beda, Berkarya untuk Kemajuan Rawa Arum' },
  heroDescription: { type: String, default: 'Wadah pengembangan generasi muda Kelurahan Rawa Arum yang berkesadaran sosial, kreatif, inovatif, dan berdaya saing.' },
  
  // Visi & Misi
  visiText: { type: String, default: 'Terwujudnya Pemuda Rawa Arum yang Mandiri, Berkarakter, Kreatif, dan Berjiwa Sosial tinggi dalam membangun Kelurahan Rawa Arum yang Sejahtera.' },
  misiList: [{ type: String }],

  // Kontak & Alamat
  address: { type: String, default: 'Jl. Raya Merak No. 12, Kel. Rawa Arum, Kec. Grogol, Kota Cilegon, Banten 42436' },
  phone: { type: String, default: '0812-3456-7890' },
  whatsapp: { type: String, default: '6281234567890' },
  email: { type: String, default: 'kontak@karangtarunarawaarum.id' },
  mapsEmbedUrl: { type: String, default: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3967.68598762397!2d106.0123!3d-5.9812!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNcKwNTgnNTIuMyJTIDEwNsKwMDAnNDQuMyJF!5e0!3m2!1sid!2sid!4v1600000000000!5m2!1sid!2sid' },

  // Media Sosial
  socialInstagram: { type: String, default: 'https://instagram.com/kartar_rawaarum' },
  socialFacebook: { type: String, default: 'https://facebook.com/kartar.rawaarum' },
  socialYoutube: { type: String, default: 'https://youtube.com/@kartarrawaarum' },
}, { timestamps: true });

module.exports = mongoose.model('SiteSettings', SiteSettingsSchema);
