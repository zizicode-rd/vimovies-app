"use client";

import { useEffect, useState } from 'react';
import type { ReactElement } from 'react';
import Link from 'next/link';
import type { MonitorListItem, PostPublic } from '@/types/api';
import { usePathname } from 'next/navigation';
import styles from './Header.module.scss';
import LanguageSwitcher from './LanguageSwitcher';
import SearchModal from './SearchModal';

function normalizePath(p: string) {
  return p.endsWith('/') && p.length > 1 ? p.slice(0, -1) : p;
}

function isActive(pathname: string, href: string) {
  const p = normalizePath(pathname);
  const h = normalizePath(href);
  if (h === p) return true;
  if (h.length > 3 && p.startsWith(h + '/')) return true;
  return false;
}

const icons: Record<string, ReactElement> = {
  home: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
  monitors: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>,
  comparisons: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3" /><path d="M16 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3" /><line x1="12" y1="8" x2="12" y2="16" /></svg>,
  blog: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>,
};

export default function HeaderClient({
  locale,
  translations,
  topBarText,
  monitors,
  posts,
}: {
  locale: 'es' | 'en';
  translations: any;
  topBarText: string;
  monitors: MonitorListItem[];
  posts: PostPublic[];
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const base = locale === 'en' ? '/en' : '/es';

  const links = [
    { href: `${base}/`, label: translations.nav?.home ?? 'Home', icon: icons.home },
    { href: `${base}/monitores`, label: translations.nav?.monitors ?? 'Monitors', icon: icons.monitors },
    { href: `${base}/comparativas`, label: translations.nav?.comparisons ?? 'Comparisons', icon: icons.comparisons },
    { href: `${base}/blog`, label: translations.nav?.blog ?? 'Blog', icon: icons.blog },
  ];

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 10);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <>
      <header className={`${styles.header} ${scrolled ? styles.isScrolled : ''}`}>
        <div className={styles.inner}>
          <div className={styles.topLine}>
            <span className={styles.eyebrow}>{topBarText}</span>
            <div className={styles.topActions}>
              <a href="https://www.tiktok.com/@vimovies" target="_blank" rel="noreferrer" className={styles.social}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.53V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52V7.32a4.86 4.86 0 0 1-1.04-.63z" /></svg>
              </a>
              <a href="https://www.instagram.com/vimovies" target="_blank" rel="noreferrer" className={styles.social}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
              </a>
            </div>
          </div>

          <div className={styles.main}>
            <Link href={`${base}/`} className={styles.logo} translate="no">
              {translations.brand ?? 'vimovies'}
            </Link>

            <nav className={styles.mainNav}>
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${styles.navLink} ${isActive(pathname, link.href) ? styles.current : ''}`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className={styles.headerActions}>
              <button
              className={styles.search}
              onClick={() => setSearchOpen(true)}
              aria-label={locale === 'en' ? 'Open search' : 'Abrir búsqueda'}
            >
              <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
              <span className={styles.searchText}>{locale === 'en' ? 'Search…' : 'Buscar…'}</span>
              <kbd className={styles.kbd}>{locale === 'en' ? '⌘K' : 'Ctrl K'}</kbd>
            </button>

              <LanguageSwitcher initial={locale} />

              <Link href={`${base}/comparativas`} className={styles.compareBtn}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3" /><path d="M16 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3" /><line x1="12" y1="8" x2="12" y2="16" /></svg>
                <span>{translations.nav?.compare ?? 'Compare'}</span>
              </Link>

              <button
                className={styles.burger}
                aria-label="Menu"
                onClick={() => setMenuOpen(true)}
              >
                <span /><span /><span />
              </button>
            </div>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className={styles.drawerOverlay} onClick={() => setMenuOpen(false)} aria-hidden="true" />
      )}
      <div className={`${styles.drawer} ${menuOpen ? styles.drawerOpen : ''}`} aria-hidden={!menuOpen}>
        <div className={styles.drawerInner}>
          <div className={styles.drawerHead}>
            <Link href={`${base}/`} className={styles.logo} onClick={() => setMenuOpen(false)} translate="no">
              {translations.brand ?? 'vimovies'}
            </Link>
            <button className={styles.drawerClose} onClick={() => setMenuOpen(false)} aria-label="Close">&times;</button>
          </div>

          <div className={styles.drawerSearch}>
            <div className={styles.search}>
              <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
              <input
                type="text"
                placeholder={locale === 'en' ? 'Search…' : 'Buscar…'}
                readOnly
              />
              <kbd className={styles.kbd}>{locale === 'en' ? '⌘K' : 'Ctrl K'}</kbd>
            </div>
          </div>

          <nav className={styles.drawerNav}>
            {links.map((link, i) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`${styles.drawerLink} ${isActive(pathname, link.href) ? styles.current : ''}`}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <span className={styles.drawerIcon}>{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className={styles.drawerFoot}>
            <Link href={`${base}/comparativas`} className={styles.compareBtn} onClick={() => setMenuOpen(false)}>
              {translations.nav?.compare ?? 'Compare'}
            </Link>
            <LanguageSwitcher initial={locale} />
          </div>
        </div>
      </div>

      <SearchModal locale={locale} isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
