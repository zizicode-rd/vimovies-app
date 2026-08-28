export function pickI18n<T>(item: any, locale: string): T {
  if (!item) return item;

  const base = { ...item };
  delete base.i18n;

  const es = item.i18n?.es as Partial<T> | undefined;
  const translated = item.i18n?.[locale] as Partial<T> | undefined;

  if (!es && !translated) return base as T;

  return { ...base, ...(es || {}), ...(translated || {}) } as T;
}
