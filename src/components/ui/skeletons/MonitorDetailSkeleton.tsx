import styles from './skeletons.module.scss';

export function MonitorDetailSkeleton() {
  return (
    <div className={styles.detailGrid} aria-busy="true" aria-label="Cargando detalles del monitor">
      {/* Left column: main gallery */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className={styles.mainImage} />
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <div className={styles.imagePlaceholder} style={{ width: '80px', height: '60px' }} />
          <div className={styles.imagePlaceholder} style={{ width: '80px', height: '60px' }} />
          <div className={styles.imagePlaceholder} style={{ width: '80px', height: '60px' }} />
        </div>
      </div>

      {/* Right column: main specs and CTAs */}
      <div className={styles.specsList}>
        <div className={styles.badgeGroup}>
          <div className={styles.badge} />
          <div className={styles.badge} />
        </div>
        <div className={styles.titleLine} style={{ height: '32px', width: '90%' }} />
        <div className={styles.subtitleLine} style={{ height: '24px', width: '40%' }} />
        <div style={{ margin: '1rem 0', paddingTop: '1rem', borderTop: `1px solid var(--color-line, #e3e3e7)`, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div className={styles.specBlock} />
          <div className={styles.specBlock} />
          <div className={styles.specBlock} />
        </div>
      </div>
    </div>
  );
}
