import Link from 'next/link';
import styles from './ProductCard.module.scss';

export default function ProductCard({
  badge,
  score,
  name,
  subtitle,
  specs,
  highlights,
  analysisUrl,
  compareUrl,
}: {
  badge?: string;
  score?: number;
  name?: string;
  subtitle?: string;
  specs?: { size?: string; resolution?: string; refreshRate?: string; responseTime?: string; panelType?: string; hdr?: string };
  highlights?: string[];
  analysisUrl?: string;
  compareUrl?: string;
}) {
  const chips = [
    specs?.size,
    specs?.resolution,
    specs?.refreshRate,
    specs?.responseTime,
    specs?.panelType,
    specs?.hdr,
  ].filter(Boolean) as string[];

  const safeAnalysis = analysisUrl || '#';
  const safeCompare = compareUrl || '#';

  return (
    <div className={styles.card}>
      <div className={styles.left}>
        <div className={styles.image}>
          <div className={styles.ph} />
          {score !== undefined && (
            <span className={styles.score}>
              {score.toFixed(1)}<small>/10</small>
            </span>
          )}
        </div>
      </div>
      <div className={styles.right}>
        {badge && <span className={styles.badge}>{badge}</span>}
        <h3 className={styles.name}>{name}</h3>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        <div className={styles.chips}>
          {chips.map((chip, i) => (
            <span key={i} className={styles.chip}>{chip}</span>
          ))}
        </div>
        {highlights && highlights.length > 0 && (
          <ul className={styles.highlights}>
            {highlights.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
        )}
        <div className={styles.actions}>
          <Link href={safeAnalysis} className={styles.btnPrimary}>Ver análisis completo &rarr;</Link>
        </div>
      </div>
    </div>
  );
}
