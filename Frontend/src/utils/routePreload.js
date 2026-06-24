export const routeLoaders = {
  '/admin/dashboard': () => import('@/pages/Dashboard'),
  '/admin/content': () => import('@/pages/ContentManager'),
  '/admin/chat': () => import('@/pages/ChatSupport'),
};

const preloadCache = new Map();

export const preloadRoute = (path) => {
  const loader = routeLoaders[path];

  if (!loader) return Promise.resolve();

  if (!preloadCache.has(path)) {
    preloadCache.set(path, loader().catch(() => preloadCache.delete(path)));
  }

  return preloadCache.get(path);
};

export const scheduleRoutePreload = (paths) => {
  const preload = () => paths.forEach((path) => preloadRoute(path));

  if ('requestIdleCallback' in window) {
    const idleId = window.requestIdleCallback(preload, { timeout: 2500 });
    return () => window.cancelIdleCallback(idleId);
  }

  const timeoutId = window.setTimeout(preload, 800);
  return () => window.clearTimeout(timeoutId);
};
