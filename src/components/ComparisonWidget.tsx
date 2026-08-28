'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './ComparisonWidget.module.scss';

export default function ComparisonWidget({ base }: { base: string }) {
  const [a, setA] = useState('');
  const [b, setB] = useState('');

  const slug = a && b ? `${a.toLowerCase().replace(/\s+/g, '-')}-vs-${b.toLowerCase().replace(/\s+/g, '-')}` : '';

  return (
    <div className={styles.widget}>
      <h4 className={styles.title}>¿Dudas entre dos modelos?</h4>
      <p className={styles.text}>Compara ambos monitores cara a cara y descubre cuál gana en gaming, oficina y edición.</p>
      <div className={styles.inputs}>
        <input
          type="text"
          placeholder="Monitor A"
          value={a}
          onChange={(e) => setA(e.target.value)}
        />
        <span className={styles.vs}>VS</span>
        <input
          type="text"
          placeholder="Monitor B"
          value={b}
          onChange={(e) => setB(e.target.value)}
        />
      </div>
      <Link
        href={slug ? `${base}/comparativas/${slug}` : `${base}/comparativas`}
        className={styles.btn}
      >
        Comparar cara a cara &rarr;
      </Link>
    </div>
  );
}
