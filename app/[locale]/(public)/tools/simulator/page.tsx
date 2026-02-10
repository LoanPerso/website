import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
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
    alternates: { canonical: url },
    openGraph: { title, description, url },
    twitter: { title, description },
  };
}

export default function SimulatorPage() {
  return <SimulatorPageClient />;
}

