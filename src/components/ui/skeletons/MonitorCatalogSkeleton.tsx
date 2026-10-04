import styles from './skeletons.module.scss';

interface MonitorCatalogSkeletonProps {
  count?: number;
}

export function MonitorCatalogSkeleton({ count = 8 }: MonitorCatalogSkeletonProps) {
  return (
    <div className={styles.catalogGrid} aria-busy="true" aria-label="Cargando catálogo de monitores">
      {Array.from({ length: count }).map((_, i) => (
        <article key={i} className={styles.monitorCard}>
          <div className={styles.imagePlaceholder} />
          <div className={styles.badgeGroup}>
            <div className={styles.badge} />
            <div className={styles.badge} />
          </div>
          <div className={styles.titleLine} />
          <div className={styles.subtitleLine} />
          <div className={styles.specRow}>
            <div className={styles.specItem} />
            <div className={styles.specItem} />
            <div className={styles.specItem} />
          </div>
        </article>
      ))}
    </div>
  );
}
