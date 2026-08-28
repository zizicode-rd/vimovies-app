import Link from 'next/link';
import { t } from '@/lib/i18n';
import { parseFaq } from '@/lib/hub-filters';
import type { PseoHubPublic, MonitorListItem } from '@/types/api';
import styles from './HubView.module.scss';

interface HubViewProps {
  hub: PseoHubPublic;
  locale: 'es' | 'en';
  translations: any;
  monitors: MonitorListItem[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

function formatName(m: { brand_name?: string; model_name: string }) {
  const brand = m.brand_name ?? m.model_name.split(' ')[0];
  if (m.model_name.toLowerCase().startsWith(brand.toLowerCase())) return m.model_name;
  return `${brand} ${m.model_name}`;
}

function resolutionLabel(w?: number, h?: number) {
  if (!w || !h) return null;
  if (w >= 3840 && h >= 2160) return '4K';
  if (w >= 2560 && h >= 1440) return 'QHD';
  if (w >= 1920 && h >= 1080) return 'FHD';
  return `${w}×${h}`;
}

function parseChips(m: MonitorListItem) {
  const s = m.base_specs;
  const chips: string[] = [];
  if (s?.screen_size_inches) chips.push(`${s.screen_size_inches}"`);
  const res = s?.resolution_width && s?.resolution_height ? resolutionLabel(s.resolution_width, s.resolution_height) : null;
  if (res) chips.push(res);
  if (s?.refresh_rate_hz) chips.push(`${s.refresh_rate_hz}Hz`);
  if (s?.panel_type) chips.push(s.panel_type);
  if (s?.response_time_ms) chips.push(`${s.response_time_ms}ms`);

  if (!chips.length) {
    const text = `${m.meta_title} ${m.model_name}`;
    const hz = text.match(/(\d+)Hz/i);
    const resMatch = text.match(/(4K|QHD|FHD|1440p|1080p|UHD)/i);
    const panel = text.match(/(Fast-IPS|Nano-IPS|IPS|VA|OLED|QD-OLED)/i);
    const ms = text.match(/(\d+(?:\.\d+)?)ms/i);
    if (resMatch) chips.push(resMatch[1].toUpperCase());
    if (hz) chips.push(`${hz[1]}Hz`);
    if (panel) chips.push(panel[1]);
    if (ms) chips.push(`${ms[1]}ms`);
  }

  return chips.slice(0, 4);
}

function bestProfile(m: MonitorListItem) {
  const scores = m.scores;
  const best = Math.max(scores.gaming, scores.office, scores.editing);
  const profile = (['gaming', 'office', 'editing'].find((k) => (scores as any)[k] === best) ?? 'gaming') as 'gaming' | 'office' | 'editing';
  return { profile, best };
}

function renderFilterChip(key: string, value: unknown) {
  if (value === undefined || value === null || value === false || value === '') return null;
  if (value === true) return <span key={key} className={styles.chip}>{key}</span>;
  if (typeof value === 'number' && key.toLowerCase().includes('hz')) return <span key={key} className={styles.chip}>≥ {value} Hz</span>;
  if (key.toLowerCase().includes('resolution') && typeof value === 'number') {
    return <span key={key} className={styles.chip}>{value} px</span>;
  }
  if (key.toLowerCase().includes('brand') && typeof value === 'string') {
    return <span key={key} className={styles.chip}>{value.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}</span>;
  }
  return <span key={key} className={styles.chip}>{String(value)}</span>;
}

export default function HubView({
  hub,
  locale,
  translations,
  monitors,
  page,
  perPage,
  total,
  totalPages,
}: HubViewProps) {
  const base = locale === 'en' ? '/en' : '/es';
  const title = hub.title;
  const intro = hub.intro_content;
  const faq = parseFaq(hub.faq_json);

  const buildLink = (p: number, pp?: number) => {
    const params: string[] = [];
    if (p > 1) params.push(`page=${p}`);
    if ((pp ?? perPage) !== 24) params.push(`per_page=${pp ?? perPage}`);
    return `${base}/hubs/${hub.slug}${params.length ? `?${params.join('&')}` : ''}`;
  };

  return (
    <>
      <section className={styles.hero}>
        <div className="container">
          <span className={styles.eyebrow}>{t(translations, 'hubs.eyebrow', 'Hub')}</span>
          <h1 className={styles.title}>{title}</h1>
          {intro ? <p className={styles.summary}>{intro}</p> : null}

          <div className={styles.meta}>
            <span className={styles.count}>
              {total} {t(translations, 'hubs.found', 'monitores encontrados')}
            </span>
            <div className={styles.filterChips}>
              {Object.entries(hub.filters as any).map(([key, value]) => renderFilterChip(key, value))}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.gridSection}>
        <div className="container">
          {monitors.length === 0 ? (
            <div className={styles.empty}>
              {t(translations, 'hubs.empty', 'No se encontraron monitores para este hub.')}
            </div>
          ) : (
            <>
              <div className={styles.grid}>
                {monitors.map((m, i) => (
                  <HubCard key={m.id} monitor={m} rank={(page - 1) * perPage + i + 1} base={base} translations={translations} />
                ))}
              </div>

              {totalPages > 1 && (
                <nav className={styles.pagination} aria-label={t(translations, 'catalog.pagination', 'Paginación')}>
                  {page > 1 && (
                    <Link href={buildLink(page - 1)} className={styles.pageItem} aria-label={t(translations, 'catalog.prev', 'Anterior')}>
                      ←
                    </Link>
                  )}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <Link
                      key={p}
                      href={buildLink(p)}
                      className={p === page ? styles.pageItemActive : styles.pageItem}
                      aria-label={`${t(translations, 'catalog.page', 'Página')} ${p}`}
                    >
                      {p}
                    </Link>
                  ))}
                  {page < totalPages && (
                    <Link href={buildLink(page + 1)} className={styles.pageItem} aria-label={t(translations, 'catalog.next', 'Siguiente')}>
                      →
                    </Link>
                  )}
                </nav>
              )}
            </>
          )}
        </div>
      </section>

      {faq.length > 0 && (
        <section className={styles.faqSection}>
          <div className="container">
            <h2 className={styles.faqTitle}>FAQ</h2>
            <div className={styles.faqList}>
              {faq.map((item, i) =>
                !item ? null : (
                  <details key={i} className={styles.faqItem}>
                    <summary>{item.question}</summary>
                    <p>{item.answer}</p>
                  </details>
                )
              )}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

function HubCard({
  monitor,
  rank,
  base,
  translations,
}: {
  monitor: MonitorListItem;
  rank: number;
  base: string;
  translations: any;
}) {
  const chips = parseChips(monitor);
  const { profile, best } = bestProfile(monitor);
  const profileLabel = t(translations, `catalog.sort.${profile}`, profile.charAt(0).toUpperCase() + profile.slice(1));

  return (
    <Link
      href={`${base}/monitores/${monitor.brand_slug}/${monitor.slug}`}
      className={styles.card}
    >
      <span className={styles.rank}>#{rank}</span>
      <div className={styles.image}>
        {monitor.main_image_url ? (
          <img src={monitor.main_image_url} alt={monitor.model_name} loading="lazy" />
        ) : (
          <div className={styles.ph}>{monitor.brand_name}</div>
        )}
      </div>
      <div className={styles.body}>
        <span className={styles.brand}>{monitor.brand_name}</span>
        <h3 className={styles.name}>{formatName(monitor)}</h3>
        <div className={styles.chips}>
          {chips.map((chip, i) => (
            <span key={i}>{chip}</span>
          ))}
        </div>
        <div className={styles.score}>
          <span className={styles.scoreValue}>{best.toFixed(1)}</span>
          <div className={styles.scoreBar}>
            <div className={styles.scoreFill} style={{ width: `${Math.min(100, Math.max(0, best))}%` }} />
          </div>
          <span className={styles.scoreLabel}>{profileLabel}</span>
        </div>
      </div>
    </Link>
  );
}
