'use client';

import { useRef } from 'react';
import Link from 'next/link';
import styles from './BrandStrip.module.scss';

export default function BrandStripClient({
  brands,
  base,
}: {
  brands: { slug: string; label: string }[];
  base: string;
}) {
  const listRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: number) => {
    if (!listRef.current) return;
    const width = listRef.current.firstElementChild?.getBoundingClientRect().width ?? 120;
    listRef.current.scrollBy({ left: direction * width * 3, behavior: 'smooth' });
  };

  return (
    <section className={styles.brandStrip}>
      <div className="container">
        <div className={styles.wrapper}>
          <button
            type="button"
            className={`${styles.nav} ${styles.navLeft}`}
            onClick={() => scroll(-1)}
            aria-label="Marcas anteriores"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <div ref={listRef} className={styles.inner}>
            {brands.map((brand, i) => (
              <Link
                key={brand.slug}
                href={`${base}/monitores?brand=${brand.slug}`}
                className={styles.brand}
                style={{ '--i': i } as React.CSSProperties}
              >
                <span className={styles.label}>{brand.label}</span>
              </Link>
            ))}
          </div>

          <button
            type="button"
            className={`${styles.nav} ${styles.navRight}`}
            onClick={() => scroll(1)}
            aria-label="Marcas siguientes"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
