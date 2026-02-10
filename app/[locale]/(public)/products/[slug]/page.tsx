import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { getProductConfig, productExists } from "../_config";
import ProductPageClient from "./page.client";

type Props = {
  params: { locale: string; slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = params;

  if (!productExists(slug)) notFound();

  const config = getProductConfig(slug);
  const t = await getTranslations({ locale, namespace: config.translationKey });

  const eyebrow = t("hero.eyebrow");
  const heroTitle = t("hero.title");
  const subtitle = t("hero.subtitle");
  const description = t("hero.description");

  const title = heroTitle && eyebrow ? `${eyebrow}: ${heroTitle}` : eyebrow || heroTitle || "Product";
  const metaTitle = `${title} | Quickfund`;
  const metaDescription = description || subtitle || "Discover Quickfund credit products.";

  const url = `/${locale}/products/${slug}`;

  return {
    title: metaTitle,
    description: metaDescription,
    alternates: { canonical: url },
    openGraph: { title: metaTitle, description: metaDescription, url },
    twitter: { title: metaTitle, description: metaDescription },
  };
}

export default function ProductPage(props: Props) {
  return <ProductPageClient {...props} />;
}

