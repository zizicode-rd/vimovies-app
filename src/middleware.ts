import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SUPPORTED_LOCALES = ['es', 'en'];
const FALLBACK = 'es';

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const { pathname, search } = req.nextUrl;

  // Skip middleware for Next internals, API routes and static assets
  const staticExtensions = /\.(svg|png|jpg|jpeg|gif|webp|ico|css|js|json|webmanifest|xml|txt)$/i;
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname.startsWith('/sitemap') ||
    staticExtensions.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Redirect legacy article routes to localized semantic paths
  const legacyArticle = pathname.match(/^\/(es|en)\/article\/(.+)$/);
  if (legacyArticle) {
    const [, articleLocale, slug] = legacyArticle;
    const segment = articleLocale === 'en' ? 'articles' : 'articulos';
    url.pathname = `/${articleLocale}/${segment}/${slug}`;
    return NextResponse.redirect(url, 301);
  }
  if (pathname.startsWith('/article/')) {
    const slug = pathname.replace('/article/', '');
    url.pathname = `/es/articulos/${slug}`;
    return NextResponse.redirect(url, 301);
  }

  // Redirect legacy brand query parameters to clean canonical paths
  const legacyBrand = pathname.match(/^\/(es|en)\/monitores$/);
  if (legacyBrand) {
    const [, monitorLocale] = legacyBrand;
    const brand = url.searchParams.get('brand');
    if (brand) {
      const segment = monitorLocale === 'en' ? 'brands' : 'marcas';
      url.searchParams.delete('brand');
      url.pathname = `/${monitorLocale}/monitores/${segment}/${brand}`;
      url.search = url.searchParams.toString();
      return NextResponse.redirect(url, 301);
    }
  }

  // If path already has a locale prefix, do nothing
  const segments = pathname.split('/');
  if (segments[1] && SUPPORTED_LOCALES.includes(segments[1])) {
    const response = NextResponse.next();
    response.headers.set('x-vimonitors-locale', segments[1]);
    return response;
  }

  // Resolve language from cookie (optional) or Accept-Language header
  const cookieLang = req.cookies.get('vimonitors_locale')?.value;
  if (cookieLang && SUPPORTED_LOCALES.includes(cookieLang)) {
    url.pathname = `/${cookieLang}${pathname}`;
    url.search = search;
    return NextResponse.redirect(url);
  }

  const header = req.headers.get('accept-language') || '';
  let detected = FALLBACK;
  if (header) {
    // parse first language token
    const first = header.split(',')[0].split(';')[0].trim();
    const primary = first.split('-')[0].toLowerCase();
    if (SUPPORTED_LOCALES.includes(primary)) detected = primary;
    else if (first.startsWith('en')) detected = 'en';
    else detected = FALLBACK;
  }

  // Redirect to the detected locale preserving the rest of the path and query
  url.pathname = `/${detected}${pathname}`;
  url.search = search;
  return NextResponse.redirect(url);
}

export const config = {
  // Run for any path except next internals and api (detailed filtering above)
  matcher: ['/', '/((?!_next|api|static).*)'],
};
