import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HubView from '@/components/HubView';
import { apiFetch } from '@/lib/api';
import { buildMetadata, jsonLdBreadcrumb } from '@/lib/seo';
import { pickI18n } from '@/lib/i18n-utils';
import { parseHubFilters, applyHubFilters } from '@/lib/hub-filters';
import { getTranslations } from '@/lib/i18n';
import type { PseoHubPublic, MonitorListItem, PaginatedResponse } from '@/types/api';

interface PageProps { params: Promise<{ slug: string }>; searchParams?: Promise<{ page?: string; per_page?: string }> }

async function loadHub(slug: string, locale: 'es' | 'en') {
  try {
    const data = await apiFetch<PseoHubPublic>(`/api/v1/hubs/${slug}`, { lang: locale });
    const hub = pickI18n<PseoHubPublic>(data, locale);
    if (hub) {
      hub.filters = parseHubFilters(hub) as any;
    }
    return hub;
  } catch {
    return null;
  }
}

async function loadMonitors(locale: 'es' | 'en') {
  try {
    const res = await apiFetch<PaginatedResponse<MonitorListItem>>('/api/v1/monitors?limit=1000', { lang: locale });
    return res.data ?? [];
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const hub = await loadHub(slug, 'es');
  return buildMetadata({
    locale: 'es',
    path: `/es/hubs/${slug}`,
    title: hub?.meta_title ?? slug,
    description: hub?.meta_description ?? `Los mejores monitores para ${slug} en Vimonitors.`,
    type: 'website',
  });
}

export default async function HubPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = await (searchParams ?? Promise.resolve({})) as Record<string, string | undefined>;
  const page = Math.max(1, Number(sp.page) || 1);
  const perPageOptions = [12, 24, 48, 96];
  const perPage = perPageOptions.includes(Number(sp.per_page)) ? Number(sp.per_page) : 24;

  const [hub, allMonitors] = await Promise.all([loadHub(slug, 'es'), loadMonitors('es')]);

  if (!hub) {
    return (
      <>
        <Header locale="es" />
        <main className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
          <h1>Hub no encontrado</h1>
          <p>El hub que buscas no existe.</p>
        </main>
        <Footer locale="es" />
      </>
    );
  }

  const matched = applyHubFilters(allMonitors, hub.filters as any);
  const total = matched.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const monitors = matched.slice((page - 1) * perPage, page * perPage);

  const translations = await getTranslations('es');

  const breadcrumb = jsonLdBreadcrumb([
    { name: 'Inicio', url: 'https://vimonitors.com/es' },
    { name: 'Hubs', url: 'https://vimonitors.com/es/hubs' },
    { name: hub.title, url: `https://vimonitors.com/es/hubs/${slug}` },
  ]);

  const collectionLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: hub.title,
    description: hub.meta_description,
    url: `https://vimonitors.com/es/hubs/${slug}`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: monitors.slice(0, 20).map((m, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `https://vimonitors.com/es/monitores/${m.brand_slug}/${m.slug}`,
      })),
    },
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumb }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: collectionLd }} />
      <Header locale="es" />
      <main>
        <HubView
          hub={hub}
          locale="es"
          translations={translations}
          monitors={monitors}
          page={page}
          perPage={perPage}
          total={total}
          totalPages={totalPages}
        />
      </main>
      <Footer locale="es" />
    </>
  );
}
