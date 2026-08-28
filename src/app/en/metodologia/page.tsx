import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { buildMetadata } from '@/lib/seo';
import { getTranslations, t } from '@/lib/i18n';

export const metadata: Metadata = buildMetadata({
  locale: 'en',
  path: '/en/metodologia',
  title: 'Monitor analysis and scoring methodology',
  description: 'How we verify technical specs, calculate usage-based scores and maintain our monitor catalog for gaming, office and content creation.',
  type: 'article',
});

export default async function MethodologyPage() {
  const translations = await getTranslations('en');

  return (
    <>
      <Header locale="en" />
      <main className="container" style={{ padding: '64px 0 120px' }}>
        <span className="eyebrow">Methodology</span>
        <h1 className="section-title" style={{ marginBottom: 24 }}>How Vimovies works</h1>
        <div className="prose" style={{ maxWidth: 720 }}>
          <p style={{ fontSize: '17px', lineHeight: 1.7, color: 'var(--color-gray-700)', marginBottom: 32 }}>
            Every Vimovies monitor sheet starts from the manufacturer&apos;s official spec sheet. We cross-check resolution, refresh rate, panel type, brightness, connectivity and other key specs to catch errors or inflated claims.
          </p>
          <h2 style={{ fontSize: '22px', marginTop: 40, marginBottom: 16 }}>Profile scores</h2>
          <p style={{ fontSize: '16px', lineHeight: 1.7, color: 'var(--color-gray-700)', marginBottom: 24 }}>
            We assign three scores (gaming, office and editing) by combining technical data with weighted rules for each use case. This is not a subjective review score: it reflects how suitable the monitor is for that specific scenario.
          </p>
          <h2 style={{ fontSize: '22px', marginTop: 40, marginBottom: 16 }}>Data updates</h2>
          <p style={{ fontSize: '16px', lineHeight: 1.7, color: 'var(--color-gray-700)', marginBottom: 24 }}>
            We review prices, availability and new releases every week. Comparisons and hub selections are recalculated automatically when the database changes.
          </p>
          <h2 style={{ fontSize: '22px', marginTop: 40, marginBottom: 16 }}>Independence</h2>
          <p style={{ fontSize: '16px', lineHeight: 1.7, color: 'var(--color-gray-700)' }}>
            {t(translations, 'footer.tagline')}
          </p>
        </div>
      </main>
      <Footer locale="en" />
    </>
  );
}
