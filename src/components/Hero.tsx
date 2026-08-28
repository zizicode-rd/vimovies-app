import Link from 'next/link';
import styles from './Hero.module.scss';
import HeroSearch from './HeroSearch';
import Meter from './Meter';
import { getTranslations, t } from '@/lib/i18n';
import { apiFetch } from '@/lib/api';
import { pickI18n } from '@/lib/i18n-utils';
import type { MonitorListItem, MonitorPublic, PostPublic, PaginatedResponse, ComparisonPublic, PseoHubPublic } from '@/types/api';

async function loadTotals(locale: 'es' | 'en') {
  const fallback = { monitors: 1204, verified: 412, comparisons: 96 };
  try {
    const [monitors, comparisons, hubs] = await Promise.all([
      apiFetch<PaginatedResponse<MonitorListItem>>('/api/v1/monitors?limit=1', { lang: locale }).catch(() => ({ data: [], pagination: { total: fallback.monitors } })),
      apiFetch<PaginatedResponse<ComparisonPublic>>('/api/v1/comparisons?limit=1', { lang: locale }).catch(() => ({ data: [], pagination: { total: fallback.comparisons } })),
      apiFetch<PaginatedResponse<PseoHubPublic>>('/api/v1/hubs?limit=1', { lang: locale }).catch(() => ({ data: [], pagination: { total: fallback.verified } })),
    ]);

    return {
      monitors: monitors.pagination?.total ?? fallback.monitors,
      verified: hubs.pagination?.total ?? fallback.verified,
      comparisons: comparisons.pagination?.total ?? fallback.comparisons,
    };
  } catch (err) {
    console.error('Hero totals load failed:', err);
    return fallback;
  }
}

async function loadSearchData(locale: 'es' | 'en') {
  try {
    const [monitors, posts] = await Promise.all([
      apiFetch<PaginatedResponse<MonitorListItem>>('/api/v1/monitors?limit=60', { lang: locale }).catch(() => ({ data: [], pagination: { total: 0 } })),
      apiFetch<PaginatedResponse<PostPublic>>('/api/v1/posts?limit=20', { lang: locale }).catch(() => ({ data: [], pagination: { total: 0 } })),
    ]);
    return {
      monitors: (monitors.data ?? []).map((m) => pickI18n<MonitorListItem>(m, locale)),
      posts: (posts.data ?? []).map((p) => pickI18n<PostPublic>(p, locale)),
    };
  } catch {
    return { monitors: [], posts: [] };
  }
}

async function loadFeaturedMonitor(locale: 'es' | 'en') {
  try {
    const listResult = await apiFetch<PaginatedResponse<MonitorListItem> | MonitorListItem[]>('/api/v1/monitors?limit=1', { lang: locale });
    const list = Array.isArray(listResult) ? listResult : listResult.data;
    if (!Array.isArray(list) || list.length === 0) return null;

    const first = list[0];
    const detailPath = `/api/v1/monitors/${first.brand_slug}/${first.slug}`;

    try {
      const monitor = await apiFetch<MonitorPublic>(detailPath, { lang: locale });
      return pickI18n<MonitorPublic>(monitor, locale);
    } catch {
      // detail endpoint not available: use list item plus partial defaults
      return {
        ...first,
        brand: { name: first.brand_name, slug: first.brand_slug },
        base_specs: {},
      } as unknown as MonitorPublic;
    }
  } catch (err) {
    console.error('Hero monitor load failed:', err);
    return null;
  }
}

function fmtResolution(w?: number, h?: number) {
  if (!w || !h) return '';
  const labels: Record<string, string> = {
    '1920x1080': 'FHD',
    '2560x1080': 'WFHD',
    '2560x1440': 'QHD',
    '3440x1440': 'UWQHD',
    '3840x2160': '4K',
    '5120x2880': '5K',
    '7680x4320': '8K',
  };
  const key = `${w}x${h}`;
  const label = labels[key] ?? `${w}×${h}`;
  return `${label} ${w}×${h}`;
}

export default async function Hero({ locale }: { locale: 'es' | 'en' }) {
  const base = locale === 'en' ? '/en' : '/es';
  const translations = await getTranslations(locale);
  const [monitor, totals, searchData] = await Promise.all([loadFeaturedMonitor(locale), loadTotals(locale), loadSearchData(locale)]);
  const formatNumber = (n: number) => n.toLocaleString(locale === 'en' ? 'en-US' : 'es-ES');

  const name = monitor?.model_name ?? 'UltraGear 27GP850-B';
  const brand = monitor?.brand?.name ?? 'LG';
  const panel = (monitor?.base_specs?.panel_type ?? 'FAST-IPS').toUpperCase();
  const hz = monitor?.base_specs?.refresh_rate_hz ?? 165;
  const gaming = monitor?.scores?.gaming ?? 92;
  const office = monitor?.scores?.office ?? 78;
  const editing = monitor?.scores?.editing ?? 85;
  const resolution = fmtResolution(monitor?.base_specs?.resolution_width, monitor?.base_specs?.resolution_height) || 'QHD 2560×1440';
  const response = monitor?.base_specs?.response_time_ms ? `${monitor.base_specs.response_time_ms}ms GTG` : '1ms GTG';
  const hdr = monitor?.base_specs?.hdr_support ?? 'HDR400';

  const specs = [resolution, response, hdr];

  return (
    <section className={`${styles.hero} scanlines`}>
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.heroCopy}>
            <span className="eyebrow">{t(translations, 'hero.eyebrow')}</span>
            <h1 className={styles.title}>
              {t(translations, 'hero.titleStart')}{' '}
              <em className={styles.emphasis}>{t(translations, 'hero.titleEmphasis')}</em>
              {t(translations, 'hero.titleEnd')}
            </h1>
            <p className={styles.lead}>{t(translations, 'hero.lead')}</p>

            <HeroSearch
              placeholder={t(translations, 'hero.searchPlaceholder')}
              cta={t(translations, 'hero.searchCta')}
              locale={locale}
            />

            <div className={styles.chips}>
              {(translations.hero?.chips ?? [
                { label: '144Hz+', href: `${base}/monitores?min_hz=144` },
                { label: 'OLED', href: `${base}/monitores?panel=OLED` },
                { label: '4K', href: `${base}/monitores?resolution=4K` },
                { label: 'Ultrawide', href: `${base}/monitores?format=Ultrawide` },
                { label: locale === 'en' ? 'Budget' : 'Bajo presupuesto', href: `${base}/monitores?budget=low` },
              ]).map((chip: { label: string; href: string }) => (
                <Link key={chip.href} href={chip.href}>{chip.label}</Link>
              ))}
            </div>

            <div className={styles.stats}>
              <div className={styles.stat}>
                <b className="mono">{formatNumber(totals.monitors)}</b>
                <span>{t(translations, 'hero.statMonitors')}</span>
              </div>
              <div className={styles.stat}>
                <b className="mono">{formatNumber(totals.verified)}</b>
                <span>{t(translations, 'hero.statVerified')}</span>
              </div>
              <div className={styles.stat}>
                <b className="mono">{formatNumber(totals.comparisons)}</b>
                <span>{t(translations, 'hero.statComparisons')}</span>
              </div>
            </div>
          </div>

          <Link
            href={monitor ? `${base}/monitores/${monitor.brand?.slug ?? ''}/${monitor.slug}` : `${base}/monitores`}
            className={`${styles.panel} bracket on-dark`}
          >
            <div className={styles.panelTop}>
              <div>
                <div className={styles.panelName}>{name}</div>
                <div className={styles.panelBrand}>{brand} · {panel} {hz}Hz</div>
              </div>
              <span className={styles.live}>{t(translations, 'hero.calibrated', 'Calibrado')}</span>
            </div>
            <div className={styles.panelShot}>
              <div className={styles.gridLines} />
            </div>
            <div className={styles.panelMeters}>
              <Meter value={gaming} label={t(translations, 'hero.meters.gaming', 'Gaming')} variant="dark-win" />
              <Meter value={office} label={t(translations, 'hero.meters.office', 'Office')} variant="dark" />
              <Meter value={editing} label={t(translations, 'hero.meters.editing', 'Editing')} variant="dark" />
            </div>
            <div className={styles.panelSpecs}>
              {specs.map((spec) => (
                <span
                  key={spec}
                  className="chip"
                  style={{ background: 'rgba(255,255,255,.06)', borderColor: 'rgba(255,255,255,.18)', color: 'rgba(255,255,255,.75)' }}
                >
                  {spec}
                </span>
              ))}
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
