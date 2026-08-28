'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { t } from '@/lib/i18n-client';
import type { PostPublic, PostContentBlock, MonitorListItem } from '@/types/api';
import { countProductCards } from '@/lib/post-helpers';
import PostProgress from './PostProgress';
import BlockRenderer from './BlockRenderer';
import styles from './PostView.module.scss';

function formatDate(date: string, locale: 'es' | 'en') {
  return new Date(date).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatYear(date: string) {
  return new Date(date).getFullYear();
}

function estimateReadTime(blocks: PostContentBlock[], locale: 'es' | 'en') {
  const words = blocks.reduce((acc, b) => {
    const text = (b.text ?? b.content ?? '');
    const itemWords = (b.items ?? []).reduce((s, item) => s + item.split(/\s+/).length, 0);
    return acc + text.split(/\s+/).length + itemWords;
  }, 0);
  const minutes = Math.max(1, Math.round(words / 200));
  return locale === 'en' ? `${minutes} min read` : `${minutes} min de lectura`;
}

function parseContent(post: PostPublic): PostContentBlock[] {
  const raw = post.content_json;
  if (!raw) return [];
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return parsed.blocks || [];
    } catch {
      return [{ type: 'paragraph', text: raw }];
    }
  }
  return raw.blocks || [];
}

export default function PostView({
  post,
  relatedMonitors = [],
  locale,
  translations,
}: {
  post: PostPublic;
  relatedMonitors?: MonitorListItem[];
  locale: 'es' | 'en';
  translations?: any;
}) {
  const base = locale === 'en' ? '/en' : '/es';
  const blocks = parseContent(post);
  const headings = useMemo(
    () => blocks
      .filter((b) => b.type === 'heading' && (b.text ?? b.content))
      .map((b, i) => ({ text: (b.text ?? b.content) as string, id: `block-${i}` })),
    [blocks]
  );
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    function onScroll() {
      const offsets = headings.map((h) => {
        const el = document.getElementById(h.id);
        return { ...h, top: el ? el.offsetTop : 0 };
      });
      const scrollY = window.scrollY + 120;
      let current = offsets[0]?.id || null;
      for (let i = offsets.length - 1; i >= 0; i--) {
        if (scrollY >= offsets[i].top) {
          current = offsets[i].id;
          break;
        }
      }
      setActiveId(current);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [headings]);

  const year = formatYear(post.published_at || post.created_at);
  const readTime = estimateReadTime(blocks, locale);
  const picks = countProductCards(blocks);

  return (
    <>
      <PostProgress />

      <section className={styles.hero}>
        <div className={styles.heroGradient} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className={styles.heroBadges}>
            <span className={styles.heroBadge}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
              ACTUALIZADO {year}
            </span>
            <span className={styles.heroBadge}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
              GUÍA TÉCNICA
            </span>
            <span className={styles.heroBadge}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
              {readTime}
            </span>
          </div>
          <h1 className={styles.heroTitle}>{post.title}</h1>
          <p className={styles.heroSummary}>{post.summary}</p>
          <div className={styles.heroMeta}>
            <span>{t(translations, 'blog.by', 'By')} {post.author || t(translations, 'blog.author', 'Vimovies')}</span>
            <span className={styles.heroDot}>&middot;</span>
            <span>{formatDate(post.published_at || post.created_at, locale)}</span>
          </div>
        </div>
      </section>

      <div className="container">
        <div className={styles.coverWrap}>
          {post.featured_image_url ? (
            <img src={post.featured_image_url} alt={post.title} className={styles.coverImage} />
          ) : (
            <div className={styles.coverImage} />
          )}
          <div className={styles.coverOverlay}>
            <span className={styles.coverPicks}>Picks probados: {picks} monitores</span>
          </div>
        </div>
      </div>

      <div className="container">
        <div className={styles.layout}>
          <article className={styles.prose}>
            <BlockRenderer blocks={blocks} base={base} relatedMonitors={relatedMonitors} />
          </article>

          <aside className={styles.sidebar}>
            {relatedMonitors.length > 0 && (
              <div className={`${styles.box} ${styles.relatedBox}`}>
                <h5>{locale === 'en' ? 'Related monitors' : 'Monitores relacionados'}</h5>
                <div className={styles.relatedList}>
                  {relatedMonitors.map((m) => (
                    <Link
                      key={m.id}
                      href={`${base}/monitores/${m.brand_slug}/${m.slug}`}
                      className={styles.relatedItem}
                    >
                      <div className={styles.relatedImage}>
                        {m.main_image_url ? (
                          <img src={m.main_image_url} alt={m.model_name} loading="lazy" />
                        ) : (
                          <span>{m.brand_name}</span>
                        )}
                      </div>
                      <div className={styles.relatedBody}>
                        <span className={styles.relatedBrand}>{m.brand_name}</span>
                        <span className={styles.relatedName}>{m.model_name}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {headings.length > 0 && (
              <div className={`${styles.box} ${styles.tocBox}`}>
                <h5>{locale === 'en' ? 'In this article' : 'En este artículo'}</h5>
                <nav className={styles.toc}>
                  {headings.map((h) => (
                    <a
                      key={h.id}
                      href={`#${h.id}`}
                      className={activeId === h.id ? styles.active : ''}
                    >
                      {h.text}
                    </a>
                  ))}
                </nav>
              </div>
            )}
          </aside>
        </div>
      </div>
    </>
  );
}
