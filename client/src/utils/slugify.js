/**
 * Utility to convert text/name into URL-friendly slug
 * e.g. "Kerajinan Bambu Rawa Arum" -> "kerajinan-bambu-rawa-arum"
 *
 * @param {string} text
 * @returns {string} URL slug
 */
export const slugify = (text = '') => {
  if (!text) return 'detail';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove non-word characters except spaces & dashes
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with single dash
    .replace(/^-+|-+$/g, ''); // Trim leading/trailing dashes
};

/**
 * Generate full UMKM detail URL with slug and ID
 * e.g. /umkm/nama-toko/6a66b83b77912de835a16f36
 *
 * @param {Object} item - UMKM item object
 * @returns {string} Relative URL path
 */
export const getUmkmDetailUrl = (item) => {
  if (!item) return '/umkm';
  const id = item._id || item.id || '';
  const title = item.title || item.name || '';
  const slug = slugify(title) || 'detail';
  return id ? `/umkm/${slug}/${id}` : '/umkm';
};
