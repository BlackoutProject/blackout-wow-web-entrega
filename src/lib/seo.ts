import type { Metadata } from "next";

export const SITE_NAME = "Blackout-WoW";
export const SITE_TITLE = "Blackout-WoW | WoW 3.3.5a Custom 255 · PvE y PvP";
export const SITE_DESCRIPTION =
  "WoW 3.3.5a nivel 255: 3 clases custom, 35 raids —19 custom— y más de 30 mapas custom. Subida de nivel rápida, estadísticas altas y progresión PvE/PvP T1–T35.";
export const SITE_LOCALE = "es_CL";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://blackout-wow.com";

/** Keywords base reutilizables en páginas indexables. */
export const SITE_KEYWORDS = [
  "Blackout WoW",
  "servidor WoW privado",
  "WotLK",
  "Wrath of the Lich King",
  "WoW 3.3.5a",
  "servidor custom",
  "WoW nivel 255",
  "WoW Tier 35",
  "WoW Latinoamérica",
  "private WoW server",
  "custom WoW server level 255",
] as const;

export const OG_IMAGE_PATH = "/brand/blackout-social.png";
export const BRAND_LOGO_PATH = "/brand/blackout-512.png";

export function withBaseUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalizedPath}`;
}

type BuildPageMetadataOptions = {
  /** Segmento de título; el layout raíz añade la marca salvo en títulos absolutos. */
  title: string;
  absoluteTitle?: boolean;
  description: string;
  /** Ruta canónica, ej. `/login` */
  pathname: string;
  keywords?: string[];
  /** Login, cuenta, dashboard, etc. */
  noIndex?: boolean;
  locale?: string;
};

/**
 * Metadata coherente: canonical, Open Graph, Twitter y robots.
 * Usar en layouts y páginas con `metadata` estático.
 */
export function buildPageMetadata({
  title,
  absoluteTitle = false,
  description,
  pathname,
  keywords,
  noIndex = false,
  locale = SITE_LOCALE,
}: BuildPageMetadataOptions): Metadata {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const ogTitle = absoluteTitle ? title : `${title} | ${SITE_NAME}`;
  const mergedKeywords = keywords?.length
    ? [...new Set([...SITE_KEYWORDS, ...keywords])]
    : [...SITE_KEYWORDS];

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    keywords: mergedKeywords,
    alternates: {
      canonical: path,
    },
    openGraph: {
      type: "website",
      locale,
      siteName: SITE_NAME,
      title: ogTitle,
      description,
      url: path,
      images: [
        {
          url: withBaseUrl(OG_IMAGE_PATH),
          width: 1200,
          height: 630,
          alt: ogTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      images: [withBaseUrl(OG_IMAGE_PATH)],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
            noimageindex: true,
            "max-video-preview": -1,
            "max-image-preview": "none",
            "max-snippet": -1,
          },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
          },
        },
  };
}
