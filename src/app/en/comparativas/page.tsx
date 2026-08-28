import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ComparisonList from '@/components/ComparisonList';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  locale: 'en',
  path: '/en/comparativas',
  title: 'Monitor comparisons side by side',
  description: 'Compare monitors side by side by specs, scores and usage profiles. Find the best one for gaming, office or content creation.',
  type: 'website',
});

export default async function ComparisonsEN({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const a = Array.isArray(params.a) ? params.a[0] : params.a;
  return (
    <>
      <Header locale="en" />
      <main>
        <ComparisonList locale="en" preselectedA={a as string | undefined} />
      </main>
      <Footer locale="en" />
    </>
  );
}
