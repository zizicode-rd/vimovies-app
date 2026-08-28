import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import BrandStrip from '@/components/BrandStrip';
import CategorySection from '@/components/CategorySection';
import FeaturedMonitors from '@/components/FeaturedMonitors';
import PopularComparisons from '@/components/PopularComparisons';
import LatestGuides from '@/components/LatestGuides';
import WhyTrust from '@/components/WhyTrust';
import { buildMetadata, jsonLdBreadcrumb } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  locale: 'es',
  path: '/es',
  title: 'Elige tu monitor ideal con datos reales y comparativas verificadas',
  description: 'Comparador de monitores con especificaciones técnicas verificadas y puntuaciones reales por uso. Encuentra el mejor monitor gaming, oficina o edición en Vimovies.',
  type: 'website',
});

export default function HomeES() {
  const breadcrumb = jsonLdBreadcrumb([{ name: 'Inicio', url: 'https://vimovies.com/es' }]);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumb }} />
      <Header locale="es" />
      <main>
        <Hero locale="es" />
        <BrandStrip locale="es" />
        <PopularComparisons locale="es" />
        <FeaturedMonitors locale="es" />
        <CategorySection locale="es" />
        <LatestGuides locale="es" />
        <WhyTrust locale="es" />
      </main>
      <Footer locale="es" />
    </>
  );
}
