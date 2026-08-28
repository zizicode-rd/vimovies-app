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
import { getTranslations, t } from '@/lib/i18n';

export async function generateMetadata(): Promise<Metadata> {
  const translations = await getTranslations('es');
  return buildMetadata({
    locale: 'es',
    path: '/es',
    title: t(translations, 'metadata.title'),
    description: t(translations, 'metadata.description'),
    ogTitle: t(translations, 'metadata.og_title'),
    ogDescription: t(translations, 'metadata.og_description'),
    type: 'website',
  });
}

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
