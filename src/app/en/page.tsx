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
  const translations = await getTranslations('en');
  return buildMetadata({
    locale: 'en',
    path: '/en',
    title: t(translations, 'metadata.title'),
    description: t(translations, 'metadata.description'),
    ogTitle: t(translations, 'metadata.og_title'),
    ogDescription: t(translations, 'metadata.og_description'),
    type: 'website',
  });
}

export default function HomeEN() {
  const breadcrumb = jsonLdBreadcrumb([{ name: 'Home', url: 'https://vimonitors.com/en' }]);
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
