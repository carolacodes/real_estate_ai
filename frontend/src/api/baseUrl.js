export function resolveApiBaseUrl(value, development) {
  const baseUrl = value?.trim();
  if (!baseUrl) throw new Error('VITE_API_URL is required in production');
  const url = new URL(baseUrl);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password ||
      url.search || url.hash || (!development && (url.protocol !== 'https:' ||
      ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)))) {
    throw new Error('VITE_API_URL must be a public HTTPS API URL in production');
  }
  return baseUrl.replace(/\/+$/, '');
}
