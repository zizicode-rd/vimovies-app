import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MonitorDetail from '@/components/MonitorDetail';
import { apiFetch } from '@/lib/api';
import { buildMetadata, jsonLdBreadcrumb } from '@/lib/seo';
import { pickI18n } from '@/lib/i18n-utils';
import { normalizeMonitor } from '@/lib/monitor';
import type { MonitorPublic } from '@/types/api';

interface PageProps { params: Promise<{ brand: string; slug: string }> }

async function loadMonitor(slug: string) {
  try {
    const data = await apiFetch<any>(`/api/v1/monitors/${slug}`, { lang: 'en' });
    return pickI18n<MonitorPublic>(normalizeMonitor(data), 'en');
  } catch {
    return null;
  }
}

function buildMonitorMeta(monitor: MonitorPublic, brand: string, locale: 'es' | 'en') {
  const b = monitor.brand?.name ?? brand;
  const model = monitor.model_name;
  const base = monitor.base_specs;

  let title = monitor.meta_title || '';
  if (!title && base) {
    title = `${b} ${model} | ${base.panel_type} ${base.resolution_width}x${base.resolution_height} ${base.refresh_rate_hz}Hz`;
  }
  if (!title) title = `${b} ${model}`;
  if (title.length > 60) title = `${title.slice(0, 57)}…`;

  let description = monitor.meta_description || '';
  if (!description && base) {
    const inches = base.screen_size_inches ?? '';
    const panel = base.panel_type ?? '';
    const hz = base.refresh_rate_hz ?? '';
    const nits = base.brightness_nits ?? '';
    description = locale === 'en'
      ? `Technical specs of the ${b} ${model}: ${inches}" ${panel}, ${hz} Hz, ${nits} nits and more.`
      : `Ficha técnica del ${b} ${model}: ${inches}" ${panel}, ${hz} Hz, ${nits} nits y más.`;
  }
  if (!description) description = locale === 'en' ? `Specs and scores for ${b} ${model} at Vimonitors.` : `Ficha técnica y puntuaciones de ${b} ${model} en Vimonitors.`;
  if (description.length > 160) description = `${description.slice(0, 157)}…`;
  if (description.length < 70) description = locale === 'en' ? `${description} Discover all the technical details and benchmark scores.` : `${description} Descubre todos los detalles técnicos y puntuaciones.`;

  const image = monitor.main_image_url ?? monitor.media?.[0]?.cdn_url ?? monitor.media?.[0] as unknown as string ?? undefined;

  return { title, description, image };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { brand, slug } = await params;
  const monitor = await loadMonitor(slug);
  if (!monitor) {
    return buildMetadata({
      locale: 'en',
      path: `/en/monitores/${brand}/${slug}`,
      title: 'Monitor spec sheet',
      description: 'Monitor spec sheet at Vimonitors.',
      type: 'website',
      noIndex: true,
    });
  }

  const { title, description, image } = buildMonitorMeta(monitor, brand, 'en');

  return buildMetadata({
    locale: 'en',
    path: `/en/monitores/${brand}/${slug}`,
    title,
    description,
    image,
    type: 'article',
  });
}

export default async function MonitorPage({ params }: PageProps) {
  const { brand, slug } = await params;
  const monitor = await loadMonitor(slug);
  const name = monitor ? `${monitor.brand?.name ?? brand} ${monitor.model_name}` : slug.replace(/-/g, ' ');

  const breadcrumb = jsonLdBreadcrumb([
    { name: 'Home', url: 'https://vimonitors.com/en' },
    { name: 'Monitors', url: 'https://vimonitors.com/en/monitores' },
    { name: name, url: `https://vimonitors.com/en/monitores/${brand}/${slug}` },
  ]);

  const image = monitor?.main_image_url ?? monitor?.media?.[0]?.cdn_url ?? monitor?.media?.[0] as unknown as string ?? undefined;
  const scores = monitor?.scores ?? { gaming: 0, office: 0, editing: 0 };
  const bestScore = Math.max(scores.gaming, scores.office, scores.editing);
  const productLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    image,
    brand: {
      '@type': 'Brand',
      name: monitor?.brand?.name ?? brand,
    },
    url: `https://vimonitors.com/en/monitores/${brand}/${slug}`,
    description: monitor?.meta_description,
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: bestScore.toFixed(1),
      bestRating: '100',
      worstRating: '0',
      reviewCount: '1',
    },
    review: {
      '@type': 'Review',
      author: { '@type': 'Organization', name: 'Vimonitors' },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: bestScore.toFixed(1),
        bestRating: '100',
        worstRating: '0',
      },
      reviewBody: monitor?.meta_description,
    },
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumb }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: productLd }} />
      <Header locale="en" />
      <main>
        {monitor ? (
          <MonitorDetail monitor={monitor} locale="en" brand={brand} />
        ) : (
          <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
            <h1>Monitor not found</h1>
          </div>
        )}
      </main>
      <Footer locale="en" />
    </>
  );
}
