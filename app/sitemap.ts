import type { MetadataRoute } from "next";
import { locales } from "@/_i18n/config";
import { NEW_CREDIT_CLOSED } from "@/_config/site-mode";
import { getProductSlugs } from "app/[locale]/(public)/products/_config";

function getBaseUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || "https://quickfund.fr";
  return raw.replace(/\/+$/, "");
}

const LEGAL_ROUTES = [
  "/legal/terms",
  "/legal/privacy",
  "/legal/notices",
  "/legal/cookies",
  "/legal/compliance",
] as const;

// Pages always present in the sitemap (kept online during the wind-down).
const CORE_ROUTES = ["", "/login", "/contact", ...LEGAL_ROUTES];

// Marketing / acquisition pages — only listed while the site is fully open
// (NEW_CREDIT_CLOSED === false). While closed they render the service-closed
// notice and are dropped here. Restored automatically when the flag flips back.
const OPEN_ROUTES = [
  "/products",
  "/why-us",
  "/pricing",
  "/about",
  "/features",
  "/tools/simulator",
  "/application",
];

const PUBLIC_ROUTES: string[] = [
  ...CORE_ROUTES,
  ...(NEW_CREDIT_CLOSED ? [] : OPEN_ROUTES),
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getBaseUrl();
  const lastModified = new Date();

  const urls: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const route of PUBLIC_ROUTES) {
      urls.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified,
        changeFrequency: route === "" ? "weekly" : "monthly",
        priority: route === "" ? 1 : route === "/products" ? 0.9 : 0.7,
      });
    }

    if (!NEW_CREDIT_CLOSED) {
      for (const slug of getProductSlugs()) {
        urls.push({
          url: `${baseUrl}/${locale}/products/${slug}`,
          lastModified,
          changeFrequency: "monthly",
          priority: 0.8,
        });
      }
    }
  }

  return urls;
}

