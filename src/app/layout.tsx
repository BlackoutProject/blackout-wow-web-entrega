import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import localFont from "next/font/local";
import { cookies } from "next/headers";
import "./globals.css";
import "./portal.css";
import "./warcraft.css";
import "./blackout.css";
import "./visual-refinements.css";
import "./cinematic-polish.css";
import "./warcraft-scenes.css";
import "./blackout-cinematic.css";
import "./information-design.css";
import "./blackout-color.css";
import "./blackout-steel.css";
import "./interaction-states.css";
import { BlackoutCursor } from "@/components/BlackoutCursor";
import { AuthProvider } from "@/context/AuthContext";
import { InterfaceSoundProvider } from "@/components/InterfaceSound";
import { LanguageProvider } from "@/components/LanguageProvider";
import { languageCookieName, resolveAppLanguage } from "@/i18n/settings";
import { metadataTranslations } from "@/lib/metadata-copy";
import {
  BRAND_LOGO_PATH,
  OG_IMAGE_PATH,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_LOCALE,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
  withBaseUrl,
} from "@/lib/seo";

const geistSans = localFont({src: [{path: '../../public/fonts/inter-400.ttf', weight: '400'}, {path: '../../public/fonts/inter-500.ttf', weight: '500'}, {path: '../../public/fonts/inter-600.ttf', weight: '600'}, {path: '../../public/fonts/inter-700.ttf', weight: '700'}], variable: '--font-geist-sans', display: 'swap'});
const cinzel = localFont({src: [{path: '../../public/fonts/cinzel-400.ttf', weight: '400'}, {path: '../../public/fonts/cinzel-600.ttf', weight: '600'}, {path: '../../public/fonts/cinzel-700.ttf', weight: '700'}], variable: '--font-cinzel', display: 'swap'});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  icons: {
    icon: [{ url: "/brand/blackout-192.png", type: "image/png", sizes: "192x192" }],
    apple: [{ url: "/brand/blackout-180.png", type: "image/png", sizes: "180x180" }],
  },
  alternates: {
    canonical: "/",
  },
  keywords: [...SITE_KEYWORDS],
  openGraph: {
    type: "website",
    locale: SITE_LOCALE,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
    url: withBaseUrl("/"),
    images: [
      {
        url: withBaseUrl(OG_IMAGE_PATH),
        width: 1200,
        height: 630,
        alt: SITE_TITLE,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [withBaseUrl(OG_IMAGE_PATH)],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: SITE_NAME,
  alternateName: ["Blackout WoW", "Blackout-WoW 255"],
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  inLanguage: ["es", "en", "pt"],
  publisher: {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: withBaseUrl(BRAND_LOGO_PATH),
      width: 512,
      height: 512,
    },
  },
} as const;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const lang = resolveAppLanguage(cookieStore.get(languageCookieName)?.value);

  return (
    <html lang={lang} data-scroll-behavior="smooth">
      <body
        className={`${geistSans.variable} ${cinzel.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({ ...websiteJsonLd, description: lang === "es" ? SITE_DESCRIPTION : metadataTranslations["/"][lang].description }),
          }}
        />
        <LanguageProvider initialLanguage={lang}>
          <AuthProvider><InterfaceSoundProvider>{children}</InterfaceSoundProvider></AuthProvider>
        </LanguageProvider>
        <Analytics />
        <BlackoutCursor />
      </body>
    </html>
  );
}
