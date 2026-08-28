import Link from 'next/link';
import { getTranslations, t } from '@/lib/i18n';
import styles from './Footer.module.scss';

export default async function Footer({ locale = 'es' }: { locale?: 'es' | 'en' }) {
  const translations = await getTranslations(locale);
  const base = locale === 'en' ? '/en' : '/es';

  const thisYear = new Date().getFullYear();

  const exploreLinks = [
    { href: `${base}/monitores`, label: t(translations, 'nav.monitors', 'Monitores') },
    { href: `${base}/comparativas`, label: t(translations, 'nav.comparisons', 'Comparativas') },
    { href: `${base}/blog`, label: t(translations, 'nav.blog', 'Blog') },
  ];

  const useLinks = [
    { href: `${base}/monitores?use=gaming`, label: t(translations, 'categories.fallback.gaming', 'Gaming') },
    { href: `${base}/monitores?use=editing`, label: t(translations, 'categories.fallback.design', 'Diseño') },
    { href: `${base}/monitores?use=office`, label: t(translations, 'categories.fallback.office', 'Oficina') },
  ];

  const aboutLinks = [
    { href: `${base}/metodologia`, label: t(translations, 'why.methodologyCta', 'Metodología') },
  ];

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.brand}>
            <div className={styles.logo}>{t(translations, 'brand')}</div>
            <p className={styles.tagline}>{t(translations, 'footer.tagline')}</p>
          </div>

          <div>
            <h4 className={styles.columnTitle}>{t(translations, 'nav.home', 'Inicio')}</h4>
            <ul className={styles.links}>
              {exploreLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={styles.link}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className={styles.columnTitle}>{t(translations, 'catalog.sort.profile', 'Perfil')}</h4>
            <ul className={styles.links}>
              {useLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={styles.link}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className={styles.columnTitle}>{t(translations, 'why.eyebrow', 'Metodología')}</h4>
            <ul className={styles.links}>
              {aboutLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={styles.link}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={styles.bottom}>
          <span>© {thisYear} {t(translations, 'brand')}. {t(translations, 'footer.rights', 'All rights reserved.')}</span>
          <div className={styles.langSwitch}>
            <Link href="/es" className={`${styles.langLink} ${locale === 'es' ? styles.langActive : ''}`}>
              {t(translations, 'i18n.lang.es', 'ES')}
            </Link>
            <Link href="/en" className={`${styles.langLink} ${locale === 'en' ? styles.langActive : ''}`}>
              {t(translations, 'i18n.lang.en', 'EN')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
