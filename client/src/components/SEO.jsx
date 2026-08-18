import { useEffect } from 'react';
import {
  SITE_URL,
  SITE_NAME,
  DEFAULT_OG_IMAGE,
  SEO_DEFAULTS,
} from '../constants/seoData';

/**
 * Update or create a meta tag by selector and attribute
 * @param {string} selector - CSS selector to find element (e.g. 'meta[name="description"]')
 * @param {string} attribute - Attribute to set (e.g. 'content')
 * @param {string} value - Value to set
 * @param {object} createAttrs - Attributes to set if element must be created
 */
const setMetaTag = (selector, attribute, value, createAttrs = {}) => {
  if (!value) return;
  let element = document.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    Object.entries(createAttrs).forEach(([k, v]) => element.setAttribute(k, v));
    document.head.appendChild(element);
  }
  element.setAttribute(attribute, value);
};

/**
 * Reusable SEO Management Component
 * Automatically manages document title, meta descriptions, canonical URLs,
 * Open Graph, Twitter Cards, and Schema.org JSON-LD Structured Data.
 */
const SEO = ({
  title,
  description,
  keywords,
  canonicalUrl,
  ogImage,
  ogType = 'website',
  schema,
  noIndex = false,
}) => {
  useEffect(() => {
    // 1. Title
    const formattedTitle = title
      ? `${title} | ${SITE_NAME}`
      : SEO_DEFAULTS.title;
    document.title = formattedTitle;

    // 2. Standard Meta Tags
    const finalDesc = description || SEO_DEFAULTS.description;
    const finalKeywords = keywords || SEO_DEFAULTS.keywords;
    const finalCanonical = canonicalUrl
      ? canonicalUrl.startsWith('http')
        ? canonicalUrl
        : `${SITE_URL}${canonicalUrl}`
      : window.location.href;
    const finalImage = ogImage || DEFAULT_OG_IMAGE;
    const finalRobots = noIndex
      ? 'noindex, nofollow'
      : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1';

    setMetaTag('meta[name="description"]', 'content', finalDesc, {
      name: 'description',
    });
    setMetaTag('meta[name="keywords"]', 'content', finalKeywords, {
      name: 'keywords',
    });
    setMetaTag('meta[name="robots"]', 'content', finalRobots, {
      name: 'robots',
    });

    // 3. Canonical Link Tag
    let canonicalTag = document.querySelector('link[rel="canonical"]');
    if (!canonicalTag) {
      canonicalTag = document.createElement('link');
      canonicalTag.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalTag);
    }
    canonicalTag.setAttribute('href', finalCanonical);

    // 4. Open Graph Tags
    setMetaTag('meta[property="og:title"]', 'content', formattedTitle, {
      property: 'og:title',
    });
    setMetaTag('meta[property="og:description"]', 'content', finalDesc, {
      property: 'og:description',
    });
    setMetaTag('meta[property="og:url"]', 'content', finalCanonical, {
      property: 'og:url',
    });
    setMetaTag('meta[property="og:image"]', 'content', finalImage, {
      property: 'og:image',
    });
    setMetaTag('meta[property="og:type"]', 'content', ogType, {
      property: 'og:type',
    });
    setMetaTag('meta[property="og:site_name"]', 'content', SITE_NAME, {
      property: 'og:site_name',
    });
    setMetaTag('meta[property="og:locale"]', 'content', SEO_DEFAULTS.locale, {
      property: 'og:locale',
    });

    // 5. Twitter Cards
    setMetaTag('meta[name="twitter:card"]', 'content', 'summary_large_image', {
      name: 'twitter:card',
    });
    setMetaTag('meta[name="twitter:title"]', 'content', formattedTitle, {
      name: 'twitter:title',
    });
    setMetaTag('meta[name="twitter:description"]', 'content', finalDesc, {
      name: 'twitter:description',
    });
    setMetaTag('meta[name="twitter:image"]', 'content', finalImage, {
      name: 'twitter:image',
    });

    // 6. JSON-LD Structured Data Schema
    const scriptId = 'dynamic-seo-jsonld';
    let scriptTag = document.getElementById(scriptId);

    if (schema) {
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = scriptId;
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(schema);
    } else if (scriptTag) {
      scriptTag.remove();
    }

    return () => {
      // Cleanup dynamically injected schema on unmount/navigation
      const existingScript = document.getElementById(scriptId);
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [
    title,
    description,
    keywords,
    canonicalUrl,
    ogImage,
    ogType,
    schema,
    noIndex,
  ]);

  return null;
};

export default SEO;
