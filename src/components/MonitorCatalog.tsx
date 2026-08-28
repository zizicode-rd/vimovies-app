import { getTranslations } from '@/lib/i18n';
import { apiFetch } from '@/lib/api';
import { pickI18n } from '@/lib/i18n-utils';
import type { MonitorListItem, BrandPublic, PaginatedResponse } from '@/types/api';
import MonitorCatalogClient from './MonitorCatalogClient';

interface Filters {
  brand?: string;
  panel_type?: string;
  min_hz?: string;
  resolution?: string;
  q?: string;
  profile?: string;
  sort?: string;
  page?: string;
  per_page?: string;
}

function normalizeFilters(raw: { [key: string]: string | string[] | undefined }): Filters {
  const toStr = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? '';
  return {
    brand: toStr(raw.brand) || '',
    panel_type: toStr(raw.panel_type) || '',
    min_hz: toStr(raw.min_hz) || '',
    resolution: toStr(raw.resolution) || '',
    q: toStr(raw.q) || '',
    profile: toStr(raw.profile) || '',
    sort: toStr(raw.sort) || 'relevance',
    page: toStr(raw.page) || '1',
    per_page: toStr(raw.per_page) || '24',
  };
}

async function loadCatalog(locale: 'es' | 'en', filters: Filters) {
  const page = Math.max(1, Number(filters.page) || 1);
  const perPageOptions = [12, 24, 48, 96];
  const perPage = perPageOptions.includes(Number(filters.per_page)) ? Number(filters.per_page) : 24;

  const qs = new URLSearchParams();
  qs.set('limit', String(perPage));
  qs.set('page', String(page));
  if (filters.brand) qs.set('brand_slug', filters.brand);
  if (filters.panel_type) qs.set('panel_type', filters.panel_type);
  if (filters.min_hz) qs.set('min_refresh_rate_hz', filters.min_hz);
  if (filters.resolution) qs.set('resolution', filters.resolution);
  if (filters.q) qs.set('q', filters.q);
  if (filters.sort && filters.sort !== 'relevance') qs.set('sort', filters.sort);

  try {
    const [monitors, brands] = await Promise.all([
      apiFetch<PaginatedResponse<MonitorListItem>>(`/api/v1/monitors?${qs.toString()}`, { lang: locale }),
      apiFetch<PaginatedResponse<BrandPublic> | BrandPublic[]>('/api/v1/brands', { lang: locale }),
    ]);
    const brandList = Array.isArray(brands) ? brands : brands.data;
    const total = (monitors as any).pagination?.total ?? (monitors as any).meta?.total ?? (monitors as any).total ?? monitors.data?.length ?? 0;
    const totalPages = (monitors as any).pagination?.total_pages ?? (monitors as any).meta?.total_pages ?? (monitors as any).total_pages ?? Math.max(1, Math.ceil(total / perPage));
    return {
      allMonitors: (monitors.data ?? []).map((m) => pickI18n<MonitorListItem>(m, locale)),
      total,
      totalPages,
      page,
      perPage,
      brands: brandList.map((b) => pickI18n<BrandPublic>(b, locale)),
    };
  } catch {
    return { allMonitors: [], total: 0, totalPages: 1, page: 1, perPage: 24, brands: [] };
  }
}

export default async function MonitorCatalog({
  locale,
  searchParams,
}: {
  locale: 'es' | 'en';
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const base = locale === 'en' ? '/en' : '/es';
  const translations = await getTranslations(locale);
  const rawParams = await searchParams;
  const filters = normalizeFilters(rawParams);

  const { allMonitors, total, totalPages, page, perPage, brands } = await loadCatalog(locale, filters);

  return (
    <MonitorCatalogClient
      locale={locale}
      base={base}
      translations={translations}
      filters={filters}
      allMonitors={allMonitors}
      brands={brands}
      total={total}
      totalPages={totalPages}
      page={page}
      perPage={perPage}
    />
  );
}
