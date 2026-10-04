import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MonitorDetail from '@/components/MonitorDetail';
import { buildMetadata, baseUrl } from '@/lib/seo';
import { generateMonitorJsonLd } from '@/lib/jsonld';
import { getCachedMonitor } from '@/lib/api-cache';
import type { MonitorPublic } from '@/types/api';

interface PageProps { params: Promise<{ brand: string; slug: string }> }

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

  return { title, description };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { brand, slug } = await params;
  const monitor = await getCachedMonitor(slug, 'es');
  if (!monitor) {
    return buildMetadata({
      locale: 'es',
      path: `/es/monitores/${brand}/${slug}`,
      title: 'Ficha de monitor',
      description: 'Ficha técnica del monitor en Vimonitors.',
      type: 'website',
      noIndex: true,
    });
  }

  const { title, description } = buildMonitorMeta(monitor, brand, 'es');
  const image = `${baseUrl}/es/monitores/${brand}/${slug}/opengraph-image.png`;

  return buildMetadata({
    locale: 'es',
    path: `/es/monitores/${brand}/${slug}`,
    title,
    description,
    image,
    type: 'article',
  });
}

export default async function MonitorPage({ params }: PageProps) {
  const { brand, slug } = await params;
  const monitor = await getCachedMonitor(slug, 'es');

  const canonicalUrl = `https://vimonitors.com/es/monitores/${brand}/${slug}`;
  const { breadcrumb, product } = monitor
    ? generateMonitorJsonLd(monitor, 'es', canonicalUrl)
    : { breadcrumb: null, product: null };

  return (
    <>
      {breadcrumb && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />}
      {product && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(product) }} />}
      <Header locale="es" />
      <main>
        {monitor ? (
          <MonitorDetail monitor={monitor} locale="es" brand={brand} />
        ) : (
          <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
            <h1>Monitor no encontrado</h1>
          </div>
        )}
      </main>
      <Footer locale="es" />
    </>
  );
}
