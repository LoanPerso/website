import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import LoginPageClient from "./page.client";

type Props = {
  params: { locale: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: "login" });
  const title = t("meta.title");
  const description = t("meta.description");
  const url = `/${params.locale}/login`;

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: { index: false, follow: false },
    openGraph: { title, description, url },
    twitter: { title, description },
  };
}

export default function LoginPage() {
  return <LoginPageClient />;
}

