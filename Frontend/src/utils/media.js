const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const backendOrigin = apiBaseUrl.replace(/\/api\/?$/, '');

const isLocalHost = (hostname) => ['localhost', '127.0.0.1', '::1'].includes(hostname);

const normalizeUploadPath = (path = '') => {
  const cleanPath = String(path || '').replace(/\\/g, '/');
  return cleanPath.replace(/^\/?api\/uploads\//i, '/uploads/');
};

export const resolveMediaUrl = (value = '') => {
  const url = normalizeUploadPath(String(value || '').trim());

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
      const uploadPath = normalizeUploadPath(parsed.pathname);

      if (isLocalHost(parsed.hostname) && !isLocalHost(currentHost)) {
        return `${backendOrigin}${uploadPath}${parsed.search}${parsed.hash}`;
      }

      if (parsed.host === backend.host && parsed.protocol !== backend.protocol) {
        return `${backendOrigin}${uploadPath}${parsed.search}${parsed.hash}`;
      }

      if (/^\/uploads\//i.test(uploadPath) && parsed.pathname !== uploadPath) {
        parsed.pathname = uploadPath;
      }

      if (window.location.protocol === 'https:' && parsed.protocol === 'http:' && !isLocalHost(parsed.hostname)) {
        parsed.protocol = 'https:';
        return parsed.toString();
      }

      if (parsed.pathname === uploadPath && parsed.toString() !== url) {
        return parsed.toString();
      }
    } catch {
      return url;
    }
  }

  return url;
};
