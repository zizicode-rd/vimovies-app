import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BlogList from '@/components/BlogList';
import { buildMetadata } from '@/lib/seo';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export const metadata: Metadata = buildMetadata({
  locale: 'en',
  path: '/en/blog',
  title: 'Monitor guides, reviews and comparisons blog',
  description: 'Technical guides, reviews and monitor comparisons for gaming, office and content creation. Learn how to choose the best monitor with Vimonitors.',
  type: 'website',
});

export default function BlogEN({ searchParams }: PageProps) {
  return (
    <>
      <Header locale="en" />
      <main>
        <BlogList locale="en" searchParams={searchParams} />
      </main>
      <Footer locale="en" />
    </>
  );
}
