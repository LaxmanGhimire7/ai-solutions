const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const backendOrigin = apiBaseUrl.replace(/\/api\/?$/, '');

const isLocalHost = (hostname) => ['localhost', '127.0.0.1', '::1'].includes(hostname);

export const resolveMediaUrl = (value = '') => {
  const url = String(value || '').trim().replace(/\\/g, '/');

  if (!url || url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }

  if (url.startsWith('/uploads/')) {
    return `${backendOrigin}${url}`;
  }

  if (url.startsWith('uploads/')) {
    return `${backendOrigin}/${url}`;
  }

  if (/^https?:\/\//i.test(url)) {
    try {
      const parsed = new URL(url);
      const backend = new URL(backendOrigin);
      const currentHost = window.location.hostname;

      if (isLocalHost(parsed.hostname) && !isLocalHost(currentHost)) {
        return `${backendOrigin}${parsed.pathname}${parsed.search}${parsed.hash}`;
      }

      if (parsed.host === backend.host && parsed.protocol !== backend.protocol) {
        return `${backendOrigin}${parsed.pathname}${parsed.search}${parsed.hash}`;
      }

      if (window.location.protocol === 'https:' && parsed.protocol === 'http:' && !isLocalHost(parsed.hostname)) {
        parsed.protocol = 'https:';
        return parsed.toString();
      }
    } catch {
      return url;
    }
  }

  return url;
};
