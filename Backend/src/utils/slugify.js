/**
 * Convert a string to a URL-safe slug.
 * e.g. "Hello World! 2024" → "hello-world-2024"
 */
const slugify = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 100);

module.exports = slugify;
