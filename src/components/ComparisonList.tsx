import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { getTranslations, t } from '@/lib/i18n';
import { pickI18n } from '@/lib/i18n-utils';
import type { ComparisonPublic, PaginatedResponse, MonitorListItem } from '@/types/api';
import ComparisonBuilder from './ComparisonBuilder';
import styles from './ComparisonList.module.scss';

async function loadComparisons(locale: 'es' | 'en') {
  try {
    const data = await apiFetch<PaginatedResponse<ComparisonPublic>>('/api/v1/comparisons?limit=12', { lang: locale });
    return data.data.map((c) => pickI18n<ComparisonPublic>(c, locale));
  } catch {
    return [];
  }
}

async function loadMonitors(locale: 'es' | 'en') {
  try {
    const data = await apiFetch<PaginatedResponse<MonitorListItem>>('/api/v1/monitors?limit=100', { lang: locale });
    return data.data.map((m) => pickI18n<MonitorListItem>(m, locale));
  } catch {
    return [];
  }
}

function formatName(m: { brand_name?: string; model_name: string }) {
  const brand = m.brand_name ?? m.model_name.split(' ')[0];
  if (m.model_name.toLowerCase().startsWith(brand.toLowerCase())) return m.model_name;
  return `${brand} ${m.model_name}`;
}

function formatScore(n: number) {
  return n.toFixed(1);
}

function parseMetaTitle(title?: string | null) {
  const chips: string[] = [];
  if (!title) return chips;
  const hz = title.match(/(\d+)Hz/i);
  const size = title.match(/(\d{2})\"/);
  const panel = title.match(/(Fast-IPS|Nano-IPS|IPS|VA|OLED|QD-OLED)/i);
  if (size) chips.push(`${size[1]}"`);
  if (hz) chips.push(`${hz[1]}Hz`);
  if (panel) chips.push(panel[1]);
  return chips;
}

export default async function ComparisonList({
  locale,
  preselectedA,
}: {
  locale: 'es' | 'en';
  preselectedA?: string;
}) {
  const base = locale === 'en' ? '/en' : '/es';
  const translations = await getTranslations(locale);
  const [comparisons, monitors] = await Promise.all([loadComparisons(locale), loadMonitors(locale)]);
  const dataBySlug = Object.fromEntries(monitors.map((m) => [m.slug, m]));

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroGrid} aria-hidden="true" />
        <div className="container">
          <div className={styles.heroContent}>
            <span className={styles.eyebrow}>{t(translations, 'comparisons.eyebrow', 'Cara a cara')}</span>
            <h1 className={styles.title}>
              {t(translations, 'comparisons.heroTitle', 'Comparador cara a cara de monitores')}
            </h1>
            <p className={styles.lead}>
              {t(translations, 'comparisons.heroLead', 'Selecciona dos modelos para enfrentar sus especificaciones, rendimiento y veredicto final.')}
            </p>
          </div>
        </div>
      </section>

      <section className={styles.builderWrap}>
        <div className="container">
          <ComparisonBuilder base={base} monitors={monitors} translations={translations} preselectedA={preselectedA} />
        </div>
      </section>

      <section className="section paper">
        <div className="container">
          <h2 className={styles.sectionTitle}>
            {t(translations, 'comparisons.latestPopular', 'Comparativas recientes y populares')}
          </h2>

          {comparisons.length === 0 ? (
            <p className={styles.empty}>{t(translations, 'comparisons.empty', 'No hay comparativas disponibles')}</p>
          ) : (
            <div className={styles.grid}>
              {comparisons.map((c) => {
                const a = c.monitor_a;
                const b = c.monitor_b;
                const aData = dataBySlug[a.slug];
                const bData = dataBySlug[b.slug];
                const aName = formatName(a);
                const bName = formatName(b);
                const aImg = aData?.main_image_url;
                const bImg = bData?.main_image_url;
                const aChips = parseMetaTitle(aData?.meta_title);
                const bChips = parseMetaTitle(bData?.meta_title);

                return (
                  <Link
                    key={c.id}
                    href={`${base}/comparativas/${c.slug}`}
                    className={styles.card}
                  >
                    <div className={styles.cardTop}>
                      <div className={styles.side}>
                        <div className={styles.thumbWrap}>
                          {aImg ? <img src={aImg} alt={aName} className={styles.thumb} /> : null}
                          <span className={styles.scoreBadge}>{formatScore(a.scores.gaming)}</span>
                        </div>
                        <span className={styles.brand}>{a.brand?.name ?? a.model_name.split(' ')[0]}</span>
                        <span className={styles.model}>{aName}</span>
                        <div className={styles.chips}>
                          {aChips.slice(0, 2).map((chip) => (
                            <span key={chip} className={styles.chip}>{chip}</span>
                          ))}
                        </div>
                      </div>
                      <div className={styles.mid}>VS</div>
                      <div className={`${styles.side} ${styles.sideRight}`}>
                        <div className={styles.thumbWrap}>
                          {bImg ? <img src={bImg} alt={bName} className={styles.thumb} /> : null}
                          <span className={styles.scoreBadge}>{formatScore(b.scores.gaming)}</span>
                        </div>
                        <span className={styles.brand}>{b.brand?.name ?? b.model_name.split(' ')[0]}</span>
                        <span className={styles.model}>{bName}</span>
                        <div className={styles.chips}>
                          {bChips.slice(0, 2).map((chip) => (
                            <span key={chip} className={styles.chip}>{chip}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className={styles.cardFoot}>
                      <span className={styles.seeCompare}>
                        {t(translations, 'comparisons.seeFull', 'Ver comparativa completa →')}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
