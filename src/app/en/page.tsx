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
  locale: 'en',
  path: '/en',
  title: 'Find the best monitor with verified data and comparisons',
  description: 'Monitor comparison with verified technical specs and real usage scores. Find the best gaming, office or content creation monitor with Vimovies.',
  type: 'website',
});

export default function HomeEN() {
  const breadcrumb = jsonLdBreadcrumb([{ name: 'Home', url: 'https://vimovies.com/en' }]);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumb }} />
      <Header locale="en" />
      <main>
        <Hero locale="en" />
        <BrandStrip locale="en" />
        <PopularComparisons locale="en" />
        <FeaturedMonitors locale="en" />
        <CategorySection locale="en" />
        <LatestGuides locale="en" />
        <WhyTrust locale="en" />
      </main>
      <Footer locale="en" />
    </>
  );
}
