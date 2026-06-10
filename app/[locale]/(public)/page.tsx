import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { NEW_CREDIT_CLOSED } from "@/_config/site-mode";
import { WindDownLanding } from "@/_components/wind-down-landing";
import PublicHomeClient from "./page.client";

type Props = {
  params: { locale: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Wind-down: the landing is a holding page — surface the closure message
  // (still indexable; restored to the marketing meta when the flag flips back).
  if (NEW_CREDIT_CLOSED) {
    const tc = await getTranslations({ locale: params.locale, namespace: "common" });
    return {
      title: tc("winddown.notice.title"),
      description: tc("winddown.notice.body"),
      alternates: { canonical: `/${params.locale}` },
    };
  }

  const t = await getTranslations({ locale: params.locale, namespace: "home" });
  const title = t("meta.title");
  const description = t("meta.description");

  return {
    title,
    description,
    alternates: {
      canonical: `/${params.locale}`,
    },
    openGraph: {
      title,
      description,
      url: `/${params.locale}`,
    },
    twitter: {
      title,
      description,
    },
  };
}

export default function PublicHomePage() {
  if (NEW_CREDIT_CLOSED) return <WindDownLanding />;
  return <PublicHomeClient />;
}

