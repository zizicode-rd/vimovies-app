import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MonitorCatalog from '@/components/MonitorCatalog';
import { buildMetadata, jsonLdBreadcrumb } from '@/lib/seo';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export const metadata: Metadata = buildMetadata({
  locale: 'es',
  path: '/es/monitores',
  title: 'Catálogo de monitores gaming, oficina y edición',
  description: 'Explora cientos de monitores con fichas técnicas verificadas, puntuaciones por perfil de uso y comparativas cara a cara. Encuentra el mejor monitor para ti.',
  type: 'website',
});

export default async function CatalogES({ searchParams }: PageProps) {
  const breadcrumb = jsonLdBreadcrumb([
    { name: 'Inicio', url: 'https://vimovies.com/es' },
    { name: 'Monitores', url: 'https://vimovies.com/es/monitores' },
  ]);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumb }} />
      <Header locale="es" />
      <main>
        <MonitorCatalog locale="es" searchParams={searchParams} />
      </main>
      <Footer locale="es" />
    </>
  );
}
