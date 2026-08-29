import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PostView from '@/components/PostView';
import { apiFetch } from '@/lib/api';
import { buildMetadata, jsonLdBreadcrumb } from '@/lib/seo';
import { pickI18n } from '@/lib/i18n-utils';
import { getTranslations } from '@/lib/i18n';
import type { PostPublic, MonitorListItem, PaginatedResponse } from '@/types/api';

interface PageProps { params: Promise<{ slug: string }> }

async function loadPost(slug: string) {
  try {
    const data = await apiFetch<PostPublic>(`/api/v1/posts/${slug}`, { lang: 'en' });
    return pickI18n<PostPublic>(data, 'en');
  } catch {
    return null;
  }
}

async function loadAllMonitors() {
  try {
    const res = await apiFetch<PaginatedResponse<MonitorListItem>>('/api/v1/monitors?limit=1000', { lang: 'en' });
    return res.data ?? [];
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await loadPost(slug);
  if (!post) {
    return buildMetadata({
      locale: 'en',
      path: `/en/article/${slug}`,
      title: 'Article',
      description: 'Technical guide and analysis at Vimonitors.',
      type: 'article',
      noIndex: true,
    });
  }

  return buildMetadata({
    locale: 'en',
    path: `/en/article/${slug}`,
    title: post.meta_title || post.title,
    description: post.meta_description || post.summary,
    type: 'article',
  });
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const [post, allMonitors] = await Promise.all([loadPost(slug), loadAllMonitors()]);

  const relatedIds = (post?.related_monitors ?? []).map((r: any) => typeof r === 'string' ? r : r.id);
  const relatedMonitors = allMonitors.filter((m) => relatedIds.includes(m.id));
  const translations = await getTranslations('en');

  const articleLd = post ? JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.meta_description || post.summary,
    image: post.featured_image_url || undefined,
    datePublished: post.published_at,
    author: { '@type': 'Organization', name: 'Vimonitors' },
  }) : '';

  const breadcrumb = post ? jsonLdBreadcrumb([
    { name: 'Home', url: 'https://vimonitors.com/en' },
    { name: 'Blog', url: 'https://vimonitors.com/en/blog' },
    { name: post.title, url: `https://vimonitors.com/en/article/${slug}` },
  ]) : '';

  return (
    <>
      {post && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: articleLd }} />}
      {post && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumb }} />}
      <Header locale="en" />
      <main>
        {post ? <PostView post={post} relatedMonitors={relatedMonitors} locale="en" translations={translations} /> : (
          <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
            <h1>Article not found</h1>
          </div>
        )}
      </main>
      <Footer locale="en" />
    </>
  );
}
