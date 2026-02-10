import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import NoticesPageClient from "./page.client";

type Props = { params: { locale: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: "legal" });
  const title = t("meta.legalNotices.title");
  const description = t("meta.legalNotices.description");
  const url = `/${params.locale}/legal/notices`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url },
    twitter: { title, description },
  };
}

export default function NoticesPage() {
  return <NoticesPageClient />;
}

