'use client';

import { useEffect, useState } from 'react';
import styles from './AppPreloader.module.scss';

export default function AppPreloader() {
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Solo mostrar en la primera visita de la sesión
    const hasSeenPreloader = typeof window !== 'undefined' && sessionStorage.getItem('vim_preloader_seen');
    if (hasSeenPreloader) {
      return;
    }

    setVisible(true);
    document.body.style.overflow = 'hidden';
    const holdTimer = setTimeout(() => setReady(true), 800);

    return () => {
      clearTimeout(holdTimer);
    };
  }, []);

  useEffect(() => {
    if (ready) {
      document.body.style.overflow = '';
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('vim_preloader_seen', 'true');
      }
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
