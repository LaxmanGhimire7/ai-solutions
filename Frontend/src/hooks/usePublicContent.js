import { useEffect, useMemo, useState } from 'react';
import { getPublicContent } from '@/api/content';

const contentCache = new Map();

export const usePublicContent = (type, params = {}) => {
  const paramsKey = useMemo(() => JSON.stringify(params), [params]);
  const cacheKey = `${type}:${paramsKey}`;
  const cached = contentCache.get(cacheKey);
  const [items, setItems] = useState(cached || []);
  const [isLoading, setIsLoading] = useState(!cached);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!contentCache.has(cacheKey)) setIsLoading(true);

      try {
        const response = await getPublicContent(type, JSON.parse(paramsKey));
        const nextItems = response.data || [];
        contentCache.set(cacheKey, nextItems);

        if (active) {
          setItems(nextItems);
          setError(null);
        }
      } catch (requestError) {
        if (active) setError(requestError);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [cacheKey, paramsKey, type]);

  return { items, isLoading, error };
};

export const mergePublishedWithSamples = (publishedItems, sampleItems, getKey) => {
  const seen = new Set();

  return [...publishedItems, ...sampleItems].filter((item) => {
    const key = String(getKey(item) || '').trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};
