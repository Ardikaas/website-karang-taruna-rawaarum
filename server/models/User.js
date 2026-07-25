const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SocialSchema = new Schema(
  {
    platform: { type: String, required: true },
    username: { type: String, default: '' },
    url: { type: String, default: '' },
  },
  { _id: false }
);

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    name: { type: String, default: 'Admin Karang Taruna' },
    role: { type: String, default: 'admin' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    socials: [SocialSchema],
    refreshTokens: [
      {
        tokenHash: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true, collection: 'users' }
);

module.exports = mongoose.model('User', UserSchema);
