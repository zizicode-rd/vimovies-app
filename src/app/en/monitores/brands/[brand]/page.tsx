import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MonitorCatalog from '@/components/MonitorCatalog';
import { buildMetadata, jsonLdBreadcrumb } from '@/lib/seo';

interface PageProps {
  params: Promise<{ brand: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { brand } = await params;
  return buildMetadata({
    locale: 'en',
    path: `/en/monitores/brands/${brand}`,
    title: `${brand} Monitors — Full Catalog`,
    description: `Discover every ${brand} monitor with verified specs, scores and comparisons at Vimonitors.`,
    type: 'website',
  });
}

export default async function BrandPage({ params, searchParams }: PageProps) {
  const { brand } = await params;
  const sp = await searchParams;
  const mergedParams = Promise.resolve({ ...sp, brand });

  const breadcrumb = jsonLdBreadcrumb([
    { name: 'Home', url: 'https://vimonitors.com/en' },
    { name: 'Monitors', url: 'https://vimonitors.com/en/monitores' },
    { name: brand, url: `https://vimonitors.com/en/monitores/brands/${brand}` },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumb }} />
      <Header locale="en" />
      <main>
        <MonitorCatalog locale="en" searchParams={mergedParams} />
      </main>
      <Footer locale="en" />
    </>
  );
}
