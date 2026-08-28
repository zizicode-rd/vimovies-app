import Link from 'next/link';
import styles from './ComparisonView.module.scss';
import { apiFetch } from '@/lib/api';
import { getTranslations, t } from '@/lib/i18n';
import { pickI18n } from '@/lib/i18n-utils';
import type { ComparisonPublic, MonitorPublic, MonitorBaseSpecs } from '@/types/api';

function formatScore(n: number) {
  return n.toFixed(1);
}

function getWinner(winnerId: string, aId: string, bId: string): 'a' | 'b' | 'tie' {
  if (winnerId === aId) return 'a';
  if (winnerId === bId) return 'b';
  return 'tie';
}

function getWinnerClass(winner: 'a' | 'b' | 'tie') {
  if (winner === 'a' || winner === 'b') return styles.win;
  return '';
}

function getWinnerLabel(winner: 'a' | 'b' | 'tie', a: string, b: string, tie: string) {
  if (winner === 'a') return a;
  if (winner === 'b') return b;
  return tie;
}

async function loadComparison(slug: string, locale: 'es' | 'en') {
  try {
    const data = await apiFetch<ComparisonPublic>(`/api/v1/comparisons/${slug}`, { lang: locale });
    return pickI18n<ComparisonPublic>(data, locale);
  } catch {
    return null;
  }
}

async function loadMonitorDetails(slug: string, locale: 'es' | 'en') {
  try {
    const detail = await apiFetch<MonitorPublic>(`/api/v1/monitors/${slug}`, { lang: locale });
    return pickI18n<MonitorPublic>(detail, locale);
  } catch (err) {
    console.error('Monitor detail load failed:', err);
    return null;
  }
}

function buildComparisonFromMonitors(a: MonitorPublic, b: MonitorPublic): ComparisonPublic {
  const profileKeys = ['gaming', 'office', 'editing'] as const;
  const winners = {} as any;
  const deltas = {} as any;

  for (const key of profileKeys) {
    const aScore = (a.scores as any)[key];
    const bScore = (b.scores as any)[key];
    if (aScore === bScore) {
      winners[key] = 'tie';
    } else {
      winners[key] = aScore > bScore ? a.id : b.id;
    }
    deltas[key] = aScore - bScore;
  }

  return {
    id: 'live',
    slug: `${a.slug}-vs-${b.slug}`,
    monitor_a: {
      id: a.id,
      slug: a.slug,
      model_name: a.model_name,
      scores: a.scores,
      brand: a.brand,
    } as any,
    monitor_b: {
      id: b.id,
      slug: b.slug,
      model_name: b.model_name,
      scores: b.scores,
      brand: b.brand,
    } as any,
    winners,
    deltas,
    ai_summary: null,
    ai_verdict: null,
    meta_title: `${a.model_name} vs ${b.model_name}`,
    meta_description: '',
    i18n: {} as any,
  } as ComparisonPublic;
}

type SpecRow = { key: keyof MonitorBaseSpecs | 'resolution_total'; label: string; format: (v: any, s?: MonitorBaseSpecs) => string; higherIsBetter: boolean | null };

const SPEC_ROWS: SpecRow[] = [
  { key: 'screen_size_inches', label: 'Pulgadas', format: (v) => `${v}"`, higherIsBetter: null },
  { key: 'resolution_total', label: 'Resolución', format: (_v, s) => `${s?.resolution_width ?? '—'}x${s?.resolution_height ?? '—'}`, higherIsBetter: true },
  { key: 'refresh_rate_hz', label: 'Hz', format: (v) => `${v}Hz`, higherIsBetter: true },
  { key: 'response_time_ms', label: 'Respuesta', format: (v) => `${v}ms`, higherIsBetter: false },
  { key: 'panel_type', label: 'Panel', format: (v) => `${v}`, higherIsBetter: null },
  { key: 'brightness_nits', label: 'Brillo', format: (v) => `${v} nits`, higherIsBetter: true },
  { key: 'color_gamut_dci_p3_pct', label: 'DCI-P3', format: (v) => `${v}%`, higherIsBetter: true },
  { key: 'hdr_support', label: 'HDR', format: (v) => `${v}`, higherIsBetter: true },
  { key: 'has_vrr_sync', label: 'VRR', format: (v) => v ? 'Sí' : 'No', higherIsBetter: true },
  { key: 'has_kvm', label: 'KVM', format: (v) => v ? 'Sí' : 'No', higherIsBetter: true },
];

function specValue(specs: MonitorBaseSpecs | undefined, key: keyof MonitorBaseSpecs | 'resolution_total'): any {
  if (!specs) return undefined;
  if (key === 'resolution_total') {
    const w = specs.resolution_width;
    const h = specs.resolution_height;
    if (w && h) return w * h;
    return undefined;
  }
  return (specs as any)[key];
}

function extractFirstNumber(value: string | undefined): number | null {
  if (!value) return null;
  const match = value.match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : null;
}

function compareValue(
  a: any,
  b: any,
  higherIsBetter: boolean | null,
  label?: string
): 'a' | 'b' | 'tie' {
  if (a === undefined || a === null || b === undefined || b === null) return 'tie';
  if (higherIsBetter === null) return 'tie';

  if (typeof a === 'boolean' && typeof b === 'boolean') {
    if (a === b) return 'tie';
    return a ? 'a' : 'b';
  }

  if (typeof a === 'string' || typeof b === 'string') {
    const aNum = typeof a === 'number' ? a : extractFirstNumber(a);
    const bNum = typeof b === 'number' ? b : extractFirstNumber(b);
    if (aNum === null || bNum === null) return 'tie';
    if (aNum === bNum) return 'tie';
    return higherIsBetter ? (aNum > bNum ? 'a' : 'b') : (aNum < bNum ? 'a' : 'b');
  }

  if (typeof a === 'number' && typeof b === 'number') {
    if (a === b) return 'tie';
    return higherIsBetter ? (a > b ? 'a' : 'b') : (a < b ? 'a' : 'b');
  }

  return 'tie';
}

function computeSpecScore(specs: MonitorBaseSpecs | undefined) {
  if (!specs) return 0;
  let score = 0;
  if (specs.refresh_rate_hz) score += specs.refresh_rate_hz * 0.35;
  if (specs.response_time_ms) {
    const bounded = Math.min(specs.response_time_ms, 20);
    score += ((20 - bounded) / 20) * 100 * 0.25;
  }
  if (specs.brightness_nits) score += specs.brightness_nits * 0.15;
  if (specs.color_gamut_dci_p3_pct) score += specs.color_gamut_dci_p3_pct * 0.15;
  if (specs.has_vrr_sync) score += 15;
  if (specs.has_kvm) score += 10;
  if (specs.has_speakers) score += 5;
  return score;
}

export default async function ComparisonView({ slug, locale }: { slug: string; locale: 'es' | 'en' }) {
  const base = locale === 'en' ? '/en' : '/es';
  const translations = await getTranslations(locale);
  let c = await loadComparison(slug, locale);

  if (!c) {
    const parts = slug.split('-vs-');
    if (parts.length >= 2) {
      const aSlug = parts[0];
      const bSlug = parts.slice(1).join('-vs-');
      const [a, b] = await Promise.all([loadMonitorDetails(aSlug, locale), loadMonitorDetails(bSlug, locale)]);
      if (a && b) {
        c = buildComparisonFromMonitors(a, b);
      }
    }
  }

  if (!c) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <h1>{t(translations, 'comparisons.notFound', 'Comparativa no encontrada')}</h1>
      </div>
    );
  }

  const aDetail = await loadMonitorDetails(c.monitor_a.slug, locale);
  const bDetail = await loadMonitorDetails(c.monitor_b.slug, locale);

  const a = c.monitor_a;
  const b = c.monitor_b;
  const aBrand = a.brand?.name ?? a.model_name.split(' ')[0];
  const bBrand = b.brand?.name ?? b.model_name.split(' ')[0];
  const aName = a.model_name.startsWith(aBrand) ? a.model_name : `${aBrand} ${a.model_name}`;
  const bName = b.model_name.startsWith(bBrand) ? b.model_name : `${bBrand} ${b.model_name}`;
  const tieLabel = t(translations, 'comparisons.tie', 'Empate');

  const profiles = [
    { key: 'gaming', label: 'Gaming' },
    { key: 'office', label: 'Office' },
    { key: 'editing', label: t(translations, 'catalog.sort.editing', 'Edición') },
  ];

  const aSpecScore = computeSpecScore(aDetail?.base_specs);
  const bSpecScore = computeSpecScore(bDetail?.base_specs);
  const specWinner: 'a' | 'b' | 'tie' = aSpecScore === bSpecScore ? 'tie' : aSpecScore > bSpecScore ? 'a' : 'b';

  const aProfileWins = profiles.filter((p) => getWinner((c.winners as any)[p.key], a.id, b.id) === 'a').length;
  const bProfileWins = profiles.filter((p) => getWinner((c.winners as any)[p.key], a.id, b.id) === 'b').length;
  const profileWinner: 'a' | 'b' | 'tie' = aProfileWins === bProfileWins ? 'tie' : aProfileWins > bProfileWins ? 'a' : 'b';

  const aPoints = aProfileWins + (specWinner === 'a' ? 1 : 0);
  const bPoints = bProfileWins + (specWinner === 'b' ? 1 : 0);
  const overallWinner: 'a' | 'b' | 'tie' = aPoints === bPoints ? 'tie' : aPoints > bPoints ? 'a' : 'b';

  const aSpecs = aDetail?.base_specs;
  const bSpecs = bDetail?.base_specs;

  const gamingWinner: 'a' | 'b' | 'tie' = (() => {
    if (!aSpecs || !bSpecs) return 'tie';
    if ((aSpecs.refresh_rate_hz ?? 0) !== (bSpecs.refresh_rate_hz ?? 0)) {
      return (aSpecs.refresh_rate_hz ?? 0) > (bSpecs.refresh_rate_hz ?? 0) ? 'a' : 'b';
    }
    if ((aSpecs.response_time_ms ?? 999) !== (bSpecs.response_time_ms ?? 999)) {
      return (aSpecs.response_time_ms ?? 999) < (bSpecs.response_time_ms ?? 999) ? 'a' : 'b';
    }
    return 'tie';
  })();

  const panelRank: Record<string, number> = { 'QD-OLED': 6, 'OLED': 5, 'Fast-IPS': 4, 'Nano-IPS': 4, 'IPS': 3, 'VA': 2, 'TN': 1 };
  const editingWinner: 'a' | 'b' | 'tie' = (() => {
    if (!aSpecs || !bSpecs) return 'tie';
    const aPanel = panelRank[aSpecs.panel_type ?? ''] ?? 0;
    const bPanel = panelRank[bSpecs.panel_type ?? ''] ?? 0;
    if (aPanel !== bPanel) return aPanel > bPanel ? 'a' : 'b';
    if ((aSpecs.color_gamut_dci_p3_pct ?? 0) !== (bSpecs.color_gamut_dci_p3_pct ?? 0)) {
      return (aSpecs.color_gamut_dci_p3_pct ?? 0) > (bSpecs.color_gamut_dci_p3_pct ?? 0) ? 'a' : 'b';
    }
    return 'tie';
  })();

  const insights = [];
  if (aSpecs && bSpecs) {
    if ((aSpecs.refresh_rate_hz ?? 0) !== (bSpecs.refresh_rate_hz ?? 0)) {
      insights.push(`El monitor con mayor tasa de refresco es ${(aSpecs.refresh_rate_hz ?? 0) > (bSpecs.refresh_rate_hz ?? 0) ? aName : bName} (${Math.max(aSpecs.refresh_rate_hz ?? 0, bSpecs.refresh_rate_hz ?? 0)}Hz), ideal para movimientos fluidos.`);
    }
    if ((aSpecs.response_time_ms ?? 999) !== (bSpecs.response_time_ms ?? 999)) {
      insights.push(`El menor tiempo de respuesta lo ofrece ${(aSpecs.response_time_ms ?? 999) < (bSpecs.response_time_ms ?? 999) ? aName : bName} (${Math.min(aSpecs.response_time_ms ?? 999, bSpecs.response_time_ms ?? 999)}ms), reduciendo ghosting.`);
    }
    if ((aSpecs.brightness_nits ?? 0) !== (bSpecs.brightness_nits ?? 0)) {
      insights.push(`${(aSpecs.brightness_nits ?? 0) > (bSpecs.brightness_nits ?? 0) ? aName : bName} alcanza más brillo (${Math.max(aSpecs.brightness_nits ?? 0, bSpecs.brightness_nits ?? 0)} nits), útil en ambientes iluminados.`);
    }
    if ((aSpecs.color_gamut_dci_p3_pct ?? 0) !== (bSpecs.color_gamut_dci_p3_pct ?? 0)) {
      insights.push(`Mayor cobertura DCI-P3: ${(aSpecs.color_gamut_dci_p3_pct ?? 0) > (bSpecs.color_gamut_dci_p3_pct ?? 0) ? aName : bName} (${Math.max(aSpecs.color_gamut_dci_p3_pct ?? 0, bSpecs.color_gamut_dci_p3_pct ?? 0)}%).`);
    }
    if (aSpecs.panel_type !== bSpecs.panel_type) {
      insights.push(`Panel ${aSpecs.panel_type} en ${aName} frente a ${bSpecs.panel_type} en ${bName}.`);
    }
  }

  const recommendations = [
    {
      key: 'global',
      label: t(translations, 'comparisons.bestOverall', 'Mejor elección global'),
      winner: overallWinner,
    },
    {
      key: 'gaming',
      label: t(translations, 'comparisons.forGaming', 'Para competitivo / esports'),
      winner: gamingWinner,
    },
    {
      key: 'editing',
      label: t(translations, 'comparisons.forEditing', 'Para creación de contenido / edición'),
      winner: editingWinner,
    },
  ];

  function recIcon(key: string) {
    if (key === 'global') {
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="6" />
          <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
        </svg>
      );
    }
    if (key === 'gaming') {
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="6" width="20" height="12" rx="2" />
          <path d="M6 12h4m-2-2v4" />
          <circle cx="15" cy="11" r="1" />
          <circle cx="17" cy="13" r="1" />
        </svg>
      );
    }
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    );
  }

  function recommendationReason(rec: typeof recommendations[0]): string {
    const target = rec.winner === 'a' ? aName : rec.winner === 'b' ? bName : tieLabel;
    if (rec.winner === 'tie') return t(translations, 'comparisons.tieReason', 'Ambos monitores están muy parejos en este apartado.');
    if (rec.key === 'gaming') {
      const s = rec.winner === 'a' ? aSpecs : bSpecs;
      return `${target} por sus ${s?.refresh_rate_hz ?? '—'}Hz y ${s?.response_time_ms ?? '—'}ms de respuesta.`;
    }
    if (rec.key === 'editing') {
      const s = rec.winner === 'a' ? aSpecs : bSpecs;
      return `${target} por su panel ${s?.panel_type ?? '—'} y ${s?.color_gamut_dci_p3_pct ?? '—'}% DCI-P3.`;
    }
    return `${target} ofrece mejor equilibrio entre especificaciones y puntuaciones.`;
  }

  return (
    <>
      <section className={styles.vsHero}>
        <div className="container">
          <div className={styles.vsTitle}>
            <h1>
              <b>{aName}</b> {t(translations, 'comparisons.vs', 'vs')} <b>{bName}</b>
            </h1>
          </div>

          <div className={styles.vsStage}>
            <div className={`${styles.vsMonitor} ${overallWinner === 'a' ? styles.winner : ''}`}>
              {overallWinner === 'a' && <span className={styles.winnerBadge}>{t(translations, 'comparisons.winner', 'Ganador')}</span>}
              <div className={styles.ph}>
                {aDetail?.main_image_url ? (
                  <img src={aDetail.main_image_url} alt={aName} className={styles.productImage} />
                ) : (
                  <span className={styles.phLabel}>{a.brand?.name ?? a.model_name.split(' ')[0]}</span>
                )}
              </div>
              <div className={styles.monitorBody}>
                <div className={styles.brandName}>{a.brand?.name ?? a.model_name.split(' ')[0]}</div>
                <h3 className={styles.modelName}>{a.model_name}</h3>
                <div className={styles.scorePill}>
                  <span className={styles.scoreValue}>{formatScore(a.scores.gaming)}</span>
                  <span className={styles.scoreLabel}>Gaming</span>
                </div>
                <div className={styles.specsRow}>
                  <span className={styles.vsChip}>{formatScore(a.scores.office)} Office</span>
                  <span className={styles.vsChip}>{formatScore(a.scores.editing)} Edición</span>
                </div>
              </div>
            </div>

            <div className={styles.vsBadge}>{t(translations, 'comparisons.vs', 'VS')}</div>

            <div className={`${styles.vsMonitor} ${styles.b} ${overallWinner === 'b' ? styles.winner : ''}`}>
              {overallWinner === 'b' && <span className={styles.winnerBadge}>{t(translations, 'comparisons.winner', 'Ganador')}</span>}
              <div className={styles.ph}>
                {bDetail?.main_image_url ? (
                  <img src={bDetail.main_image_url} alt={bName} className={styles.productImage} />
                ) : (
                  <span className={styles.phLabel}>{b.brand?.name ?? b.model_name.split(' ')[0]}</span>
                )}
              </div>
              <div className={styles.monitorBody}>
                <div className={styles.brandName}>{b.brand?.name ?? b.model_name.split(' ')[0]}</div>
                <h3 className={styles.modelName}>{b.model_name}</h3>
                <div className={styles.scorePill}>
                  <span className={styles.scoreValue}>{formatScore(b.scores.gaming)}</span>
                  <span className={styles.scoreLabel}>Gaming</span>
                </div>
                <div className={styles.specsRow}>
                  <span className={styles.vsChip}>{formatScore(b.scores.office)} Office</span>
                  <span className={styles.vsChip}>{formatScore(b.scores.editing)} Edición</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.scorePills}>
            <div className={styles.pill}>
              <span className={styles.pillLabel}>{t(translations, 'comparisons.profilesWon', 'Perfiles ganados')}</span>
              <span className={styles.pillValue}>{aProfileWins} — {bProfileWins}</span>
            </div>
            <div className={styles.pill}>
              <span className={styles.pillLabel}>{t(translations, 'comparisons.specScore', 'Puntuación por specs')}</span>
              <span className={styles.pillValue}>{aSpecScore.toFixed(0)} — {bSpecScore.toFixed(0)}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section paper">
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '30px' }}>
            {t(translations, 'comparisons.scoresByProfile', 'Puntuación por perfil')}
          </h2>
          <div className={styles.profileCompare}>
            {profiles.map((profile) => {
              const winner = getWinner((c.winners as any)[profile.key], a.id, b.id);
              return (
                <div key={profile.key} className={styles.profileCell}>
                  <h5>{profile.label}</h5>
                  <div className={styles.twoMeters}>
                    <div className={`${styles.meter} ${winner === 'a' ? styles.meterWinner : winner === 'b' ? styles.meterLoser : ''}`}>
                      <div className={styles.ring} style={{ ['--pct' as any]: (a.scores as any)[profile.key] }}>
                        <span>{formatScore((a.scores as any)[profile.key])}</span>
                      </div>
                      <span className={styles.meterLabel}>{a.brand?.name ?? 'A'}</span>
                    </div>
                    <div className={`${styles.meter} ${winner === 'b' ? styles.meterWinner : winner === 'a' ? styles.meterLoser : ''}`}>
                      <div className={styles.ring} style={{ ['--pct' as any]: (b.scores as any)[profile.key] }}>
                        <span>{formatScore((b.scores as any)[profile.key])}</span>
                      </div>
                      <span className={styles.meterLabel}>{b.brand?.name ?? 'B'}</span>
                    </div>
                  </div>
                  <div className={styles.delta}>
                    {getWinnerLabel(winner, aName, bName, tieLabel)} Δ {Math.abs((c.deltas as any)[profile.key]).toFixed(1)} pts
                  </div>
                </div>
              );
            })}
          </div>

          <h2 className="section-title" style={{ textAlign: 'center', margin: '50px 0 30px' }}>
            {t(translations, 'comparisons.specsTable', 'Comparativa de especificaciones')}
          </h2>
          <div className={styles.tableWrap}>
            <table className={styles.compareTable}>
            <thead>
              <tr>
                <th>{t(translations, 'comparisons.spec', 'Especificación')}</th>
                <th>{aName}</th>
                <th>{bName}</th>
                <th>{t(translations, 'comparisons.winner', 'Ganador')}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{t(translations, 'comparisons.specScore', 'Puntuación por specs')}</td>
                <td className={specWinner === 'a' ? styles.win : ''}>{aSpecScore.toFixed(1)}</td>
                <td className={specWinner === 'b' ? styles.win : ''}>{bSpecScore.toFixed(1)}</td>
                <td className={getWinnerClass(specWinner)}>{getWinnerLabel(specWinner, aName, bName, tieLabel)}</td>
              </tr>
              {profiles.map((profile) => {
                const winner = getWinner((c.winners as any)[profile.key], a.id, b.id);
                return (
                  <tr key={profile.key}>
                    <td>{profile.label}</td>
                    <td className={winner === 'a' ? styles.win : ''}>{formatScore((a.scores as any)[profile.key])}</td>
                    <td className={winner === 'b' ? styles.win : ''}>{formatScore((b.scores as any)[profile.key])}</td>
                    <td className={getWinnerClass(winner)}>{getWinnerLabel(winner, aName, bName, tieLabel)}</td>
                  </tr>
                );
              })}
              {SPEC_ROWS.map((row) => {
                const aVal = specValue(aDetail?.base_specs, row.key);
                const bVal = specValue(bDetail?.base_specs, row.key);
                const winner = compareValue(aVal, bVal, row.higherIsBetter);
                return (
                  <tr key={row.key}>
                    <td>{row.label}</td>
                    <td className={winner === 'a' ? styles.win : ''}>{row.format(aVal, aDetail?.base_specs)}</td>
                    <td className={winner === 'b' ? styles.win : ''}>{row.format(bVal, bDetail?.base_specs)}</td>
                    <td className={getWinnerClass(winner)}>{getWinnerLabel(winner, aName, bName, tieLabel)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>

          <div className={styles.bottomSection}>
            <div className={styles.insightCard}>
              <div className={styles.insightHead}>
                <span className={styles.insightBadge}>
                  {t(translations, 'comparisons.technical', 'TÉCNICO & INSIGHTS')}
                </span>
                <h5>{t(translations, 'comparisons.aiSummary', 'Análisis comparativo')}</h5>
              </div>
              <div className={styles.insightBody}>
                {c.ai_summary ? (
                  <p className={styles.summaryText}>{c.ai_summary}</p>
                ) : (
                  <ul className={styles.insightList}>
                    {insights.length > 0 ? (
                      insights.map((line, i) => <li key={i}>{line}</li>)
                    ) : (
                      <li>{t(translations, 'comparisons.noSummary', 'No hay resumen disponible.')}</li>
                    )}
                  </ul>
                )}
              </div>
            </div>

            <div className={styles.recommendationCard}>
              <div className={styles.recommendationHead}>
                <h5>{t(translations, 'comparisons.recommendationTitle', '¿Cuál deberías comprar?')}</h5>
              </div>
              <div className={styles.recommendationGrid}>
                {recommendations.map((rec) => (
                  <div
                    key={rec.key}
                    className={`${styles.recommendationItem} ${rec.winner === 'a' ? styles.recA : rec.winner === 'b' ? styles.recB : styles.recTie}`}
                  >
                    <span className={styles.recIcon}>{recIcon(rec.key)}</span>
                    <span className={styles.recLabel}>{rec.label}</span>
                    <span className={styles.recWinner}>
                      {rec.winner === 'a' ? aName : rec.winner === 'b' ? bName : tieLabel}
                    </span>
                    <p className={styles.recReason}>{recommendationReason(rec)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.cta}>
            <Link href={`${base}/comparativas`} className="btn btn-black">
              {t(translations, 'comparisons.seeAll', 'Ver todas las comparativas')}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
