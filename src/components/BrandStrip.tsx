import BrandStripClient from './BrandStripClient';
import { apiFetch } from '@/lib/api';
import { pickI18n } from '@/lib/i18n-utils';
import type { BrandPublic, PaginatedResponse } from '@/types/api';

const fallbackBrands = [
  { slug: 'lg', label: 'LG' },
  { slug: 'asus', label: 'ASUS' },
  { slug: 'benq', label: 'BenQ' },
  { slug: 'samsung', label: 'Samsung' },
  { slug: 'dell', label: 'Dell' },
  { slug: 'msi', label: 'MSI' },
  { slug: 'aoc', label: 'AOC' },
];

function normalizeBrandName(name?: string, slug?: string) {
  if (!name) return (slug ?? '').toUpperCase();
  // Keep short, uppercase-ish brand names readable
  return name.length <= 4 ? name.toUpperCase() : name;
}

export default async function BrandStrip({ locale }: { locale: 'es' | 'en' }) {
  const base = locale === 'en' ? '/en' : '/es';
  let brands: { slug: string; label: string }[] = fallbackBrands;

  try {
    const result = await apiFetch<PaginatedResponse<BrandPublic> | BrandPublic[]>('/api/v1/brands', { lang: locale });
    const list = Array.isArray(result) ? result : result.data;
    if (Array.isArray(list) && list.length > 0) {
      brands = list.map((raw) => {
        const b = pickI18n<BrandPublic>(raw, locale);
        return { slug: b.slug, label: normalizeBrandName(b.name, b.slug) };
      });
    }
  } catch (err) {
    // Keep fallback on error so the UI still renders
    console.error('BrandStrip fetch failed:', err);
  }

  return <BrandStripClient brands={brands} base={base} />;
}
