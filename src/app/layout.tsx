import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
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
        <AppPreloader />
        <GlobalLoader />
        <div className="app-root">
          {children}
        </div>
      </body>
    </html>
  );
}
