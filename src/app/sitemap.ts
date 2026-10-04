import type { MetadataRoute } from 'next';
import { apiFetch } from '@/lib/api';
import type { MonitorListItem, PaginatedResponse, PostPublic, ComparisonPublic, PseoHubPublic, BrandPublic } from '@/types/api';

const base = 'https://vimonitors.com';
const locales = ['es', 'en'] as const;

async function fetchAll<T>(path: string, limit: number): Promise<T[]> {
  try {
    const first = await apiFetch<PaginatedResponse<T>>(`${path}?limit=${limit}&page=1`);
    const pages: T[] = [...first.data];
    const remaining = Array.from({ length: Math.max(0, first.pagination.total_pages - 1) }, (_, i) => i + 2);
    const rest = await Promise.all(
      remaining.map((page) =>
        apiFetch<PaginatedResponse<T>>(`${path}?limit=${limit}&page=${page}`).then((r) => r.data).catch(() => [])
      )
    );
    return pages.concat(...rest);
  } catch {
    return [];
  }
}

export async function generateSitemaps() {
  return [
    { id: 'static' },
    ...locales.map((l) => ({ id: `monitors-${l}` })),
    ...locales.map((l) => ({ id: `brands-${l}` })),
    ...locales.map((l) => ({ id: `articles-${l}` })),
    ...locales.map((l) => ({ id: `comparisons-${l}` })),
    ...locales.map((l) => ({ id: `hubs-${l}` })),
  ];
}

function localePath(locale: 'es' | 'en', segments: string[]): string {
  return `/${locale}/${segments.join('/')}`;
}

export default async function sitemap({ id }: { id: Promise<string> }): Promise<MetadataRoute.Sitemap> {
  const idValue = await id;
  if (idValue === 'static') {
    const staticRoutes = [
      '/es', '/en',
      '/es/monitores', '/en/monitores',
      '/es/comparativas', '/en/comparativas',
      '/es/blog', '/en/blog',
    ];
    return staticRoutes.map((path) => ({
      url: `${base}${path}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: path === '/es' || path === '/en' ? 1 : 0.8,
    }));
  }

  const [type, locale] = idValue.split('-') as [string, 'es' | 'en'];

  if (type === 'monitors') {
    const monitors = await fetchAll<MonitorListItem>('/api/v1/monitors', 1000);
    return monitors.map((m) => ({
      url: `${base}${localePath(locale, ['monitores', m.brand_slug, m.slug])}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  }

  if (type === 'brands') {
    const brands = await fetchAll<BrandPublic>('/api/v1/brands', 100);
    const segment = locale === 'en' ? 'brands' : 'marcas';
    return brands.map((b) => ({
      url: `${base}${localePath(locale, ['monitores', segment, b.slug])}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));
  }

  if (type === 'articles') {
    const posts = await fetchAll<PostPublic>('/api/v1/posts', 100);
    const segment = locale === 'en' ? 'articles' : 'articulos';
    return posts.map((p) => ({
      url: `${base}${localePath(locale, [segment, p.slug])}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));
  }

  if (type === 'comparisons') {
    const comparisons = await fetchAll<ComparisonPublic>('/api/v1/comparisons', 100);
    return comparisons.map((c) => ({
      url: `${base}${localePath(locale, ['comparativas', c.slug])}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));
  }

  if (type === 'hubs') {
    const hubs = await fetchAll<PseoHubPublic>('/api/v1/hubs', 100);
    return hubs.map((h) => ({
      url: `${base}${localePath(locale, ['hubs', h.slug])}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));
  }

  return [];
}
