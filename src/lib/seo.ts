import type { Metadata } from 'next';

export const siteName = 'Vimovies';
export const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://vimovies.com';

export type SeoPage = {
  locale: 'es' | 'en';
  path: string;
  title: string;
  description: string;
  image?: string;
  type?: 'website' | 'article';
  noIndex?: boolean;
};

export function buildMetadata({
  locale,
  path,
  title,
  description,
  image,
  type = 'website',
  noIndex,
}: SeoPage): Metadata {
  const site = locale === 'en' ? 'Vimovies' : 'Vimovies';
  const fullTitle = title.toLowerCase().includes(site.toLowerCase()) ? title : `${title} — ${site}`;
  const canonical = `${baseUrl}${path}`;
  const ogImage = image ?? `${baseUrl}/og.png`;
  const hasImage = !!image;

  const alternates: Metadata['alternates'] = {
    canonical,
    languages: {
      'x-default': `${baseUrl}${path}`,
      es: `${baseUrl}/es${path.replace(/^\/(es|en)/, '') || ''}`,
      en: `${baseUrl}/en${path.replace(/^\/(es|en)/, '') || ''}`,
    },
  };

  const og: Metadata['openGraph'] = {
    type,
    locale: locale === 'en' ? 'en_US' : 'es_ES',
    url: canonical,
    siteName,
    title: fullTitle,
    description,
    images: hasImage ? [{ url: ogImage, width: 1200, height: 630, alt: title }] : undefined,
  };

  const twitter: Metadata['twitter'] = {
    card: 'summary_large_image',
    title: fullTitle,
    description,
    images: hasImage ? [ogImage] : undefined,
  };

  return {
    title: fullTitle,
    description,
    metadataBase: new URL(baseUrl),
    alternates,
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: og,
    twitter,
  };
}

export function jsonLdWebsite(): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Vimovies',
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/es/monitores?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  });
}

export function jsonLdOrganization(): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Vimovies',
    url: baseUrl,
    sameAs: [
      'https://www.tiktok.com/@vimovies',
      'https://www.instagram.com/vimovies',
    ],
  });
}

export function jsonLdBreadcrumb(items: { name: string; url: string }[]): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  });
}
