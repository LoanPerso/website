import type { MetadataRoute } from "next";
import { locales } from "@/_i18n/config";
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

const PUBLIC_ROUTES = [
  "",
  "/products",
  "/why-us",
  "/tools/simulator",
  "/login",
  "/pricing",
  "/about",
  "/features",
  "/application",
  ...LEGAL_ROUTES,
] as const;

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

    for (const slug of getProductSlugs()) {
      urls.push({
        url: `${baseUrl}/${locale}/products/${slug}`,
        lastModified,
        changeFrequency: "monthly",
        priority: 0.8,
      });
    }
  }

  return urls;
}

