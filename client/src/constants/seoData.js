/**
 * Global SEO Constants & Configuration for Karang Taruna Kelurahan Rawa Arum
 */

export const SITE_URL = 'https://kttunasarum.com';
export const SITE_NAME = 'Karang Taruna Rawa Arum';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/assets/karang-taruna-seeklogo.png`;

export const SEO_DEFAULTS = {
  title: 'Karang Taruna Kelurahan Rawa Arum - Grogol, Kota Cilegon',
  titleTemplate: '%s | Karang Taruna Rawa Arum',
  description:
    'Portal resmi Karang Taruna Kelurahan Rawa Arum, Kec. Grogol, Kota Cilegon. Wadah generasi muda untuk peduli, berdaya, dan berkontribusi membangun lingkungan melalui program sosial, karir loker, dan pemberdayaan UMKM.',
  keywords:
    'Karang Taruna Rawa Arum, Karang Taruna Kelurahan Rawa Arum, Pemuda Rawa Arum, Karang Taruna Cilegon, Rawaarum Grogol, Loker Cilegon, UMKM Rawa Arum, Tunas Arum Cilegon, Berita Rawa Arum, Kepemudaan Banten',
  author: 'Karang Taruna Kelurahan Rawa Arum',
  themeColor: '#0b2545',
  locale: 'id_ID',
  type: 'website',
  geo: {
    region: 'ID-BT',
    placename: 'Kelurahan Rawa Arum, Kecamatan Grogol, Kota Cilegon, Banten',
    position: '-5.9863;106.0125',
    icbm: '-5.9863, 106.0125',
  },
};

/**
 * Base Schema.org Organization JSON-LD definition
 */
export const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'GovernmentOrganization',
  name: 'Karang Taruna Kelurahan Rawa Arum',
  alternateName: ['Karang Taruna Rawa Arum', 'KT Tunas Arum'],
  url: SITE_URL,
  logo: `${SITE_URL}/assets/karang-taruna-seeklogo.png`,
  image: `${SITE_URL}/assets/hero_banner.png`,
  description:
    'Organisasi sosial kepemudaan resmi wadah generasi muda Kelurahan Rawa Arum, Kecamatan Grogol, Kota Cilegon, Banten.',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Jl. Rawa Arum No. 12',
    addressLocality: 'Grogol',
    addressRegion: 'Banten',
    postalCode: '42436',
    addressCountry: 'ID',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: -5.9863,
    longitude: 106.0125,
  },
  areaServed: {
    '@type': 'AdministrativeArea',
    name: 'Kelurahan Rawa Arum, Kota Cilegon',
  },
  sameAs: [
    'https://www.instagram.com',
    'https://www.facebook.com',
    'https://www.youtube.com',
  ],
};

/**
 * Helper to build BreadcrumbList schema
 * @param {Array<{ name: string, url: string }>} items
 */
export const buildBreadcrumbSchema = (items = []) => {
  const itemListElement = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Beranda',
      item: SITE_URL,
    },
    ...items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 2,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  ];

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement,
  };
};
