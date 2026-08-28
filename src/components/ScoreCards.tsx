'use client';

import { useEffect, useState } from 'react';
import styles from './ScoreCards.module.scss';

interface Score {
  key: string;
  label: string;
  value: number;
}

function badgeClass(value: number) {
  if (value >= 80) return styles.badgeHigh;
  if (value >= 60) return styles.badgeMid;
  return styles.badgeLow;
}

function badgeText(value: number, locale: 'es' | 'en') {
  if (value >= 80) return locale === 'en' ? 'Excellent' : 'Excelente';
  if (value >= 60) return locale === 'en' ? 'Good' : 'Bueno';
  return locale === 'en' ? 'Fair' : 'Aceptable';
}

function fillClass(value: number) {
  if (value >= 80) return styles.fillHigh;
  if (value >= 60) return styles.fillMid;
  return styles.fillLow;
}

export default function ScoreCards({
  scores,
  locale,
}: {
  scores: Score[];
  locale: 'es' | 'en';
}) {
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={styles.scores}>
      {scores.map((s) => {
        const isValid = Number.isFinite(s.value);
        const value = isValid ? s.value : 0;

        return (
          <div key={s.key} className={`${styles.card} ${!isValid ? styles.skeleton : ''}`}>
            <div className={styles.header}>
              <span className={styles.label}>{s.label}</span>
              <span className={`${styles.badge} ${isValid ? badgeClass(value) : ''}`}>
                {isValid ? badgeText(value, locale) : '--'}
              </span>
            </div>

            <div className={styles.valueRow}>
              <span className={styles.value}>{isValid ? value.toFixed(1) : '--'}</span>
              <span className={styles.scale}>/100</span>
            </div>

            <div className={styles.track}>
              <div
                className={`${styles.fill} ${isValid ? fillClass(value) : ''}`}
                style={{ width: started && isValid ? `${value}%` : '0%' }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
