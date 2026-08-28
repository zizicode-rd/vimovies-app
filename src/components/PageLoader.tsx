'use client';

import { useEffect, useState } from 'react';
import styles from './PageLoader.module.scss';

interface PageLoaderProps {
  label?: string;
}

export default function PageLoader({ label }: PageLoaderProps) {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    document.body.style.overscrollBehavior = 'none';
    const t = setTimeout(() => setFading(true), 200);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = original;
      document.body.style.touchAction = '';
      document.body.style.overscrollBehavior = '';
    };
  }, []);

  return (
    <div className={`${styles.overlay} ${fading ? styles.fadeOut : ''}`} aria-busy="true" aria-live="polite">
      <div className={styles.spinner} aria-hidden="true" />
    </div>
  );
}
