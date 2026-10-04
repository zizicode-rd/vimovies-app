import { NextResponse } from 'next/server';

const sitemaps = [
  'static',
  'monitors-es',
  'monitors-en',
  'brands-es',
  'brands-en',
  'articles-es',
  'articles-en',
  'comparisons-es',
  'comparisons-en',
  'hubs-es',
  'hubs-en',
];

export async function GET() {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps
  .map(
    (id) =>
      `  <sitemap><loc>https://vimonitors.com/sitemap/${id}.xml</loc></sitemap>`
  )
  .join('\n')}
</sitemapindex>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
