import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers, cookies } from "next/headers";
import "./globals.css";
import "../styles/globals.scss";
import { jsonLdOrganization, jsonLdWebsite } from "@/lib/seo";
import GlobalLoader from "@/components/GlobalLoader";
import AppPreloader from "@/components/AppPreloader";

interface LayoutProps<T = string> {
  children: React.ReactNode;
  params?: T;
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vimonitors — Elige monitor con datos, no con marketing",
  description: "Comparador de monitores con especificaciones verificadas y puntuaciones reales por uso. Encuentra el mejor monitor para gaming, oficina o edición.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://vimonitors.com"),
  openGraph: {
    type: "website",
    siteName: "Vimonitors",
    title: "Vimonitors — Elige monitor con datos, no con marketing",
    description: "Comparador de monitores con especificaciones verificadas y puntuaciones reales por uso. Encuentra el mejor monitor para gaming, oficina o edición.",
    images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: "Vimonitors" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vimonitors — Elige monitor con datos, no con marketing",
    description: "Comparador de monitores con especificaciones verificadas y puntuaciones reales por uso. Encuentra el mejor monitor para gaming, oficina o edición.",
    images: ["/twitter-image.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Vimonitors",
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: "https://vimonitors.com",
    languages: {
      "x-default": "https://vimonitors.com",
      es: "https://vimonitors.com/es",
      en: "https://vimonitors.com/en",
    },
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export const themeColor = "#000000";

function getLocaleFromRequest(h: Awaited<ReturnType<typeof headers>>, cookieStore: Awaited<ReturnType<typeof cookies>>): 'es' | 'en' {
  const headerLocale = h.get('x-vimonitors-locale');
  if (headerLocale === 'en' || headerLocale === 'es') return headerLocale;
  const cookie = cookieStore.get('vimonitors_locale')?.value;
  if (cookie === 'en' || cookie === 'es') return cookie;
  return 'es';
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const h = await headers();
  const cookieStore = await cookies();
  const locale = getLocaleFromRequest(h, cookieStore);
  return (
    <html lang={locale} data-scroll-behavior="smooth" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-KKPQ58WC');`,
          }}
        />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-WPYBE6LB6M" />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-WPYBE6LB6M');`,
          }}
        />
        <link rel="manifest" href="/site.webmanifest" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdWebsite() }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdOrganization() }}
        />
      </head>
      <body suppressHydrationWarning>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-KKPQ58WC"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        <AppPreloader />
        <GlobalLoader />
        <div className="app-root">
          {children}
        </div>
      </body>
    </html>
  );
}
