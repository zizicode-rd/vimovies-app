'use client';

import { useEffect, useState } from 'react';
import styles from './PageLoader.module.scss';

interface PageLoaderProps {
  label?: string;
}

export default function PageLoader({ label }: PageLoaderProps) {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setFading(true), 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={`${styles.overlay} ${fading ? styles.fadeOut : ''}`} aria-busy="true" aria-live="polite">
      <div className={styles.spinner} aria-hidden="true" />
    </div>
  );
}
