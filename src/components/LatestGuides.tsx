import Link from 'next/link';
import { getTranslations, t } from '@/lib/i18n';
import { apiFetch } from '@/lib/api';
import { pickI18n } from '@/lib/i18n-utils';
import type { PostPublic, PaginatedResponse } from '@/types/api';

function readingTime(text?: string) {
  const minutes = Math.max(3, Math.ceil((text?.length ?? 0) / 1200));
  return `${minutes} min`;
}

function formatDate(dateStr: string, locale: 'es' | 'en') {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString(locale === 'en' ? 'en-US' : 'es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

async function loadGuides(locale: 'es' | 'en') {
  try {
    const result = await apiFetch<PaginatedResponse<PostPublic>>('/api/v1/posts?limit=3', { lang: locale });
    return result.data?.slice(0, 3) ?? [];
  } catch (err) {
    console.error('LatestGuides fetch failed:', err);
    return [];
  }
}

export default async function LatestGuides({ locale }: { locale: 'es' | 'en' }) {
  const base = locale === 'en' ? '/en' : '/es';
  const translations = await getTranslations(locale);
  const posts = await loadGuides(locale);

  return (
    <section className="section paper">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="eyebrow">{t(translations, 'guides.eyebrow')}</span>
            <h2 className="section-title">{t(translations, 'guides.title')}</h2>
          </div>
          <Link href={`${base}/blog`} className="see-all">
            {t(translations, 'guides.seeAll')}
          </Link>
        </div>

        {posts.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--color-gray-500)', padding: '40px 0' }}>
            {t(translations, 'guides.empty')}
          </p>
        ) : (
          <div className="grid-3">
            {posts.map((raw) => {
              const post = pickI18n<PostPublic>(raw, locale);
              return (
                <Link
                  key={post.slug}
                  href={`${base}/article/${post.slug}`}
                  className="card post-card"
                >
                  <div className="ph">
                    {post.featured_image_url ? (
                      <img src={post.featured_image_url} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span className="ph-label">{post.category}</span>
                    )}
                  </div>
                  <div className="body">
                    <span className={`tag tag-${post.category.toLowerCase()}`}>{post.category}</span>
                    <h4>{post.title}</h4>
                    <p>{post.summary}</p>
                    <div className="meta">
                      <span>{readingTime(post.summary)} {t(translations, 'guides.reading')}</span>
                      <span>{formatDate(post.published_at, locale)}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
