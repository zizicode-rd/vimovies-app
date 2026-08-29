import Link from 'next/link';
import { getTranslations, t } from '@/lib/i18n';
import { apiFetch } from '@/lib/api';
import { pickI18n } from '@/lib/i18n-utils';
import type { PostPublic, PaginatedResponse } from '@/types/api';
import styles from './BlogList.module.scss';

async function loadPosts(locale: 'es' | 'en', category?: string, page: number = 1, perPage: number = 24) {
  try {
    const qs = new URLSearchParams();
    qs.set('limit', String(perPage));
    qs.set('page', String(page));
    if (category) qs.set('category', category);
    const data = await apiFetch<PaginatedResponse<PostPublic>>(`/api/v1/posts?${qs.toString()}`, { lang: locale });
    return {
      posts: data.data.map((p) => pickI18n<PostPublic>(p, locale)),
      total: (data as any).pagination?.total ?? (data as any).meta?.total ?? (data as any).total ?? data.data.length,
      totalPages: (data as any).pagination?.total_pages ?? (data as any).meta?.total_pages ?? (data as any).total_pages ?? 1,
      page,
      perPage,
    };
  } catch {
    return { posts: [], total: 0, totalPages: 1, page, perPage };
  }
}

function formatDate(date: string, locale: 'es' | 'en') {
  if (!date) return '';
  return new Date(date).toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
}

function readTime(text: string, locale: 'es' | 'en', translations: any) {
  const words = text?.split(' ').length ?? 0;
  const minutes = Math.max(1, Math.ceil(words / 200));
  const template = t(translations, 'blog.minRead', locale === 'en' ? '{min} min read' : '{min} min de lectura') as string;
  return template.replace('{min}', String(minutes));
}

const filterKeys = ['all', 'guide', 'review', 'news', 'faq'] as const;

function filterLabel(translations: any, key: string, locale: 'es' | 'en') {
  const defaultLabels: Record<string, string> = {
    all: locale === 'en' ? 'All' : 'Todas',
    guide: locale === 'en' ? 'Guides' : 'Guías',
    review: 'Reviews',
    news: locale === 'en' ? 'News' : 'Noticias',
    faq: 'FAQ',
  };
  return t(translations, `blog.filter${key.charAt(0).toUpperCase() + key.slice(1)}`, defaultLabels[key]) as string;
}

function classNames(...args: (string | false | undefined)[]) {
  return args.filter(Boolean).join(' ');
}

function buildQuery(category: string | undefined, page: number, perPage: number) {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (perPage !== 24) params.set('per_page', String(perPage));
  if (page > 1) params.set('page', String(page));
  return params.toString();
}

export default async function BlogList({
  locale,
  searchParams,
}: {
  locale: 'es' | 'en';
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const base = locale === 'en' ? '/en' : '/es';
  const translations = await getTranslations(locale);
  const raw = await searchParams;
  const category = ((Array.isArray(raw.category) ? raw.category[0] : raw.category) || '').toLowerCase();
  const page = Math.max(1, Number(raw.page) || 1);
  const perPageOptions = [12, 24, 48, 96];
  const perPage = perPageOptions.includes(Number(raw.per_page)) ? Number(raw.per_page) : 24;

  const { posts, total, totalPages, page: currentPage } = await loadPosts(locale, category || undefined, page, perPage);
  const featured = posts[0];
  const feed = posts.slice(1);
  const topPosts = posts.slice(0, 4);

  const filterHref = (key: string) => {
    const q = buildQuery(key === 'all' ? undefined : key, 1, perPage);
    return `${base}/blog${q ? `?${q}` : ''}`;
  };

  const pageHref = (p: number) => {
    const q = buildQuery(category || undefined, p, perPage);
    return `${base}/blog${q ? `?${q}` : ''}`;
  };

  return (
    <>
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroContent}>
            <span className={styles.eyebrow}>{t(translations, 'blog.eyebrow', 'Blog')}</span>
            <h1 className={styles.title}>{t(translations, 'blog.title', 'Guías y análisis')}</h1>
            <p className={styles.lead}>{t(translations, 'blog.lead', 'Aprende a elegir el monitor perfecto con nuestras guías técnicas y comparativas.')}</p>
            <div className={styles.filters}>
              {filterKeys.map((f) => (
                <Link
                  key={f}
                  href={filterHref(f)}
                  className={classNames(styles.filterPill, (category || 'all') === f && styles.active)}
                >
                  {filterLabel(translations, f, locale)}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.feedSection}>
        <div className="container" style={{ paddingBottom: '80px' }}>
          {posts.length === 0 ? (
            <p className={styles.empty}>{t(translations, 'blog.empty', 'No hay artículos disponibles.')}</p>
          ) : (
            <div className={styles.layout}>
              <div className={styles.main}>
                {featured && (
                  <Link href={`${base}/article/${featured.slug}`} className={styles.featured}>
                    <div className={styles.featuredMedia}>
                      {featured.featured_image_url ? (
                        <img src={featured.featured_image_url} alt={featured.title} className={styles.featuredImage} />
                      ) : (
                        <span className={styles.featuredNoImage}>{featured.category}</span>
                      )}
                    </div>
                    <div className={styles.featuredBody}>
                      <span className={styles.featuredTag}>{featured.category}</span>
                      <h2 className={styles.featuredTitle}>{featured.title}</h2>
                      <p className={styles.featuredSummary}>{featured.summary}</p>
                      <div className={styles.featuredMeta}>
                        <span className={styles.metaItem}>{t(translations, 'blog.author', 'Vimonitors')}</span>
                        <span className={styles.metaDot}>•</span>
                        <span className={styles.metaItem}>{readTime(featured.summary, locale, translations)}</span>
                        <span className={styles.metaDot}>•</span>
                        <span className={styles.metaItem}>{formatDate(featured.published_at || featured.created_at, locale)}</span>
                      </div>
                    </div>
                  </Link>
                )}

                {feed.length > 0 && (
                  <div className={styles.grid}>
                    {feed.map((post) => (
                      <Link
                        key={post.id}
                        href={`${base}/article/${post.slug}`}
                        className={styles.card}
                      >
                        <div className={styles.imageWrap}>
                          {post.featured_image_url ? (
                            <img src={post.featured_image_url} alt={post.title} className={styles.image} />
                          ) : (
                            <span className={styles.noImage}>{post.category}</span>
                          )}
                          <button type="button" className={styles.save} aria-label={t(translations, 'blog.saveAria', 'Guardar') as string} />
                        </div>
                        <div className={styles.body}>
                          <span className={styles.category}>{post.category}</span>
                          <h3 className={styles.postTitle}>{post.title}</h3>
                          <p className={styles.summary}>{post.summary}</p>
                          <div className={styles.cardFoot}>
                            <span>{readTime(post.summary, locale, translations)}</span>
                            <span>{formatDate(post.published_at || post.created_at, locale)}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {totalPages > 1 && (
                  <nav className={styles.pagination} aria-label="Pagination">
                    {currentPage > 1 && (
                      <Link href={pageHref(currentPage - 1)} className={styles.pageItem}>←</Link>
                    )}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <Link
                        key={p}
                        href={pageHref(p)}
                        className={classNames(styles.pageItem, p === currentPage && styles.active)}
                      >
                        {p}
                      </Link>
                    ))}
                    {currentPage < totalPages && (
                      <Link href={pageHref(currentPage + 1)} className={styles.pageItem}>→</Link>
                    )}
                  </nav>
                )}
              </div>

              <aside className={styles.sidebar}>
                <div className={styles.widget}>
                  <h4 className={styles.widgetTitle}>{t(translations, 'blog.mostRead', 'Lo más leído')}</h4>
                  <ol className={styles.topList}>
                    {topPosts.map((post, i) => (
                      <li key={post.id} className={styles.topItem}>
                        <span className={styles.topRank}>{i + 1}</span>
                        <Link href={`${base}/article/${post.slug}`} className={styles.topLink}>
                          <span className={styles.topTitle}>{post.title}</span>
                          <span className={styles.topReads}>{readTime(post.summary, locale, translations)}</span>
                        </Link>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className={`${styles.widget} ${styles.compareWidget}`}>
                  <h4 className={styles.widgetTitle}>{t(translations, 'blog.quickCompare', 'Comparador rápido')}</h4>
                  <p className={styles.widgetText}>{t(translations, 'blog.quickCompareText', 'Compara monitores cara a cara y elige el mejor para ti.')}</p>
                  <Link href={`${base}/comparativas`} className={styles.compareBtn}>{t(translations, 'blog.compareNow', 'Comparar ahora')}</Link>
                </div>
              </aside>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
