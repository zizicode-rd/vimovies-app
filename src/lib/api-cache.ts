import { cache } from 'react';
import { apiFetch } from '@/lib/api';
import { pickI18n } from '@/lib/i18n-utils';
import { normalizeMonitor } from '@/lib/monitor';
import type { MonitorPublic, PostPublic } from '@/types/api';

/**
 * Deduplica peticiones de monitor dentro del mismo ciclo de request.
 * Tanto generateMetadata como el Page pueden llamarla y la API solo se ejecuta una vez.
 */
export const getCachedMonitor = cache(async (slug: string, locale: 'es' | 'en') => {
  try {
    const data = await apiFetch<any>(`/api/v1/monitors/${slug}`, { lang: locale });
    return pickI18n<MonitorPublic>(normalizeMonitor(data), locale);
  } catch {
    return null;
  }
});

/**
 * Deduplica peticiones de post/artículo dentro del mismo ciclo de request.
 */
export const getCachedPost = cache(async (slug: string, locale: 'es' | 'en') => {
  try {
    const data = await apiFetch<PostPublic>(`/api/v1/posts/${slug}`, { lang: locale });
    return pickI18n<PostPublic>(data, locale);
  } catch {
    return null;
  }
});
