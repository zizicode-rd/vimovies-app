import type { Metadata } from 'next';

export const siteName = 'Vimonitors';
export const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://vimonitors.com';

export type SeoPage = {
  locale: 'es' | 'en';
  path: string;
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
  image?: string;
  type?: 'website' | 'article';
  noIndex?: boolean;
};

export function buildMetadata({
  locale,
  path,
  title,
  description,
  ogTitle,
  ogDescription,
  image,
  type = 'website',
  noIndex,
}: SeoPage): Metadata {
  const site = locale === 'en' ? 'Vimonitors' : 'Vimonitors';
  const fullTitle = title.toLowerCase().includes(site.toLowerCase()) ? title : `${title} — ${site}`;
  const canonical = `${baseUrl}${path}`;
  const ogImage = image ?? `${baseUrl}/opengraph-image.png`;

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
    title: ogTitle ?? fullTitle,
    description: ogDescription ?? description,
    images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
  };

  const twitter: Metadata['twitter'] = {
    card: 'summary_large_image',
    title: ogTitle ?? fullTitle,
    description: ogDescription ?? description,
    images: [ogImage],
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
    name: 'Vimonitors',
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
    name: 'Vimonitors',
    url: baseUrl,
    sameAs: [
      'https://www.tiktok.com/@vimonitors',
      'https://www.instagram.com/vimonitors',
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
