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
    const data = await apiFetch<ComparisonPublic>(`/api/v1/comparisons/${slug}`, { lang: 'en' });
    return pickI18n<ComparisonPublic>(data, 'en');
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
    const description = c.meta_description ?? `Head-to-head comparison: ${a.model_name} vs ${b.model_name}. Profile scores and verdict.`;
    return buildMetadata({
      locale: 'en',
      path: `/en/comparativas/${slug}`,
      title,
      description,
      type: 'article',
    });
  }

  if (names) {
    const aName = slugToName(names.a);
    const bName = slugToName(names.b);
    return buildMetadata({
      locale: 'en',
      path: `/en/comparativas/${slug}`,
      title: `${aName} vs ${bName}`,
      description: `Head-to-head comparison: ${aName} vs ${bName}. Profile scores and verdict on Vimonitors.`,
      type: 'website',
      noIndex: true,
    });
  }

  return buildMetadata({
    locale: 'en',
    path: `/en/comparativas/${slug}`,
    title: 'Monitor comparison',
    description: 'Head-to-head monitor comparison on Vimonitors.',
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
    { name: 'Home', url: 'https://vimonitors.com/en' },
    { name: 'Comparisons', url: 'https://vimonitors.com/en/comparativas' },
    { name: `${aName} vs ${bName}`, url: `https://vimonitors.com/en/comparativas/${slug}` },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumb }} />
      <Header locale="en" />
      <main>
        <ComparisonView slug={slug} locale="en" />
      </main>
      <Footer locale="en" />
    </>
  );
}
