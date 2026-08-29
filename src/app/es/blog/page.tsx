import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BlogList from '@/components/BlogList';
import { buildMetadata } from '@/lib/seo';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export const metadata: Metadata = buildMetadata({
  locale: 'es',
  path: '/es/blog',
  title: 'Blog y guías de monitores gaming, oficina y edición',
  description: 'Guías técnicas, análisis, reviews y comparativas de monitores. Aprende a elegir el mejor monitor según tu uso con Vimonitors.',
  type: 'website',
});

export default function BlogES({ searchParams }: PageProps) {
  return (
    <>
      <Header locale="es" />
      <main>
        <BlogList locale="es" searchParams={searchParams} />
      </main>
      <Footer locale="es" />
    </>
  );
}
