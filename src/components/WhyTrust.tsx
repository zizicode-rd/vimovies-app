import Link from 'next/link';
import { getTranslations, t } from '@/lib/i18n';
import styles from './WhyTrust.module.scss';

export default async function WhyTrust({ locale }: { locale: 'es' | 'en' }) {
  const translations = await getTranslations(locale);

  return (
    <section className={styles.section}>
      <div className="container">
        <div className="section-head" style={{ justifyContent: 'center', textAlign: 'center' }}>
          <div>
            <span className="eyebrow">{t(translations, 'why.eyebrow')}</span>
            <h2 className="section-title">{t(translations, 'why.title')}</h2>
          </div>
        </div>

        <div className={styles.whyCta}>
          <Link href={t(translations, 'why.methodologyHref', '/es/metodologia')} className={styles.methodologyLink}>
            {t(translations, 'why.methodologyCta', 'Cómo calibramos')}
          </Link>
        </div>

        <div className={styles.whyGrid}>
          <div className={styles.cell}>
            <div className={styles.num}>{t(translations, 'why.items.data.label')}</div>
            <h4 className={styles.cellTitle}>{t(translations, 'why.items.data.title')}</h4>
            <p className={styles.cellText}>{t(translations, 'why.items.data.text')}</p>
          </div>
          <div className={styles.cell}>
            <div className={styles.num}>{t(translations, 'why.items.fair.label')}</div>
            <h4 className={styles.cellTitle}>{t(translations, 'why.items.fair.title')}</h4>
            <p className={styles.cellText}>{t(translations, 'why.items.fair.text')}</p>
          </div>
          <div className={styles.cell}>
            <div className={styles.num}>{t(translations, 'why.items.fresh.label')}</div>
            <h4 className={styles.cellTitle}>{t(translations, 'why.items.fresh.title')}</h4>
            <p className={styles.cellText}>{t(translations, 'why.items.fresh.text')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
