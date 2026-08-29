import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ComparisonView from '@/components/ComparisonView';
import { apiFetch } from '@/lib/api';
import { buildMetadata, jsonLdBreadcrumb } from '@/lib/seo';
import { pickI18n } from '@/lib/i18n-utils';
import type { ComparisonPublic } from '@/types/api';

interface PageProps { params: Promise<{ slug: string }> }

async function loadComparison(slug: string) {
  try {
    const data = await apiFetch<ComparisonPublic>(`/api/v1/comparisons/${slug}`, { lang: 'es' });
    return pickI18n<ComparisonPublic>(data, 'es');
  } catch {
    return null;
  }
}

function slugToName(slug: string) {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

function splitSlug(slug: string) {
  const parts = slug.split('-vs-');
  if (parts.length !== 2) return null;
  return { a: parts[0], b: parts[1] };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const c = await loadComparison(slug);
  const names = splitSlug(slug);

  if (c) {
    const a = c.monitor_a;
    const b = c.monitor_b;
    const title = `${a.model_name} vs ${b.model_name}`;
    const description = c.meta_description ?? `Comparativa cara a cara: ${a.model_name} frente a ${b.model_name}. Puntuaciones por perfil y veredicto.`;
    return buildMetadata({
      locale: 'es',
      path: `/es/comparativas/${slug}`,
      title,
      description,
      type: 'article',
    });
  }

  if (names) {
    const aName = slugToName(names.a);
    const bName = slugToName(names.b);
    return buildMetadata({
      locale: 'es',
      path: `/es/comparativas/${slug}`,
      title: `${aName} vs ${bName}`,
      description: `Comparativa cara a cara: ${aName} frente a ${bName}. Puntuaciones por perfil y veredicto en Vimonitors.`,
      type: 'website',
      noIndex: true,
    });
  }

  return buildMetadata({
    locale: 'es',
    path: `/es/comparativas/${slug}`,
    title: 'Comparativa de monitores',
    description: 'Comparativa cara a cara de monitores en Vimonitors.',
    type: 'website',
    noIndex: true,
  });
}

export default async function ComparisonPage({ params }: PageProps) {
  const { slug } = await params;
  const c = await loadComparison(slug);
  const aName = c ? c.monitor_a.model_name : 'A';
  const bName = c ? c.monitor_b.model_name : 'B';

  const breadcrumb = jsonLdBreadcrumb([
    { name: 'Inicio', url: 'https://vimonitors.com/es' },
    { name: 'Comparativas', url: 'https://vimonitors.com/es/comparativas' },
    { name: `${aName} vs ${bName}`, url: `https://vimonitors.com/es/comparativas/${slug}` },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumb }} />
      <Header locale="es" />
      <main>
        <ComparisonView slug={slug} locale="es" />
      </main>
      <Footer locale="es" />
    </>
  );
}
