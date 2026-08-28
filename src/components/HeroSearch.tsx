'use client';

import { useState } from 'react';
import styles from './Hero.module.scss';
import SearchModal from './SearchModal';

export default function HeroSearch({
  placeholder,
  cta,
  locale,
}: {
  placeholder: string;
  cta: string;
  locale: 'es' | 'en';
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className={styles.search} onClick={() => setOpen(true)}>
        <input
          type="text"
          readOnly
          value=""
          placeholder={placeholder}
          aria-label={placeholder}
        />
        <span className="btn btn-red btn-sm">{cta}</span>
      </button>
      <SearchModal locale={locale} isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
