import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { NEW_CREDIT_CLOSED } from "@/_config/site-mode";
import { ServiceClosedNotice } from "@/_components/service-closed-notice";
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
    // Wind-down: page closed, keep it out of the index (restored with the flag).
    ...(NEW_CREDIT_CLOSED ? { robots: { index: false, follow: false } } : {}),
    alternates: { canonical: url },
    openGraph: { title, description, url },
    twitter: { title, description },
  };
}

export default function WhyUsPage() {
  if (NEW_CREDIT_CLOSED) return <ServiceClosedNotice />;
  return <WhyUsPageClient />;
}

