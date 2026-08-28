'use client';

import { useState, type ReactNode, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './MonitorCatalog.module.scss';
import { pickI18n } from '@/lib/i18n-utils';
import type { MonitorListItem, BrandPublic } from '@/types/api';

function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className={styles.filterBlock}>
      <h5>{title}</h5>
      {children}
    </div>
  );
}

function FilterButton({ k, value, children, filters, toggle }: { k: keyof Filters; value: string; children: ReactNode; filters: Filters; toggle: (key: keyof Filters, value: string) => void }) {
  const active = (filters as Record<string, string | undefined>)[k as string] === value;
  return (
    <button
      type="button"
      className={`${styles.filterOpt} ${active ? styles.active : ''}`}
      onClick={() => toggle(k, value)}
    >
      <span className={styles.check}>{active ? '✓' : ''}</span>
      {children}
    </button>
  );
}

interface Filters {
  brand?: string;
  panel_type?: string;
  min_hz?: string;
  resolution?: string;
  q?: string;
  profile?: string;
  sort?: string;
  page?: string;
  per_page?: string;
}

interface MonitorCatalogClientProps {
  locale: 'es' | 'en';
  base: string;
  translations: any;
  filters: Filters;
  allMonitors: MonitorListItem[];
  brands: BrandPublic[];
  total: number;
  totalPages: number;
  page: number;
  perPage: number;
}

function t(translations: any, key: string, fallback?: string) {
  if (!translations) return fallback ?? key;
  const parts = key.split('.');
  let cur: any = translations;
  for (const p of parts) {
    if (cur && typeof cur === 'object' && p in cur) cur = cur[p];
    else return fallback ?? key;
  }
  return cur;
}

function fmtResolution(w: number, h: number) {
  if (w >= 3840) return '4K';
  if (w >= 2560 && h >= 1440) return 'QHD';
  if (w >= 2560 && h === 1080) return 'WFHD';
  return 'FHD';
}

function parseMetaTitle(title?: string) {
  const chips: string[] = [];
  if (!title) return chips;
  const hz = title.match(/(\d+)Hz/i);
  const res = title.match(/(\d+p|4K)/i);
  const panel = title.match(/(Fast-IPS|Nano-IPS|IPS|VA|OLED|QD-OLED)/i);
  const ms = title.match(/(\d+(?:\.\d+)?)ms/i);
  if (res) chips.push(res[1].toUpperCase());
  if (hz) chips.push(`${hz[1]}Hz`);
  if (panel) chips.push(panel[1]);
  if (ms) chips.push(`${ms[1]}ms`);
  return chips;
}

function ImageWithSkeleton({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <>
      <div className={`${styles.skeleton} ${loaded ? styles.skeletonHidden : ''}`} aria-hidden="true" />
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={`${styles.thumb} ${loaded ? styles.thumbLoaded : styles.thumbHidden}`}
      />
    </>
  );
}

function buildQuery(filters: Filters, overrides?: Partial<Filters>) {
  const next = { ...filters, ...overrides, page: overrides?.page ?? (overrides ? '1' : filters.page) };
  const params = new URLSearchParams();
  if (next.q) params.set('q', next.q);
  if (next.brand) params.set('brand', next.brand);
  if (next.panel_type) params.set('panel_type', next.panel_type);
  if (next.resolution) params.set('resolution', next.resolution);
  if (next.min_hz) params.set('min_hz', next.min_hz);
  if (next.profile) params.set('profile', next.profile);
  if (next.sort && next.sort !== 'relevance') params.set('sort', next.sort);
  if (next.per_page && next.per_page !== '24') params.set('per_page', next.per_page);
  if (next.page && next.page !== '1') params.set('page', next.page);
  return params.toString();
}

export default function MonitorCatalogClient({
  locale,
  base,
  translations,
  filters,
  allMonitors,
  brands,
  total,
  totalPages,
  page,
  perPage,
}: MonitorCatalogClientProps) {
  const catalogPath = `${base}/monitores`;
  const panels = ['IPS', 'VA', 'OLED', 'QD-OLED'];
  const resolutions = ['FHD', 'QHD', '4K', 'Ultrawide'];
  const refreshRates = ['60', '144', '165', '240', '360'];
  const profiles = [
    { key: 'gaming', label: t(translations, 'catalog.sort.gaming', 'Gaming') },
    { key: 'office', label: t(translations, 'catalog.sort.office', 'Oficina') },
    { key: 'editing', label: t(translations, 'catalog.sort.editing', 'Edición') },
  ];

  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchDraft, setSearchDraft] = useState(filters.q ?? '');

  function toggle(key: keyof Filters, value: string) {
    const current = (filters as any)[key];
    const next = current === value ? '' : value;
    const q = buildQuery(filters, { [key]: next, page: '1' });
    router.replace(`${catalogPath}${q ? `?${q}` : ''}`, { scroll: false });
  }

  function setSort(value: string) {
    const q = buildQuery(filters, { sort: value, page: '1' });
    router.replace(`${catalogPath}${q ? `?${q}` : ''}`, { scroll: false });
  }

  function setPerPage(value: string) {
    const q = buildQuery(filters, { per_page: value, page: '1' });
    router.replace(`${catalogPath}${q ? `?${q}` : ''}`, { scroll: false });
  }

  function onSearchSubmit(e: FormEvent) {
    e.preventDefault();
    const q = buildQuery(filters, { q: searchDraft, page: '1' });
    router.replace(`${catalogPath}${q ? `?${q}` : ''}`, { scroll: false });
  }

  const activeTags: { label: string; key: keyof Filters; value: string }[] = [];
  if (filters.brand) {
    const b = brands.find((x) => pickI18n<BrandPublic>(x, locale).slug === filters.brand);
    activeTags.push({ label: b ? pickI18n<BrandPublic>(b, locale).name : filters.brand, key: 'brand', value: filters.brand });
  }
  if (filters.panel_type) activeTags.push({ label: filters.panel_type, key: 'panel_type', value: filters.panel_type });
  if (filters.resolution) activeTags.push({ label: filters.resolution, key: 'resolution', value: filters.resolution });
  if (filters.min_hz) activeTags.push({ label: `${filters.min_hz}Hz+`, key: 'min_hz', value: filters.min_hz });
  if (filters.profile) activeTags.push({ label: t(translations, `catalog.sort.${filters.profile}`, filters.profile), key: 'profile', value: filters.profile });
  if (filters.q) activeTags.push({ label: `“${filters.q}”`, key: 'q', value: filters.q });

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  return (
    <div className="container">
      <div className={styles.pageHead}>
        <span className="eyebrow">{t(translations, 'catalog.eyebrow')}</span>
        <h1>{t(translations, 'catalog.title')}</h1>
        <form onSubmit={onSearchSubmit} className={styles.searchBar}>
          <input
            type="text"
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            placeholder={locale === 'en' ? 'Search by model or brand...' : 'Buscar por modelo o marca...'}
            className={styles.searchInput}
          />
        </form>
        <div className={styles.tags}>
          {activeTags.map((tag) => (
            <button
              key={tag.label}
              className={styles.tag}
              onClick={() => toggle(tag.key, tag.value)}
            >
              <span>{tag.label}</span>
              <span>×</span>
            </button>
          ))}
          {activeTags.length === 0 && <span className={styles.resultsCount}>{total} {t(translations, 'catalog.results')}</span>}
        </div>
      </div>

      <button
        type="button"
        className={styles.mobileFilterToggle}
        onClick={() => setIsMobileFiltersOpen(true)}
      >
        {t(translations, 'catalog.filters.title', 'Filters')}
      </button>

      <div className={styles.catalogLayout}>
        <aside className={styles.filters}>
          <FilterGroup title={t(translations, 'catalog.filters.brands')}>
            {brands.map((b) => {
              const brand = pickI18n<BrandPublic>(b, locale);
              return <FilterButton key={brand.slug} k="brand" value={brand.slug} filters={filters} toggle={toggle}>{brand.name}</FilterButton>;
            })}
          </FilterGroup>

          <FilterGroup title={t(translations, 'catalog.filters.panel')}>
            {panels.map((p) => (
              <FilterButton key={p} k="panel_type" value={p} filters={filters} toggle={toggle}>{p}</FilterButton>
            ))}
          </FilterGroup>

          <FilterGroup title={t(translations, 'catalog.filters.resolution')}>
            {resolutions.map((r) => (
              <FilterButton key={r} k="resolution" value={r} filters={filters} toggle={toggle}>{r}</FilterButton>
            ))}
          </FilterGroup>

          <FilterGroup title={t(translations, 'catalog.filters.refresh')}>
            {refreshRates.map((hz) => (
              <FilterButton key={hz} k="min_hz" value={hz} filters={filters} toggle={toggle}>{hz}Hz+</FilterButton>
            ))}
          </FilterGroup>

          <FilterGroup title={t(translations, 'catalog.filters.use', 'Uso')}>
            {profiles.map((profile) => (
              <FilterButton key={profile.key} k="profile" value={profile.key} filters={filters} toggle={toggle}>{profile.label}</FilterButton>
            ))}
          </FilterGroup>
        </aside>

        <div className={styles.main}>
          <div className={styles.toolbar}>
            <div className={styles.count}>{total} {t(translations, 'catalog.results')}</div>
            <div className={styles.toolbarRight}>
              <select
                className={styles.perPagePill}
                value={perPage}
                onChange={(e) => setPerPage(e.target.value)}
              >
                {[12, 24, 48, 96].map((n) => (
                  <option key={n} value={n}>
                    {n} {t(translations, 'catalog.perPage', 'por página')}
                  </option>
                ))}
              </select>
              <select
                className={styles.sortPill}
                value={filters.sort || 'relevance'}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="relevance">{t(translations, 'catalog.sort.relevance')}</option>
                <option value="gaming">Gaming</option>
                <option value="editing">{t(translations, 'catalog.sort.editing')}</option>
                <option value="office">{t(translations, 'catalog.sort.office')}</option>
              </select>
            </div>
          </div>

          {allMonitors.length === 0 ? (
            <p className={styles.empty}>{t(translations, 'catalog.empty')}</p>
          ) : (
            <div className={styles.catalogGrid}>
              {allMonitors.map((m) => {
                const best = Math.max(m.scores.gaming, m.scores.office, m.scores.editing);
                const bestProfile = ['gaming', 'office', 'editing'].find((k) => (m.scores as any)[k] === best) ?? 'gaming';
                const s = m.base_specs;
                const chips: string[] = [];
                if (s?.screen_size_inches) chips.push(`${s.screen_size_inches}"`);
                if (s?.resolution_width && s?.resolution_height) chips.push(fmtResolution(s.resolution_width, s.resolution_height));
                if (s?.refresh_rate_hz) chips.push(`${s.refresh_rate_hz}Hz`);
                if (s?.panel_type) chips.push(s.panel_type);
                if (s?.response_time_ms) chips.push(`${s.response_time_ms}ms`);
                if (s?.has_kvm) chips.push('KVM');
                if (!chips.length) chips.push(...parseMetaTitle(m.meta_title));
                if (!chips.length) chips.push(`${best}`);

                const profileLabel = t(translations, `catalog.sort.${bestProfile}`, bestProfile.charAt(0).toUpperCase() + bestProfile.slice(1));

                return (
                  <Link
                    key={m.slug}
                    href={`${base}/monitores/${m.brand_slug}/${m.slug}`}
                    className={`card prod-card ${styles.cardLink}`}
                  >
                    <div className="ph">
                      {m.main_image_url ? (
                        <ImageWithSkeleton src={m.main_image_url} alt={m.model_name} />
                      ) : (
                        <span className="ph-label">{m.brand_name}</span>
                      )}
                    </div>
                    <div className="body">
                      <div className="brand-r">{m.brand_name}</div>
                      <h4>{m.model_name}</h4>
                      <div className={`specs-row ${styles.specsRow}`}>
                        {chips.slice(0, 4).map((chip, i) => (
                          <span key={i} className={`chip ${styles.chip}`}>{chip}</span>
                        ))}
                      </div>
                      <div className="foot">
                        <div className="mini-meter">
                          <div className="bar"><i style={{ width: `${best}%` }} /></div>
                          <span>{profileLabel} {best}</span>
                        </div>
                        <span className="btn btn-outline-k btn-sm">{t(translations, 'catalog.view')}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {totalPages > 1 && (
            <nav className={styles.pagination} aria-label={t(translations, 'catalog.pagination', 'Paginación')}>
              {page > 1 && (
                <Link href={`${catalogPath}?${buildQuery(filters, { page: String(page - 1) })}`} className={styles.pageItem}>←</Link>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={`${catalogPath}?${buildQuery(filters, { page: p === 1 ? '' : String(p) })}`}
                  className={p === page ? styles.pageItemActive : styles.pageItem}
                >
                  {p}
                </Link>
              ))}
              {page < totalPages && (
                <Link href={`${catalogPath}?${buildQuery(filters, { page: String(page + 1) })}`} className={styles.pageItem}>→</Link>
              )}
            </nav>
          )}
        </div>
      </div>

      <div className={`${styles.mobileFilterOverlay} ${isMobileFiltersOpen ? styles.open : ''}`}>
        <div className={styles.mobileFilterBackdrop} onClick={() => setIsMobileFiltersOpen(false)} aria-hidden="true" />
        <div className={styles.mobileFilterDrawer} onClick={(e) => e.stopPropagation()}>
          <div className={styles.mobileFilterHeader}>
            <h3>{t(translations, 'catalog.filters.title', 'Filters')}</h3>
            <button
              type="button"
              className={styles.mobileFilterClose}
              onClick={() => setIsMobileFiltersOpen(false)}
            >
              ×
            </button>
          </div>

          <FilterGroup title={t(translations, 'catalog.filters.brands')}>
            {brands.map((b) => {
              const brand = pickI18n<BrandPublic>(b, locale);
              return <FilterButton key={brand.slug} k="brand" value={brand.slug} filters={filters} toggle={toggle}>{brand.name}</FilterButton>;
            })}
          </FilterGroup>

          <FilterGroup title={t(translations, 'catalog.filters.panel')}>
            {panels.map((p) => (
              <FilterButton key={p} k="panel_type" value={p} filters={filters} toggle={toggle}>{p}</FilterButton>
            ))}
          </FilterGroup>

          <FilterGroup title={t(translations, 'catalog.filters.resolution')}>
            {resolutions.map((r) => (
              <FilterButton key={r} k="resolution" value={r} filters={filters} toggle={toggle}>{r}</FilterButton>
            ))}
          </FilterGroup>

          <FilterGroup title={t(translations, 'catalog.filters.refresh')}>
            {refreshRates.map((hz) => (
              <FilterButton key={hz} k="min_hz" value={hz} filters={filters} toggle={toggle}>{hz}Hz+</FilterButton>
            ))}
          </FilterGroup>

          <FilterGroup title={t(translations, 'catalog.filters.use', 'Uso')}>
            {profiles.map((profile) => (
              <FilterButton key={profile.key} k="profile" value={profile.key} filters={filters} toggle={toggle}>{profile.label}</FilterButton>
            ))}
          </FilterGroup>
        </div>
      </div>
    </div>
  );
}
