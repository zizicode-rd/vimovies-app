import type { MetadataRoute } from 'next';
import { apiFetch } from '@/lib/api';
import type { MonitorListItem, PaginatedResponse, PostPublic, ComparisonPublic, PseoHubPublic, BrandPublic } from '@/types/api';

const base = 'https://vimovies.com';
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

function mapByLocale<T>(items: T[], map: (item: T, locale: typeof locales[number]) => string): MetadataRoute.Sitemap {
  const routes: MetadataRoute.Sitemap = [];
  for (const locale of locales) {
    for (const item of items) {
      routes.push({
        url: `${base}${map(item, locale)}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.6,
      });
    }
  }
  return routes;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [monitors, brands, posts, comparisons, hubs] = await Promise.all([
    fetchAll<MonitorListItem>('/api/v1/monitors', 1000),
    fetchAll<BrandPublic>('/api/v1/brands', 100),
    fetchAll<PostPublic>('/api/v1/posts', 100),
    fetchAll<ComparisonPublic>('/api/v1/comparisons', 100),
    fetchAll<PseoHubPublic>('/api/v1/hubs', 100),
  ]);

  const staticRoutes = [
    '/es', '/en',
    '/es/monitores', '/en/monitores',
    '/es/comparativas', '/en/comparativas',
    '/es/blog', '/en/blog',
  ];

  const routes: MetadataRoute.Sitemap = staticRoutes.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: path === '/es' || path === '/en' ? 1 : 0.8,
  }));

  routes.push(...mapByLocale(monitors, (m, l) => `/${l}/monitores/${m.brand_slug}/${m.slug}`));
  routes.push(...mapByLocale(brands, (b, l) => `/${l}/monitores?brand=${b.slug}`));
  routes.push(...mapByLocale(posts, (p, l) => `/${l}/article/${p.slug}`));
  routes.push(...mapByLocale(comparisons, (c, l) => `/${l}/comparativas/${c.slug}`));
  routes.push(...mapByLocale(hubs, (h, l) => `/${l}/hubs/${h.slug}`));

  return routes;
}
