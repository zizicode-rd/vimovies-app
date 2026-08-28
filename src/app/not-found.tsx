import Link from 'next/link';
import { headers } from 'next/headers';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import styles from './NotFound.module.scss';
import { getTranslations, t } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n';

function getLocaleFromCookie(cookie: string | null): Locale | null {
  if (!cookie) return null;
  const match = cookie.match(/(?:^|; )vimovies_locale=([^;]+)/);
  const v = match?.[1];
  return v === 'es' || v === 'en' ? v : null;
}

function getLocaleFromAcceptLanguage(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return 'es';
  const primary = acceptLanguage.split(',')[0].trim().toLowerCase();
  if (primary.startsWith('en')) return 'en';
  return 'es';
}

export default async function NotFound() {
  const h = await headers();
  const cookie = h.get('cookie');
  const acceptLanguage = h.get('accept-language');
  const locale = getLocaleFromCookie(cookie) ?? getLocaleFromAcceptLanguage(acceptLanguage);
  const otherLocale: Locale = locale === 'en' ? 'es' : 'en';
  const base = `/${locale}`;
  const otherBase = `/${otherLocale}`;
  const translations = await getTranslations(locale);

  return (
    <>
      <Header locale={locale} />
      <main className={styles.main}>
        <div className="container">
          <div className={styles.grid}>
            <span className={styles.eyebrow}>404</span>
            <h1 className={styles.title}>{t(translations, 'notFound.title')}</h1>
            <p className={styles.message}>{t(translations, 'notFound.message')}</p>

            <div className={styles.actions}>
              <Link href={base} className={`${styles.homeBtn} btn`}>
                {t(translations, 'notFound.cta')}
              </Link>
              <div className={styles.langRow}>
                <span>{t(translations, 'notFound.alsoAvailable')}</span>
                <Link href={otherBase}>
                  {t(translations, `notFound.lang.${otherLocale}`)}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer locale={locale} />
    </>
  );
}
