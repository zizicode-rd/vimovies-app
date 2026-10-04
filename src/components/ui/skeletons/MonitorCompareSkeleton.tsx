import styles from './skeletons.module.scss';

interface MonitorCompareSkeletonProps {
  columns?: number;
  rows?: number;
}

export function MonitorCompareSkeleton({ columns = 3, rows = 6 }: MonitorCompareSkeletonProps) {
  return (
    <div style={{ width: '100%', overflowX: 'auto' }} aria-busy="true" aria-label="Cargando comparativa">
      <table className={styles.compareTable}>
        <thead>
          <tr>
            <th style={{ width: '20%' }}>
              <div className={styles.subtitleLine} />
            </th>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <th key={colIndex} style={{ width: `${80 / columns}%` }}>
                <div className={styles.headerCell}>
                  <div className={styles.imagePlaceholder} style={{ height: '110px' }} />
                  <div className={styles.titleLine} style={{ width: '70%' }} />
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              <td>
                <div className={styles.titleLine} style={{ width: '60%' }} />
              </td>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex}>
                  <div className={styles.specItem} style={{ width: '80%' }} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
