const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const rateLimiter = require('./middleware/rateLimiter');

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
const financeRoutes = require('./routes/finance.routes');
const achievementRoutes = require('./routes/achievement.routes');
const holidayRoutes = require('./routes/holiday.routes');
const weatherRoutes = require('./routes/weather.routes');
const seoRoutes = require('./routes/seo.routes');
const { recordWeatherSnapshot } = require('./controllers/weather.controller');

const app = express();

// Trust first proxy (Reverse Proxy like Cloudflare, Nginx)
app.set('trust proxy', 1);

// Disable X-Powered-By header & apply enhanced Helmet security headers
app.disable('x-powered-by');
app.use(
  helmet({
    contentSecurityPolicy: false, // Avoid breaking external CDN resources & fonts
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow images in /uploads
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    xContentTypeOptions: true,
    xFrameOptions: { action: 'sameorigin' },
    xXssProtection: true,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
);

// Database Connection
connectDB();

// Global CORS Middleware
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : [
      'https://kttunasarum.com',
      'http://localhost:5173',
      'http://localhost:5555',
      'http://127.0.0.1:5173',
    ];

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        allowedOrigins.includes('*')
      ) {
        callback(null, true);
      } else {
        callback(new Error('Akses diblokir oleh kebijakan CORS'));
      }
    },
    credentials: true,
  })
);

// Request body parsers with secure payload limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Global API rate limiter (300 requests per 15 min per IP)
const globalApiLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: 'Terlalu banyak permintaan API. Harap tunggu beberapa saat.',
});
app.use('/api', globalApiLimiter);

// Public SEO Routes (Sitemap & Robots)
app.use('/', seoRoutes);

// API Routes
app.use('/api', seoRoutes);
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
app.use('/api/finance', financeRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/holidays', holidayRoutes);
app.use('/api/weather', weatherRoutes);

// Models for Dynamic Social Media Open Graph Preview for Crawlers
const InfoItem = require('./models/InfoItem');
const Umkm = require('./models/Umkm');

/**
 * SSR Endpoint for Dynamic WhatsApp / Facebook / Twitter Link Preview for UMKM
 * When crawler requests /umkm/:slug/:id or /umkm/:id, serve full meta tags & JSON-LD
 */
app.get(['/umkm/:slug/:id', '/umkm/:id'], async (req, res, next) => {
  const userAgent = req.headers['user-agent'] || '';
  const isBot =
    /bot|crawler|spider|crawling|facebookexternalhit|whatsapp|telegrambot|twitterbot|slackbot|discordbot/i.test(
      userAgent
    );

  if (!isBot) {
    return next();
  }

  try {
    const rawId = req.params.id || req.params.slug;
    let item = null;

    if (mongoose.Types.ObjectId.isValid(rawId)) {
      item = await Umkm.findById(rawId);
    }

    if (
      !item &&
      req.params.id &&
      mongoose.Types.ObjectId.isValid(req.params.id)
    ) {
      item = await Umkm.findById(req.params.id);
    }

    if (!item) {
      return next();
    }

    const siteBase = (
      process.env.SITE_URL || 'https://kttunasarum.com'
    ).replace(/\/$/, '');
    const pageUrl = `${siteBase}/umkm/${encodeURIComponent(item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}/${item._id}`;
    const pageTitle = `${item.title} - UMKM Rawa Arum`;
    const rawDesc = (item.description || '')
      .replace(/<[^>]*>?/gm, '')
      .replace(/\s+/g, ' ')
      .trim();
    const pageDesc =
      rawDesc.length > 160 ? rawDesc.substring(0, 157) + '...' : rawDesc;

    let imageUrl = item.imageUrl || '/assets/potensi_umkm.png';
    if (!imageUrl.startsWith('http')) {
      imageUrl = `${siteBase}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
    }

    const structuredData = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': item.categoryType === 'jasa' ? 'LocalBusiness' : 'Product',
      name: item.title,
      description: pageDesc,
      image: [imageUrl],
      url: pageUrl,
      address: {
        '@type': 'PostalAddress',
        streetAddress: item.address || 'Kelurahan Rawa Arum',
        addressLocality: 'Cilegon',
        addressRegion: 'Banten',
        addressCountry: 'ID',
      },
    });

    res.set('Content-Type', 'text/html; charset=utf-8');
    return res.send(`<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8">
    <title>${pageTitle}</title>
    <meta name="description" content="${pageDesc}">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="${pageUrl}">

    <!-- Open Graph / WhatsApp / Facebook / Telegram / LinkedIn / Discord -->
    <meta property="og:type" content="product">
    <meta property="og:url" content="${pageUrl}">
    <meta property="og:title" content="${pageTitle}">
    <meta property="og:description" content="${pageDesc}">
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:image:secure_url" content="${imageUrl}">
    <meta property="og:site_name" content="Karang Taruna Rawa Arum">
    <meta property="og:locale" content="id_ID">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${pageUrl}">
    <meta name="twitter:title" content="${pageTitle}">
    <meta name="twitter:description" content="${pageDesc}">
    <meta name="twitter:image" content="${imageUrl}">

    <!-- Schema.org Structured Data -->
    <script type="application/ld+json">${structuredData}</script>

    <meta http-equiv="refresh" content="0;url=${pageUrl}">
  </head>
  <body>
    <h1>${pageTitle}</h1>
    <p>${pageDesc}</p>
    <a href="${pageUrl}">Buka Katalog UMKM Karang Taruna Rawa Arum</a>
  </body>
</html>`);
  } catch (_err) {
    next();
  }
});

/**
 * SSR Endpoint for Dynamic Social Media Preview for News / Berita / Lowongan / Pengumuman
 */
app.get(['/informasi/:id', '/info/:id'], async (req, res, next) => {
  const userAgent = req.headers['user-agent'] || '';
  const isBot =
    /bot|crawler|spider|crawling|facebookexternalhit|whatsapp|telegrambot|twitterbot|slackbot|discordbot/i.test(
      userAgent
    );

  if (!isBot) {
    return next();
  }

  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next();
    }

    const item = await InfoItem.findById(id);
    if (!item) {
      return next();
    }

    const siteBase = (
      process.env.SITE_URL || 'https://kttunasarum.com'
    ).replace(/\/$/, '');
    const pageUrl = `${siteBase}/informasi/${item._id}`;
    const pageTitle = `${item.title} - Karang Taruna Kelurahan Rawa Arum`;
    const rawDesc = (item.description || '')
      .replace(/<[^>]*>?/gm, '')
      .replace(/\s+/g, ' ')
      .trim();
    const pageDesc =
      rawDesc.length > 160 ? rawDesc.substring(0, 157) + '...' : rawDesc;

    let imageUrl = item.imageUrl || '/assets/info_kegiatan.png';
    if (!imageUrl.startsWith('http')) {
      imageUrl = `${siteBase}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
    }

    const structuredData = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: item.title,
      description: pageDesc,
      image: [imageUrl],
      datePublished: item.createdAt || new Date().toISOString(),
      dateModified: item.updatedAt || new Date().toISOString(),
      author: {
        '@type': 'Organization',
        name: 'Karang Taruna Kelurahan Rawa Arum',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Karang Taruna Kelurahan Rawa Arum',
        logo: {
          '@type': 'ImageObject',
          url: `${siteBase}/assets/karang-taruna-seeklogo.png`,
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': pageUrl,
      },
    });

    res.set('Content-Type', 'text/html; charset=utf-8');
    return res.send(`<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8">
    <title>${pageTitle}</title>
    <meta name="description" content="${pageDesc}">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="${pageUrl}">

    <!-- Open Graph / WhatsApp / Facebook / Telegram / LinkedIn / Discord -->
    <meta property="og:type" content="article">
    <meta property="og:url" content="${pageUrl}">
    <meta property="og:title" content="${pageTitle}">
    <meta property="og:description" content="${pageDesc}">
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:image:secure_url" content="${imageUrl}">
    <meta property="og:site_name" content="Karang Taruna Rawa Arum">
    <meta property="og:locale" content="id_ID">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${pageUrl}">
    <meta name="twitter:title" content="${pageTitle}">
    <meta name="twitter:description" content="${pageDesc}">
    <meta name="twitter:image" content="${imageUrl}">

    <!-- Schema.org Structured Data -->
    <script type="application/ld+json">${structuredData}</script>

    <meta http-equiv="refresh" content="0;url=${pageUrl}">
  </head>
  <body>
    <h1>${pageTitle}</h1>
    <p>${pageDesc}</p>
    <a href="${pageUrl}">Buka Informasi Karang Taruna Rawa Arum</a>
  </body>
</html>`);
  } catch (_err) {
    next();
  }
});

// Health & Index
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

// Global Error Handler Middleware
app.use((err, _req, res, _next) => {
  res.status(err.status || 500).json({
    error:
      process.env.NODE_ENV === 'production'
        ? 'Terjadi kesalahan internal pada server.'
        : err.message || 'Internal Server Error',
  });
});

// Server Startup
const PORT = process.env.PORT || 5555;

const startServer = async () => {
  try {
    await connectDB();

    // Trigger initial snapshot & schedule 30-minute background collector timer
    setTimeout(() => {
      recordWeatherSnapshot();
    }, 5000);
    setInterval(recordWeatherSnapshot, 30 * 60 * 1000);

    app.listen(PORT);
  } catch (_err) {
    process.stderr.write(
      'Server startup failed. Running in offline fallback mode.\n'
    );
    app.listen(PORT);
  }
};

startServer();
