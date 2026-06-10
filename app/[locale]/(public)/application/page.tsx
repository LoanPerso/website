import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { NEW_CREDIT_CLOSED } from "@/_config/site-mode";
import { ServiceClosedNotice } from "@/_components/service-closed-notice";
import ApplicationPageClient from "./page.client";

type Props = {
  params: { locale: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: "tools" });
  const title = t("application.title");
  const description = t("application.subtitle");
  const url = `/${params.locale}/application`;

  return {
    title,
    description,
    // Keep the closed page out of the index; restored when the flag flips back.
    ...(NEW_CREDIT_CLOSED ? { robots: { index: false, follow: false } } : {}),
    alternates: { canonical: url },
  };
}

export default function ApplicationPage() {
  if (NEW_CREDIT_CLOSED) return <ServiceClosedNotice />;
  return <ApplicationPageClient />;
}
