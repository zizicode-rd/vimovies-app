"use client";

import { useState } from 'react';
import Link from 'next/link';
import styles from './NavControls.module.scss';
import LanguageSwitcher from './LanguageSwitcher';

export default function NavControls({ translations, locale }: { translations: any; locale: 'es' | 'en' }) {
  const [open, setOpen] = useState(false);
  const base = locale === 'en' ? '/en' : '/es';

  function toggle() { setOpen(v => !v); }
  function close() { setOpen(false); }

  const menuLabel = open
    ? (translations?.nav?.close ?? 'Cerrar menú')
    : (translations?.nav?.menu ?? 'Menú');

  return (
    <div className={styles.controls}>
      <button
        aria-label={menuLabel}
        className={styles.hamburger}
        onClick={toggle}
        aria-expanded={open}
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      <div
        className={`${styles.drawer} ${open ? styles.open : ''}`}
        role={open ? 'dialog' : 'presentation'}
        aria-hidden={!open}
        aria-modal={open ? 'true' : undefined}
      >
        <div className={styles.drawerInner}>
          <div className={styles.drawerHeader}>
            <div className={styles.brand}>{translations?.brand ?? 'vimovies'}</div>
            <button className={styles.close} onClick={close} aria-label={translations?.nav?.close ?? 'Cerrar menú'}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <nav className={styles.drawerNav}>
            <Link href={`${base}/`} onClick={close}>{translations?.nav?.home ?? 'Home'}</Link>
            <Link href={`${base}/monitores`} onClick={close}>{translations?.nav?.monitors ?? 'Monitors'}</Link>
            <Link href={`${base}/comparativas`} onClick={close}>{translations?.nav?.comparisons ?? 'Comparisons'}</Link>
            <Link href={`${base}/blog`} onClick={close}>{translations?.nav?.blog ?? 'Blog'}</Link>
            <Link href={`${base}/comparativas`} className={styles.compare} onClick={close}>{translations?.nav?.compare ?? 'Compare'}</Link>
          </nav>

          <div className={styles.drawerFooter}>
            <LanguageSwitcher initial={locale} />
          </div>
        </div>

        <div className={styles.backdrop} onClick={close} />
      </div>
    </div>
  );
}
