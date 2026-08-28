import Link from 'next/link';
import styles from './FeaturedMonitors.module.scss';
import { getTranslations, t } from '@/lib/i18n';
import { apiFetch } from '@/lib/api';
import type { MonitorListItem, PaginatedResponse } from '@/types/api';

async function loadFeatured(locale: 'es' | 'en') {
  try {
    const result = await apiFetch<PaginatedResponse<MonitorListItem>>('/api/v1/monitors?limit=4&order=score', { lang: locale });
    return result.data?.slice(0, 4) ?? [];
  } catch (err) {
    console.error('Featured monitors fetch failed:', err);
    return [];
  }
}

function formatSpecs(m: MonitorListItem) {
  const gaming = m.scores?.gaming ?? 0;
  const bestProfile = gaming >= (m.scores?.editing ?? 0) && gaming >= (m.scores?.office ?? 0) ? 'Gaming' : 'Edición';
  const bestScore = Math.max(gaming, m.scores?.editing ?? 0, m.scores?.office ?? 0);
  return { bestProfile, bestScore };
}

export default async function FeaturedMonitors({ locale }: { locale: 'es' | 'en' }) {
  const base = locale === 'en' ? '/en' : '/es';
  const translations = await getTranslations(locale);
  const monitors = await loadFeatured(locale);

  return (
    <section className={`section paper ${styles.section}`}>
      <div className="container">
        <div className="section-head">
          <div>
            <span className="eyebrow">{t(translations, 'featured.eyebrow')}</span>
            <h2 className="section-title">{t(translations, 'featured.title')}</h2>
            <p className="section-sub">{t(translations, 'featured.subtitle')}</p>
          </div>
          <Link href={`${base}/monitores`} className="see-all">
            {t(translations, 'featured.seeAll')}
          </Link>
        </div>

        {monitors.length === 0 ? (
          <p className={styles.empty}>{t(translations, 'featured.empty')}</p>
        ) : (
          <div className="grid-4">
            {monitors.map((m) => {
              const { bestProfile, bestScore } = formatSpecs(m);
              return (
                <Link
                  key={m.slug}
                  href={`${base}/monitores/${m.brand_slug}/${m.slug}`}
                  className="card prod-card"
                >
                  <div className="ph">
                    {m.main_image_url ? (
                      <img
                        src={m.main_image_url}
                        alt={m.model_name}
                        className={styles.thumb}
                      />
                    ) : (
                      <span className="ph-label">{m.model_name}</span>
                    )}
                  </div>
                  <div className="body">
                    <div className="brand-r">{m.brand_name}</div>
                    <h4 className={styles.modelName}>{m.model_name}</h4>
                    <div className="specs-row">
                      <span className="chip">{m.model_name.split(' ')[0]}</span>
                      <span className="chip"><b>{bestProfile}</b></span>
                    </div>
                    <div className="foot">
                      <div className="mini-meter">
                        <div className="bar"><i style={{ width: `${bestScore}%` }} /></div>
                        <span>{bestProfile} {bestScore}</span>
                      </div>
                      <span className="btn btn-outline-k btn-sm">{t(translations, 'featured.viewSheet')}</span>
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
