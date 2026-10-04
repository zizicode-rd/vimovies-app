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
    locale: 'es',
    path: `/es/monitores/marcas/${brand}`,
    title: `Monitores ${brand} — Catálogo completo`,
    description: `Descubre todos los monitores ${brand} con fichas técnicas, puntuaciones y comparativas en Vimonitors.`,
    type: 'website',
  });
}

export default async function BrandPage({ params, searchParams }: PageProps) {
  const { brand } = await params;
  const sp = await searchParams;
  const mergedParams = Promise.resolve({ ...sp, brand });

  const breadcrumb = jsonLdBreadcrumb([
    { name: 'Inicio', url: 'https://vimonitors.com/es' },
    { name: 'Monitores', url: 'https://vimonitors.com/es/monitores' },
    { name: brand, url: `https://vimonitors.com/es/monitores/marcas/${brand}` },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumb }} />
      <Header locale="es" />
      <main>
        <MonitorCatalog locale="es" searchParams={mergedParams} />
      </main>
      <Footer locale="es" />
    </>
  );
}
