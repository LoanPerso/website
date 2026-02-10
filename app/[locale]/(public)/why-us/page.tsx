import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import WhyUsPageClient from "./page.client";

type Props = {
  params: { locale: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: "why-us" });
  const title = t("meta.title");
  const description = t("meta.description");
  const url = `/${params.locale}/why-us`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url },
    twitter: { title, description },
  };
}

export default function WhyUsPage() {
  return <WhyUsPageClient />;
}

