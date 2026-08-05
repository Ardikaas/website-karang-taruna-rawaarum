/* eslint-disable no-console */
/* eslint-disable no-console */
const express = require('express');

const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = require('./config/db');

// Route modules
const infoRoutes = require('./routes/info.routes');
const registerRoutes = require('./routes/register.routes');
const newsletterRoutes = require('./routes/newsletter.routes');
const authRoutes = require('./routes/auth.routes');
const uploadRoutes = require('./routes/upload.routes');
const pengurusRoutes = require('./routes/pengurus.routes');
const settingsRoutes = require('./routes/settings.routes');
const programRoutes = require('./routes/program.routes');
const partnerRoutes = require('./routes/partner.routes');
const umkmRoutes = require('./routes/umkm.routes');
const messageRoutes = require('./routes/message.routes');
const path = require('path');

const app = express();

// --------------- Middleware ---------------
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// --------------- API Routes ---------------
app.use('/api/auth', authRoutes);
app.use('/api/info', infoRoutes);
app.use('/api/umkm', umkmRoutes);
app.use('/api/register', registerRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/pengurus', pengurusRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/program', programRoutes);
app.use('/api/partner', partnerRoutes);
app.use('/api/messages', messageRoutes);

// --------------- Models for Dynamic Social Media OG Preview ---------------
const Umkm = require('./models/Umkm');
const InfoItem = require('./models/InfoItem');

const stripHtml = (html = '') => {
  return (html || '')
    .replace(/<[^>]*>?/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
};

const getAbsoluteImageUrl = (imgPath) => {
  if (!imgPath)
    return 'https://tunasarum.devlabfortirta.my.id/assets/karang-taruna-seeklogo.png';
  if (imgPath.startsWith('http://') || imgPath.startsWith('https://'))
    return imgPath;

  let formatted = (imgPath || '').trim();
  if (!formatted.startsWith('/uploads/') && !formatted.startsWith('/assets/')) {
    if (formatted.startsWith('uploads/')) formatted = `/${formatted}`;
    else if (formatted.startsWith('/')) formatted = `/uploads${formatted}`;
    else formatted = `/uploads/${formatted}`;
  }

  if (!formatted.startsWith('/')) formatted = `/${formatted}`;
  return `https://tunasarum.devlabfortirta.my.id${formatted}`;
};

// --------------- Dynamic Open Graph Preview Routes ---------------

// Dynamic UMKM Open Graph Link Preview (WhatsApp, Telegram, Facebook, Twitter, Discord, Slack, etc.)
app.get(['/umkm/:id', '/umkm/:slug/:id'], async (req, res, next) => {
  try {
    const umkmId = req.params.id;
    const item = await Umkm.findById(umkmId);
    if (!item) return next();

    const title = `${item.title} - UMKM Rawa Arum`;
    const description =
      stripHtml(item.description).substring(0, 160) ||
      'Showcase UMKM Kelurahan Rawa Arum, Kec. Grogol, Kota Cilegon.';
    const rawImage =
      item.imageUrl || (Array.isArray(item.images) && item.images[0]);
    const imageUrl = getAbsoluteImageUrl(rawImage);
    const slug = req.params.slug || 'detail';
    const pageUrl = `https://tunasarum.devlabfortirta.my.id/umkm/${slug}/${umkmId}`;

    res.send(`<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <meta name="description" content="${description}">

    <!-- Open Graph / WhatsApp / Facebook / Telegram / LinkedIn / Discord -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${pageUrl}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:image:secure_url" content="${imageUrl}">
    <meta property="og:site_name" content="Karang Taruna Rawa Arum">
    <meta property="og:locale" content="id_ID">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${pageUrl}">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${imageUrl}">

    <meta http-equiv="refresh" content="0;url=${pageUrl}">
  </head>
  <body>
    <h1>${title}</h1>
    <p>${description}</p>
    <a href="${pageUrl}">Buka Halaman UMKM Karang Taruna Rawa Arum</a>
  </body>
</html>`);
  } catch (_err) {
    next();
  }
});

// Dynamic News / Informasi / Loker Open Graph Link Preview
app.get(['/informasi/:id', '/info/:id'], async (req, res, next) => {
  try {
    const infoId = req.params.id;
    const item = await InfoItem.findById(infoId);
    if (!item) return next();

    const title = `${item.title} - Kabar Rawa Arum`;
    const description =
      stripHtml(item.description).substring(0, 160) ||
      'Informasi resmi Karang Taruna Kelurahan Rawa Arum, Kec. Grogol, Kota Cilegon.';
    const imageUrl = getAbsoluteImageUrl(item.imageUrl);
    const pageUrl = `https://tunasarum.devlabfortirta.my.id/informasi/${infoId}`;

    res.send(`<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <meta name="description" content="${description}">

    <!-- Open Graph / WhatsApp / Facebook / Telegram / LinkedIn / Discord -->
    <meta property="og:type" content="article">
    <meta property="og:url" content="${pageUrl}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:image:secure_url" content="${imageUrl}">
    <meta property="og:site_name" content="Karang Taruna Rawa Arum">
    <meta property="og:locale" content="id_ID">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${pageUrl}">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${imageUrl}">

    <meta http-equiv="refresh" content="0;url=${pageUrl}">
  </head>
  <body>
    <h1>${title}</h1>
    <p>${description}</p>
    <a href="${pageUrl}">Buka Informasi Karang Taruna Rawa Arum</a>
  </body>
</html>`);
  } catch (_err) {
    next();
  }
});

// --------------- Health & Index ---------------
app.get('/', (_req, res) => {
  res.json({ message: 'Welcome to the Karangtaruna Rawa Arum Modular API' });
});

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    database:
      mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// --------------- Server Startup ---------------
const PORT = process.env.PORT || 5555;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Server startup failed. Running in offline fallback mode.');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} (Database offline)`);
    });
  }
};

startServer();
