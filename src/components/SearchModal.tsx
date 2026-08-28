'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { MonitorListItem, PostPublic, ComparisonPublic } from '@/types/api';
import styles from './SearchModal.module.scss';

type SearchTab = 'monitors' | 'articles' | 'comparisons';

interface SearchResponse {
  ok: boolean;
  data?: {
    monitors?: MonitorListItem[];
    posts?: PostPublic[];
    comparisons?: ComparisonPublic[];
  };
  error?: { message?: string };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

async function fetchSearch(q: string, locale: 'es' | 'en', limit: number, signal: AbortSignal): Promise<SearchResponse> {
  const url = new URL('/api/v1/search', API_URL);
  url.searchParams.set('q', q);
  url.searchParams.set('lang', locale);
  url.searchParams.set('limit', String(limit));

  const res = await fetch(url.toString(), { signal });
  const text = await res.text();
  try {
    return JSON.parse(text) as SearchResponse;
  } catch {
    return { ok: false, error: { message: 'Invalid response' } };
  }
}

function formatMonitorName(m: { brand_name?: string; model_name: string }) {
  const brand = m.brand_name ?? '';
  const model = m.model_name ?? '';
  return model.toLowerCase().startsWith(brand.toLowerCase()) ? model : `${brand} ${model}`;
}

function formatResolutionShort(m: MonitorListItem): string | null {
  const w = m.base_specs?.resolution_width;
  const h = m.base_specs?.resolution_height;
  if (w && h) {
    if (w >= 3840) return '4K';
    if (w >= 2560 && h >= 1440) return 'QHD';
    if (w >= 1920) return 'FHD';
    return `${w}×${h}`;
  }
  const text = `${m.meta_title} ${m.model_name}`;
  if (/4K|UHD|3840x2160/i.test(text)) return '4K';
  if (/QHD|1440p|2560x1440/i.test(text)) return 'QHD';
  if (/FHD|1080p|1920x1080/i.test(text)) return 'FHD';
  return null;
}

function formatMonitorMeta(m: MonitorListItem, locale: 'es' | 'en'): string {
  const parts: string[] = [];
  const panel = m.base_specs?.panel_type;
  const hz = m.base_specs?.refresh_rate_hz;
  const res = formatResolutionShort(m);

  if (panel) parts.push(panel);
  if (hz) parts.push(`${hz}Hz`);
  if (res) parts.push(res);

  if (parts.length) return parts.join(' · ');
  return locale === 'en' ? 'Monitor' : 'Monitor';
}

export default function SearchModal({
  locale,
  isOpen,
  onClose,
}: {
  locale: 'es' | 'en';
  isOpen: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [tab, setTab] = useState<SearchTab>('monitors');
  const [results, setResults] = useState<SearchResponse['data']>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const base = locale === 'en' ? '/en' : '/es';

  const monitors = results?.monitors ?? [];
  const articles = results?.posts ?? [];
  const comparisons = results?.comparisons ?? [];

  const currentItems = tab === 'monitors' ? monitors : tab === 'articles' ? articles : comparisons;

  useEffect(() => {
    if (!isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery('');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDebounced('');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults({});
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError(null);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedIndex(0);
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedIndex(0);
      inputRef.current?.focus();
    }
  }, [isOpen, tab]);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (debounced.length < 2) {
      setResults({});
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    const controller = new AbortController();

    fetchSearch(debounced, locale, 10, controller.signal)
      .then((res) => {
        if (res.ok && res.data) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setResults(res.data);
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setSelectedIndex(0);
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setError(null);
        } else {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setResults({});
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setError(res.error?.message ?? 'Search error');
        }
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setError(err.message ?? 'Search error');
        }
      })
      .finally(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(false);
      });

    return () => controller.abort();
  }, [debounced, locale]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const navigate = useCallback((direction: 'up' | 'down') => {
    setSelectedIndex((prev) => {
      if (currentItems.length === 0) return 0;
      const last = currentItems.length - 1;
      if (direction === 'up') return prev <= 0 ? last : prev - 1;
      return prev >= last ? 0 : prev + 1;
    });
  }, [currentItems.length]);

  const activateSelected = useCallback(() => {
    const item = currentItems[selectedIndex];
    if (!item) return;
    if (tab === 'monitors') {
      const m = item as MonitorListItem;
      router.push(`${base}/monitores/${m.brand_slug}/${m.slug}`);
    } else if (tab === 'articles') {
      const p = item as PostPublic;
      router.push(`${base}/article/${p.slug}`);
    } else {
      const c = item as ComparisonPublic;
      router.push(`${base}/comparativas/${c.slug}`);
    }
  }, [currentItems, selectedIndex, tab, base, router]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (!isOpen || !currentItems.length) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        navigate('down');
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        navigate('up');
      } else if (e.key === 'Enter') {
        e.preventDefault();
        activateSelected();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, isOpen, currentItems.length, navigate, activateSelected]);

  useEffect(() => {
    const node = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    if (node && listRef.current) {
      const listRect = listRef.current.getBoundingClientRect();
      const nodeRect = (node as HTMLElement).getBoundingClientRect();
      if (nodeRect.top < listRect.top + 8) {
        listRef.current.scrollTop -= listRect.top - nodeRect.top + 8;
      } else if (nodeRect.bottom > listRect.bottom - 8) {
        listRef.current.scrollTop += nodeRect.bottom - listRect.bottom + 8;
      }
    }
  }, [selectedIndex, tab]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose} aria-hidden="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className={styles.head}>
          <div className={styles.inputWrap}>
            <svg className={styles.searchIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
            <input
              ref={inputRef}
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={locale === 'en' ? 'Search monitors, articles or vs…' : 'Buscar monitores, artículos o vs…'}
              className={styles.input}
              aria-activedescendant={`search-item-${selectedIndex}`}
            />
            <kbd className={styles.kbd} onClick={onClose}>ESC</kbd>
          </div>

          <div className={styles.tabs}>
            {[
              { key: 'monitors', label: `${locale === 'en' ? 'Monitors' : 'Monitores'} ${monitors.length ? `(${monitors.length})` : ''}` },
              { key: 'articles', label: `${locale === 'en' ? 'Articles' : 'Artículos'} ${articles.length ? `(${articles.length})` : ''}` },
              { key: 'comparisons', label: `VS ${comparisons.length ? `(${comparisons.length})` : ''}` },
            ].map((t) => (
              <button
                key={t.key}
                className={`${styles.tab} ${tab === t.key ? styles.active : ''}`}
                onClick={() => { setTab(t.key as SearchTab); setSelectedIndex(0); }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.body} ref={listRef}>
          {loading && <div className={styles.loading}></div>}
          {error && <div className={styles.error}>{error}</div>}

          {!loading && !error && tab === 'monitors' && (
            <div className={styles.list}>
              {monitors.length === 0 ? <div className={styles.empty}>{query.length < 2 ? (locale === 'en' ? 'Type at least 2 characters' : 'Escribe al menos 2 caracteres') : (locale === 'en' ? 'No monitors found' : 'No se encontraron monitores')}</div> : null}
              {monitors.map((m, i) => (
                <Link
                  key={m.id}
                  id={`search-item-${i}`}
                  data-index={i}
                  href={`${base}/monitores/${m.brand_slug}/${m.slug}`}
                  className={`${styles.item} ${selectedIndex === i ? styles.active : ''}`}
                  onClick={onClose}
                  onMouseEnter={() => setSelectedIndex(i)}
                >
                  <div className={styles.thumb}>{m.main_image_url ? <img src={m.main_image_url} alt="" /> : <div className={styles.ph} />}</div>
                  <div className={styles.info}>
                    <span className={styles.name}>{formatMonitorName(m)}</span>
                    <span className={styles.meta}>{formatMonitorMeta(m, locale)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!loading && !error && tab === 'articles' && (
            <div className={styles.list}>
              {articles.length === 0 ? <div className={styles.empty}>{query.length < 2 ? (locale === 'en' ? 'Type at least 2 characters' : 'Escribe al menos 2 caracteres') : (locale === 'en' ? 'No articles found' : 'No se encontraron artículos')}</div> : null}
              {articles.map((p, i) => (
                <Link
                  key={p.id}
                  id={`search-item-${i}`}
                  data-index={i}
                  href={`${base}/article/${p.slug}`}
                  className={`${styles.item} ${selectedIndex === i ? styles.active : ''}`}
                  onClick={onClose}
                  onMouseEnter={() => setSelectedIndex(i)}
                >
                  <div className={styles.info}>
                    <span className={styles.name}>{p.title}</span>
                    <span className={styles.meta}>{p.category}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!loading && !error && tab === 'comparisons' && (
            <div className={styles.list}>
              {comparisons.length === 0 ? <div className={styles.empty}>{query.length < 2 ? (locale === 'en' ? 'Type at least 2 characters' : 'Escribe al menos 2 caracteres') : (locale === 'en' ? 'No VS found' : 'No se encontraron VS')}</div> : null}
              {comparisons.map((c, i) => (
                <Link
                  key={c.id}
                  id={`search-item-${i}`}
                  data-index={i}
                  href={`${base}/comparativas/${c.slug}`}
                  className={`${styles.item} ${selectedIndex === i ? styles.active : ''}`}
                  onClick={onClose}
                  onMouseEnter={() => setSelectedIndex(i)}
                >
                  <span className={styles.vs}>VS</span>
                  <span className={styles.name}>{formatMonitorName(c.monitor_a)} <span className={styles.vsDivider}>vs</span> {formatMonitorName(c.monitor_b)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
