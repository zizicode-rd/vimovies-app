import React from 'react';
import Link from 'next/link';
import styles from './CategorySection.module.scss';
import { apiFetch } from '@/lib/api';
import { getTranslations, t } from '@/lib/i18n';
import { pickI18n } from '@/lib/i18n-utils';
import type { PseoHubPublic, PaginatedResponse } from '@/types/api';

const fallbackCategories = [
  { key: 'gaming', title: 'Gaming', count: 0, icon: 'gamepad', href: '/monitores?use=gaming' },
  { key: 'design', title: 'Diseño y edición', count: 0, icon: 'palette', href: '/monitores?use=design' },
  { key: 'office', title: 'Oficina', count: 0, icon: 'briefcase', href: '/monitores?use=office' },
  { key: 'ultrawide', title: 'Ultrawide', count: 0, icon: 'arrows', href: '/monitores?format=ultrawide' },
  { key: '4k', title: 'Alta resolución', count: 0, icon: '4k', href: '/monitores?resolution=4k' },
];

const iconMap: Record<string, React.ReactNode> = {
  gamepad: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="6" /><path d="M6 12h4" /><path d="M8 10v4" /><path d="M15 12h.01" /><path d="M18 11h.01" /></svg>
  ),
  palette: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 2a10 10 0 0 1 10 10c0 0-4 0-4-4 0-3-3-3-3-3s-3 0-3 3c0 4-4 4-4 4A10 10 0 0 1 12 2z" /></svg>
  ),
  briefcase: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /></svg>
  ),
  arrows: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3L4 7l4 4" /><path d="M4 7h16" /><path d="M16 21l4-4-4-4" /><path d="M20 17H4" /></svg>
  ),
  '4k': (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M6 16V8" /><path d="M10 8l4 8" /><path d="M10 16l4-8" /><path d="M16 16V8h4" /><path d="M20 12h-4" /></svg>
  ),
};

function pickIcon(title: string) {
  const t = title.toLowerCase();
  if (t.includes('game') || t.includes('gaming')) return iconMap.gamepad;
  if (t.includes('diseño') || t.includes('design') || t.includes('edición') || t.includes('edit')) return iconMap.palette;
  if (t.includes('oficina') || t.includes('office') || t.includes('productividad')) return iconMap.briefcase;
  if (t.includes('ultrawide') || t.includes('wide')) return iconMap.arrows;
  if (t.includes('4k') || t.includes('alta resolución') || t.includes('high res')) return iconMap['4k'];
  return iconMap.gamepad;
}

export default async function CategorySection({ locale }: { locale: 'es' | 'en' }) {
  const base = locale === 'en' ? '/en' : '/es';
  const translations = await getTranslations(locale);

  const fallbackCategories = [
    { key: 'gaming', title: t(translations, 'categories.fallback.gaming', 'Gaming'), count: 0, icon: 'gamepad', href: `${base}/monitores?use=gaming` },
    { key: 'design', title: t(translations, 'categories.fallback.design', 'Diseño y edición'), count: 0, icon: 'palette', href: `${base}/monitores?use=design` },
    { key: 'office', title: t(translations, 'categories.fallback.office', 'Oficina'), count: 0, icon: 'briefcase', href: `${base}/monitores?use=office` },
    { key: 'ultrawide', title: t(translations, 'categories.fallback.ultrawide', 'Ultrawide'), count: 0, icon: 'arrows', href: `${base}/monitores?format=ultrawide` },
    { key: '4k', title: t(translations, 'categories.fallback.4k', 'Alta resolución'), count: 0, icon: '4k', href: `${base}/monitores?resolution=4k` },
  ];

  let categories = fallbackCategories;

  try {
    const result = await apiFetch<PaginatedResponse<PseoHubPublic> | PseoHubPublic[]>('/api/v1/hubs?limit=5', { lang: locale });
    const list = Array.isArray(result) ? result : result.data;
    if (Array.isArray(list) && list.length > 0) {
      categories = list.slice(0, 5).map((raw) => {
        const hub = pickI18n<PseoHubPublic>(raw, locale);
        return {
          key: hub.slug,
          title: hub.title,
          count: hub.matched_count,
          icon: 'gamepad',
          href: `${base}/hubs/${hub.slug}`,
        };
      });
    }
  } catch (err) {
    console.error('CategorySection fetch failed:', err);
  }

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.sectionHead}>
          <div>
            <span className="eyebrow">{t(translations, 'categories.eyebrow')}</span>
            <h2 className={styles.title}>{t(translations, 'categories.title')}</h2>
          </div>
        </div>

        <div className={styles.catGrid}>
          {categories.map((cat) => (
            <Link
              key={cat.key}
              href={cat.href}
              className={styles.catCard}
            >
              <div className={styles.icon}>{pickIcon(cat.title)}</div>
              <h4 className={styles.catTitle}>{cat.title}</h4>
              <p className={styles.catCount}>
                {t(translations, 'categories.seeHub', 'Ver selección')}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
