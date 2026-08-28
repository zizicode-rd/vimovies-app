import HeaderClient from './HeaderClient';
import { getTranslations, t } from '@/lib/i18n';
import { pickI18n } from '@/lib/i18n-utils';
import { apiFetch } from '@/lib/api';
import type { MonitorListItem, ComparisonPublic, PostPublic, PaginatedResponse } from '@/types/api';

function formatNumber(n: number, locale: 'es' | 'en') {
  return n.toLocaleString(locale === 'en' ? 'en-US' : 'es-ES');
}

async function loadData(locale: 'es' | 'en') {
  const fallback = { monitors: 1200, comparisons: 96, monitorsList: [], posts: [] };
  try {
    const [monitors, comparisons, posts] = await Promise.all([
      apiFetch<PaginatedResponse<MonitorListItem>>('/api/v1/monitors?limit=60', { lang: locale }).catch(() => ({ data: [], pagination: { total: fallback.monitors } })),
      apiFetch<PaginatedResponse<ComparisonPublic>>('/api/v1/comparisons?limit=1', { lang: locale }).catch(() => ({ data: [], pagination: { total: fallback.comparisons } })),
      apiFetch<PaginatedResponse<PostPublic>>('/api/v1/posts?limit=20', { lang: locale }).catch(() => ({ data: [], pagination: { total: 0 } })),
    ]);

    return {
      totals: {
        monitors: monitors.pagination?.total ?? fallback.monitors,
        comparisons: comparisons.pagination?.total ?? fallback.comparisons,
      },
      monitors: (monitors.data ?? []).map((m) => pickI18n<MonitorListItem>(m, locale)),
      posts: (posts.data ?? []).map((p) => pickI18n<PostPublic>(p, locale)),
    };
  } catch {
    return { totals: fallback, monitors: [], posts: [] };
  }
}

function formatTopBar(template: string, values: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? `{${key}}`);
}

export default async function Header({ locale = 'es' }: { locale?: 'es' | 'en' }) {
  const translations = await getTranslations(locale);
  const { totals, monitors, posts } = await loadData(locale);

  const template = t(translations, 'topBar.text') as string;
  const topBarText = formatTopBar(
    template.includes('{') ? template : (locale === 'en' ? '{monitors} monitors calibrated · new data every week' : '{monitors} monitores calibrados · nuevos datos cada semana'),
    {
      monitors: formatNumber(totals.monitors, locale),
      comparisons: formatNumber(totals.comparisons, locale),
    }
  );

  return (
    <HeaderClient
      locale={locale}
      translations={translations}
      topBarText={topBarText}
      monitors={monitors}
      posts={posts}
    />
  );
}
