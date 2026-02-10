import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import PrivacyPageClient from "./page.client";

type Props = { params: { locale: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: "legal" });
  const title = t("meta.privacy.title");
  const description = t("meta.privacy.description");
  const url = `/${params.locale}/legal/privacy`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url },
    twitter: { title, description },
  };
}

export default function PrivacyPage() {
  return <PrivacyPageClient />;
}

