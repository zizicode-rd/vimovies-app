import { Suspense } from 'react';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MonitorCatalog from '@/components/MonitorCatalog';
import { MonitorCatalogSkeleton } from '@/components/ui/skeletons/MonitorCatalogSkeleton';
import { buildMetadata, jsonLdBreadcrumb } from '@/lib/seo';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export const metadata: Metadata = buildMetadata({
  locale: 'en',
  path: '/en/monitores',
  title: 'Monitor catalog for gaming, office and editing',
  description: 'Browse hundreds of monitors with verified specs, usage-based scores and head-to-head comparisons. Find the best monitor for your needs.',
  type: 'website',
});

export default async function CatalogEN({ searchParams }: PageProps) {
  const breadcrumb = jsonLdBreadcrumb([
    { name: 'Home', url: 'https://vimonitors.com/en' },
    { name: 'Monitors', url: 'https://vimonitors.com/en/monitores' },
  ]);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumb }} />
      <Header locale="en" />
      <main>
        <Suspense fallback={<MonitorCatalogSkeleton count={8} />}>
          <MonitorCatalog locale="en" searchParams={searchParams} />
        </Suspense>
      </main>
      <Footer locale="en" />
    </>
  );
}
