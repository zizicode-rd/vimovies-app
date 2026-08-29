'use client';

import { useEffect, useState } from 'react';
import styles from './AppPreloader.module.scss';

export default function AppPreloader() {
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    let holdTimer: ReturnType<typeof setTimeout>;

    const onComplete = () => {
      holdTimer = setTimeout(() => setReady(true), 1900);
    };

    if (document.readyState === 'complete') {
      onComplete();
    } else {
      window.addEventListener('load', onComplete, { once: true });
    }

    return () => {
      clearTimeout(holdTimer);
      window.removeEventListener('load', onComplete);
    };
  }, []);

  useEffect(() => {
    if (ready) {
      document.body.style.overflow = '';
      const t = setTimeout(() => setVisible(false), 550);
      return () => clearTimeout(t);
    }
  }, [ready]);

  if (!visible) return null;

  return (
    <div className={`${styles.overlay} ${ready ? styles.fadeOut : ''}`} aria-busy="true" aria-live="polite">
      <div className={styles.inner}>
        <div className={styles.brand} translate="no">Vimonitors</div>
        <div className={styles.spinner} aria-hidden="true" />
      </div>
    </div>
  );
}
