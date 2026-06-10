import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { NEW_CREDIT_CLOSED } from "@/_config/site-mode";
import { ServiceClosedNotice } from "@/_components/service-closed-notice";
import SimulatorPageClient from "./page.client";

type Props = {
  params: { locale: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: "tools" });
  const title = t("meta.simulator.title");
  const description = t("meta.simulator.description");
  const url = `/${params.locale}/tools/simulator`;

  return {
    title,
    description,
    // Keep the closed page out of the index; restored when the flag flips back.
    ...(NEW_CREDIT_CLOSED ? { robots: { index: false, follow: false } } : {}),
    alternates: { canonical: url },
    openGraph: { title, description, url },
    twitter: { title, description },
  };
}

export default function SimulatorPage() {
  if (NEW_CREDIT_CLOSED) return <ServiceClosedNotice />;
  return <SimulatorPageClient />;
}

