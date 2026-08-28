import Link from 'next/link';
import { getTranslations, t } from '@/lib/i18n';
import { apiFetch } from '@/lib/api';
import { pickI18n } from '@/lib/i18n-utils';
import type { ComparisonPublic, PaginatedResponse } from '@/types/api';

async function loadPopular(locale: 'es' | 'en') {
  try {
    const result = await apiFetch<PaginatedResponse<ComparisonPublic>>('/api/v1/comparisons?limit=3', { lang: locale });
    return result.data?.slice(0, 3) ?? [];
  } catch (err) {
    console.error('Popular comparisons fetch failed:', err);
    return [];
  }
}

export default async function PopularComparisons({ locale }: { locale: 'es' | 'en' }) {
  const base = locale === 'en' ? '/en' : '/es';
  const translations = await getTranslations(locale);
  const comparisons = await loadPopular(locale);

  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="eyebrow">{t(translations, 'comparisons.eyebrow')}</span>
            <h2 className="section-title">{t(translations, 'comparisons.title')}</h2>
          </div>
          <Link href={`${base}/comparativas`} className="see-all">
            {t(translations, 'comparisons.seeAll')}
          </Link>
        </div>

        {comparisons.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--color-gray-500)', padding: '40px 0' }}>
            {t(translations, 'comparisons.empty')}
          </p>
        ) : (
          <div className="grid-3">
            {comparisons.map((c) => (
              <Link
                key={c.slug}
                href={`${base}/comparativas/${c.slug}`}
                className="vs-mini"
              >
                <div className="side">
                  <div className="ph" />
                  <h4>{c.monitor_a.model_name}</h4>
                  <div className="brand-r">{c.monitor_a.brand?.name ?? c.monitor_a.brand_name ?? c.monitor_a.model_name.split(' ')[0]}</div>
                </div>
                <div className="mid">VS</div>
                <div className="side b">
                  <div className="ph" />
                  <h4>{c.monitor_b.model_name}</h4>
                  <div className="brand-r">{c.monitor_b.brand?.name ?? c.monitor_b.brand_name ?? c.monitor_b.model_name.split(' ')[0]}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
