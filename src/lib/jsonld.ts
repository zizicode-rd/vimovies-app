export function generateMonitorJsonLd(monitor: any, locale: 'es' | 'en', canonicalUrl: string) {
  const isEs = locale === 'es';
  const brand = monitor?.brand;
  const brandName = brand?.name ?? '';
  const brandSlug = brand?.slug ?? '';
  const name = `${brandName} ${monitor?.model_name ?? ''}`.trim();
  const sku = monitor?.sku || monitor?.slug || '';

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: isEs ? 'Inicio' : 'Home',
        item: `https://vimonitors.com/${locale}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: isEs ? 'Monitores' : 'Monitors',
        item: `https://vimonitors.com/${locale}/monitores`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: brandName,
        item: `https://vimonitors.com/${locale}/monitores/${isEs ? 'marcas' : 'brands'}/${brandSlug}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: name,
        item: canonicalUrl,
      },
    ],
  };

  const product: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    image: monitor?.main_image_url ?? monitor?.media?.[0]?.cdn_url,
    description: monitor?.meta_description,
    brand: {
      '@type': 'Brand',
      name: brandName,
    },
    sku,
    url: canonicalUrl,
  };

  const ratingValue = monitor?.rating_value;
  const ratingCount = monitor?.rating_count;
  if (ratingValue && Number(ratingCount) > 0) {
    product.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: String(ratingValue),
      reviewCount: String(ratingCount),
      bestRating: '10',
      worstRating: '1',
    };
  }

  return { breadcrumb, product };
}
