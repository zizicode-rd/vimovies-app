"use client";

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import styles from './LanguageSwitcher.module.scss';

export default function LanguageSwitcher({ initial = undefined }: { initial?: 'es' | 'en' | undefined }) {
  const router = useRouter();
  const [lang, setLang] = useState<'es' | 'en'>(() => (initial as any) ?? 'es');

  useEffect(() => {
    if (!initial) {
      try {
        const match = document.cookie.match(/(^|;)\s*vimonitors_locale=([^;]+)/);
        const cookie = match ? match[2] : undefined;
        if (cookie === 'es' || cookie === 'en') setLang(cookie);
        else {
          const parts = window.location.pathname.split('/').filter(Boolean);
          if (parts[0] === 'en') setLang('en');
          else setLang('es');
        }
      } catch (e) {
        // ignore
      }
    }
  }, [initial]);

  function setLocaleCookie(l: 'es' | 'en') {
    const maxAge = 60 * 60 * 24 * 365;
    document.cookie = `vimonitors_locale=${l}; Path=/; max-age=${maxAge}; SameSite=Lax`;
  }

  function buildTargetPathForLocale(l: 'es' | 'en') {
    const { pathname, search } = window.location;
    const segments = pathname.split('/').filter(Boolean);
    let rest = '';
    if (segments.length === 0) rest = '/';
    else {
      if (segments[0] === 'es' || segments[0] === 'en') {
        rest = '/' + segments.slice(1).join('/');
      } else {
        rest = '/' + segments.join('/');
      }
    }
    if (rest === '/') return `/${l}${search}`;
    return `/${l}${rest}${search}`;
  }

  function toggle() {
    const next: 'es' | 'en' = lang === 'en' ? 'es' : 'en';
    setLang(next);
    setLocaleCookie(next);
    const target = buildTargetPathForLocale(next);
    router.push(target);
  }

  return (
    <button
      className={styles.lang}
      onClick={toggle}
      aria-label="Cambiar idioma"
      title={lang === 'en' ? 'English' : 'Español'}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
      <span>{lang === 'en' ? 'EN' : 'ES'}</span>
    </button>
  );
}
