const mongoose = require('mongoose');

const FinanceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Judul transaksi wajib diisi'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['pemasukan', 'pengeluaran'],
      required: [
        true,
        'Tipe transaksi wajib ditentukan (pemasukan / pengeluaran)',
      ],
    },
    amount: {
      type: Number,
      required: [true, 'Nominal transaksi wajib diisi'],
      min: [0, 'Nominal tidak boleh negatif'],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    category: {
      type: String,
      required: [true, 'Kategori transaksi wajib diisi'],
      enum: [
        'Kas Rutin',
        'Donasi & Sponsor',
        'Dana Kelurahan',
        'Kegiatan & Event',
        'Operasional & Peralatan',
        'Bantuan Sosial',
        'Lainnya',
      ],
      default: 'Kas Rutin',
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    proofUrl: {
      type: String,
      default: '',
    },
    proofName: {
      type: String,
      default: 'Bukti Transaksi',
    },
    recordedBy: {
      type: String,
      default: 'Bendahara Karang Taruna',
    },
    editHistory: [
      {
        action: {
          type: String,
          enum: ['CREATE', 'UPDATE'],
          default: 'UPDATE',
        },
        editorName: {
          type: String,
          default: 'Pengurus',
        },
        deviceInfo: {
          type: String,
          default: '',
        },
        changesSummary: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Finance', FinanceSchema);
