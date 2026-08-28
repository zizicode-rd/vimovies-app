'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { MonitorListItem } from '@/types/api';
import ComparisonPicker from './ComparisonPicker';
import styles from './ComparisonBuilder.module.scss';

function slugifyCompare(a: string, b: string) {
  return `${a}-vs-${b}`;
}

function formatName(m: MonitorListItem) {
  if (m.model_name.toLowerCase().startsWith(m.brand_name.toLowerCase())) return m.model_name;
  return `${m.brand_name} ${m.model_name}`;
}

export default function ComparisonBuilder({
  base,
  monitors,
  translations,
  preselectedA = '',
}: {
  base: string;
  monitors: MonitorListItem[];
  translations: any;
  preselectedA?: string;
}) {
  const router = useRouter();
  const [a, setA] = useState(preselectedA || '');
  const [b, setB] = useState('');

  useEffect(() => {
    if (preselectedA && !a) setA(preselectedA);
  }, [preselectedA]);
  const [loading, setLoading] = useState(false);
  const [, startTransition] = useTransition();

  const t = (key: string, fallback: string) => {
    const parts = key.split('.');
    let current: any = translations;
    for (const p of parts) {
      if (current && typeof current === 'object' && p in current) {
        current = current[p];
      } else {
        return fallback;
      }
    }
    return current ?? fallback;
  };

  function onCompare(e: React.FormEvent) {
    e.preventDefault();
    if (!a || !b || a === b) return;
    const slug = slugifyCompare(a, b);
    setLoading(true);
    startTransition(() => {
      router.push(`${base}/comparativas/${slug}`);
    });
  }

  const disabled = !a || !b || a === b || loading;

  return (
    <form className={styles.builder} onSubmit={onCompare}>
      <div className={styles.picker}>
        <ComparisonPicker
          options={monitors}
          value={a}
          onChange={setA}
          label={t('comparisons.selectA', 'Monitor A')}
          placeholder={t('comparisons.selectA', 'Monitor A')}
        />
      </div>
      <div className={styles.vs}>VS</div>
      <div className={styles.picker}>
        <ComparisonPicker
          options={monitors}
          value={b}
          onChange={setB}
          label={t('comparisons.selectB', 'Monitor B')}
          placeholder={t('comparisons.selectB', 'Monitor B')}
        />
      </div>

      {a && b && a === b && <p className={styles.error}>{t('comparisons.same', 'No puedes comparar el mismo monitor.')}</p>}

      <div className={styles.actions}>
        <button type="submit" className={styles.compareBtn} disabled={disabled}>
          {loading ? <span className={styles.spinner} /> : t('comparisons.compareNow', 'Comparar ahora')}
        </button>
      </div>
    </form>
  );
}
