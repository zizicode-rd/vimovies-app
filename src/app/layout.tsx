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
  title: "Vimovies — Elige monitor con datos, no con marketing",
  description: "Comparador de monitores con especificaciones verificadas y puntuaciones reales por uso. Encuentra el mejor monitor para gaming, oficina o edición.",
  metadataBase: new URL("https://vimovies.com"),
  openGraph: {
    type: "website",
    siteName: "Vimovies",
    title: "Vimovies — Elige monitor con datos, no con marketing",
    description: "Comparador de monitores con especificaciones verificadas y puntuaciones reales por uso. Encuentra el mejor monitor para gaming, oficina o edición.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vimovies — Elige monitor con datos, no con marketing",
    description: "Comparador de monitores con especificaciones verificadas y puntuaciones reales por uso. Encuentra el mejor monitor para gaming, oficina o edición.",
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: "https://vimovies.com",
    languages: {
      "x-default": "https://vimovies.com",
      es: "https://vimovies.com/es",
      en: "https://vimovies.com/en",
    },
  },
};

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
