'use client';

import { useEffect, useState, useMemo } from 'react';
import styles from './Meter.module.scss';

export default function Meter({
  value,
  label,
  variant = 'light',
  delay = 1800,
}: {
  value: number;
  label: string;
  variant?: 'dark-win' | 'dark' | 'light';
  delay?: number;
}) {
  const [current, setCurrent] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const win = variant === 'dark-win';
  const dark = variant === 'dark-win' || variant === 'dark';
  const isValid = Number.isFinite(value);

  useEffect(() => {
    const d = setTimeout(() => {
      setHasStarted(true);
      const duration = 1200;
      const start = performance.now();
      let raf: number;

      const animate = (now: number) => {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        const next = value * eased;
        setCurrent(next);
        if (t < 1) raf = requestAnimationFrame(animate);
      };

      raf = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(raf);
    }, delay);

    return () => clearTimeout(d);
  }, [value, delay]);

  const radius = 46.5;
  const stroke = 7;
  const viewBox = 120;
  const center = viewBox / 2;
  const circumference = useMemo(() => 2 * Math.PI * radius, []);
  const pct = Math.min(100, Math.max(0, isValid ? current : 0));
  const dashoffset = circumference - (pct / 100) * circumference;

  const displayValue = isValid ? current.toFixed(1) : '--';

  return (
    <div className={`${styles.meterItem} ${dark ? styles.onDark : ''} ${win ? styles.win : ''}`}>
      <div className={styles.ringWrap}>
        {hasStarted && isValid ? (
          <svg className={styles.svg} viewBox={`0 0 ${viewBox} ${viewBox}`} role="img" aria-label={`${label} ${displayValue}`}>
            <circle
              className={styles.track}
              cx={center}
              cy={center}
              r={radius}
            />
            <circle
              className={styles.fill}
              cx={center}
              cy={center}
              r={radius}
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={dashoffset}
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <div className={styles.skeletonRing} />
        )}
        <span className={styles.value}>{displayValue}</span>
      </div>
      <span className={styles.label}>{label}</span>
    </div>
  );
}
