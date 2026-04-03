import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import ContactClient from "./page.client";

type Props = {
  params: { locale: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: "contact" });
  const title = t("meta.title");
  const description = t("meta.description");

  return {
    title,
    description,
    alternates: { canonical: `/${params.locale}/contact` },
    openGraph: { title, description, url: `/${params.locale}/contact` },
    twitter: { title, description },
  };
}

export default function ContactPage() {
  return <ContactClient />;
}

