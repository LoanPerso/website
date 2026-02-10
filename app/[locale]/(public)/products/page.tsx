import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import ProductsPageClient from "./page.client";

type Props = {
  params: { locale: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: "products" });
  const title = t("meta.title");
  const description = t("meta.description");

  return {
    title,
    description,
    alternates: {
      canonical: `/${params.locale}/products`,
    },
    openGraph: {
      title,
      description,
      url: `/${params.locale}/products`,
    },
    twitter: {
      title,
      description,
    },
  };
}

export default function ProductsPage() {
  return <ProductsPageClient />;
}

