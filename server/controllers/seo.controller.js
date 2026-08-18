const InfoItem = require('../models/InfoItem');
const Umkm = require('../models/Umkm');

const SITE_URL = 'https://kttunasarum.com';

/**
 * Escape special XML characters
 * @param {string} str
 * @returns {string}
 */
const escapeXml = (str = '') => {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

/**
 * Format date to ISO date string (YYYY-MM-DD)
 * @param {Date|string} date
 * @returns {string}
 */
const formatIsoDate = (date) => {
  try {
    return new Date(date || Date.now()).toISOString().split('T')[0];
  } catch (_e) {
    return new Date().toISOString().split('T')[0];
  }
};

/**
 * Generate and serve dynamic XML Sitemap
 * Route: GET /sitemap.xml
 */
exports.getSitemapXml = async (_req, res) => {
  try {
    const today = formatIsoDate(new Date());

    // 1. Static Routes
    const staticRoutes = [
      {
        url: `${SITE_URL}/`,
        changefreq: 'daily',
        priority: '1.0',
        lastmod: today,
      },
      {
        url: `${SITE_URL}/umkm`,
        changefreq: 'daily',
        priority: '0.9',
        lastmod: today,
      },
      {
        url: `${SITE_URL}/loker`,
        changefreq: 'daily',
        priority: '0.9',
        lastmod: today,
      },
      {
        url: `${SITE_URL}/kegiatan`,
        changefreq: 'daily',
        priority: '0.9',
        lastmod: today,
      },
      {
        url: `${SITE_URL}/pengumuman`,
        changefreq: 'weekly',
        priority: '0.8',
        lastmod: today,
      },
      {
        url: `${SITE_URL}/program`,
        changefreq: 'monthly',
        priority: '0.8',
        lastmod: today,
      },
      {
        url: `${SITE_URL}/struktur`,
        changefreq: 'monthly',
        priority: '0.8',
        lastmod: today,
      },
      {
        url: `${SITE_URL}/kemitraan`,
        changefreq: 'monthly',
        priority: '0.8',
        lastmod: today,
      },
      {
        url: `${SITE_URL}/kontak`,
        changefreq: 'monthly',
        priority: '0.8',
        lastmod: today,
      },
      {
        url: `${SITE_URL}/keuangan`,
        changefreq: 'weekly',
        priority: '0.8',
        lastmod: today,
      },
      {
        url: `${SITE_URL}/cuaca`,
        changefreq: 'hourly',
        priority: '0.7',
        lastmod: today,
      },
      {
        url: `${SITE_URL}/kebijakan-privasi`,
        changefreq: 'monthly',
        priority: '0.6',
        lastmod: today,
      },
      {
        url: `${SITE_URL}/syarat-ketentuan`,
        changefreq: 'monthly',
        priority: '0.6',
        lastmod: today,
      },
    ];

    // 2. Fetch live data from MongoDB
    const [infoItems, umkmItems] = await Promise.all([
      InfoItem.find({})
        .sort({ updatedAt: -1 })
        .lean()
        .catch(() => []),
      Umkm.find({})
        .sort({ updatedAt: -1 })
        .lean()
        .catch(() => []),
    ]);

    // 3. Build XML entries
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

    // Add static routes
    for (const route of staticRoutes) {
      xml += `  <url>
    <loc>${escapeXml(route.url)}</loc>
    <lastmod>${route.lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>\n`;
    }

    // Add Info Items (Berita, Kegiatan, Loker, Pengumuman)
    for (const item of infoItems) {
      const lastmod = formatIsoDate(item.updatedAt || item.createdAt);
      const itemUrl = `${SITE_URL}/informasi/${item._id}`;
      const imgUrl = item.imageUrl
        ? item.imageUrl.startsWith('http')
          ? item.imageUrl
          : `${SITE_URL}${item.imageUrl.startsWith('/') ? '' : '/'}${item.imageUrl}`
        : null;

      xml += `  <url>
    <loc>${escapeXml(itemUrl)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>`;

      if (imgUrl) {
        xml += `
    <image:image>
      <image:loc>${escapeXml(imgUrl)}</image:loc>
      <image:title>${escapeXml(item.title)}</image:title>
    </image:image>`;
      }

      xml += `\n  </url>\n`;
    }

    // Add UMKM Items
    for (const umkm of umkmItems) {
      const lastmod = formatIsoDate(umkm.updatedAt || umkm.createdAt);
      const slug = (umkm.title || 'detail')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      const umkmUrl = `${SITE_URL}/umkm/${slug}/${umkm._id}`;
      const imgUrl = umkm.imageUrl
        ? umkm.imageUrl.startsWith('http')
          ? umkm.imageUrl
          : `${SITE_URL}${umkm.imageUrl.startsWith('/') ? '' : '/'}${umkm.imageUrl}`
        : null;

      xml += `  <url>
    <loc>${escapeXml(umkmUrl)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>`;

      if (imgUrl) {
        xml += `
    <image:image>
      <image:loc>${escapeXml(imgUrl)}</image:loc>
      <image:title>${escapeXml(umkm.title)}</image:title>
    </image:image>`;
      }

      xml += `\n  </url>\n`;
    }

    xml += `</urlset>`;

    res.set('Content-Type', 'application/xml; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=3600, s-maxage=7200');
    return res.status(200).send(xml);
  } catch (_err) {
    return res.status(500).json({ error: 'Gagal membuat dynamic sitemap XML' });
  }
};

/**
 * Generate and serve dynamic Robots.txt
 * Route: GET /robots.txt
 */
exports.getRobotsTxt = (_req, res) => {
  try {
    const robotsTxt = `# Robots.txt for Karang Taruna Kelurahan Rawa Arum (https://kttunasarum.com)
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /admin
Disallow: /pengurus/
Disallow: /pengurus
Disallow: /login
Disallow: /api/

# Static and Dynamic assets
Allow: /assets/
Allow: /uploads/
Allow: /sitemap.xml

User-agent: Googlebot
Allow: /
Disallow: /admin/
Disallow: /pengurus/
Disallow: /login
Disallow: /api/

User-agent: Bingbot
Allow: /
Disallow: /admin/
Disallow: /pengurus/
Disallow: /login
Disallow: /api/

Sitemap: ${SITE_URL}/sitemap.xml
`;

    res.set('Content-Type', 'text/plain; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=86400');
    return res.status(200).send(robotsTxt);
  } catch (_err) {
    return res.status(500).json({ error: 'Gagal membuat robots.txt' });
  }
};
