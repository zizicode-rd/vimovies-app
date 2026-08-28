import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ComparisonList from '@/components/ComparisonList';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  locale: 'es',
  path: '/es/comparativas',
  title: 'Comparativas de monitores cara a cara',
  description: 'Compara monitores cara a cara por especificaciones, puntuaciones y perfiles de uso. Descubre cuál es mejor para gaming, oficina o edición.',
  type: 'website',
});

export default async function ComparisonsES({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const a = Array.isArray(params.a) ? params.a[0] : params.a;
  return (
    <>
      <Header locale="es" />
      <main>
        <ComparisonList locale="es" preselectedA={a as string | undefined} />
      </main>
      <Footer locale="es" />
    </>
  );
}
