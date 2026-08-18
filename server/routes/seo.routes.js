const express = require('express');
const router = express.Router();
const seoController = require('../controllers/seo.controller');

// Dynamic Sitemap and Robots routes
router.get('/sitemap.xml', seoController.getSitemapXml);
router.get('/robots.txt', seoController.getRobotsTxt);

module.exports = router;
