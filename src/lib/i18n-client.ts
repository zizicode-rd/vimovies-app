export const locales = ['es', 'en'] as const;
export type Locale = typeof locales[number];
export const defaultLocale: Locale = 'es';

export function isSupportedLocale(l: string | undefined): l is Locale {
  return l === 'es' || l === 'en';
}

export function getLocaleFromPath(pathname: string | undefined): Locale {
  if (!pathname) return defaultLocale;
  const parts = pathname.split('/').filter(Boolean);
  const first = parts[0];
  if (first === 'en') return 'en';
  return 'es';
}

export function t(translations: any, key: string, fallback?: string) {
  if (!translations) return fallback ?? key;
  const parts = key.split('.');
  let cur: any = translations;
  for (const p of parts) {
    if (cur && typeof cur === 'object' && p in cur) cur = cur[p];
    else return fallback ?? key;
  }
  return cur;
}
