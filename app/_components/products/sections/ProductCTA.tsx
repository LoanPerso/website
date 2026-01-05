"use client";

import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import Link from "next/link";

interface ProductCTAProps {
  translationKey: string;
  darkBackground?: boolean;
}

export function ProductCTA({
  translationKey,
  darkBackground = true,
}: ProductCTAProps) {
  const t = useTranslations(translationKey);
  const locale = useLocale();

  const bgClass = darkBackground
    ? "bg-foreground text-background"
    : "bg-accent/10";

  const subtitleClass = darkBackground
    ? "text-background/60"
    : "text-muted-foreground";

  const reassuranceClass = darkBackground
    ? "text-background/40"
    : "text-muted-foreground/60";

  return (
    <section className={`py-32 lg:py-48 relative overflow-hidden ${bgClass}`}>
      {darkBackground && (
        <>
          <div className="absolute top-0 left-0 w-96 h-96 bg-accent/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-accent/5 rounded-full translate-x-1/2 translate-y-1/2" />
        </>
      )}

      <div className="container relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-5xl md:text-6xl lg:text-7xl mb-6">
            {t("finalCta.title")}
          </h2>
          <p className={`text-xl mb-12 ${subtitleClass}`}>
            {t("finalCta.subtitle")}
          </p>

          <Link
            href={`/${locale}/tools/simulator`}
            className="inline-flex items-center gap-3 px-12 py-5 bg-accent text-white rounded-full text-lg font-medium hover:bg-dark-gold transition-colors duration-300"
          >
            {t("finalCta.cta")}
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>

          <p className={`text-sm mt-8 ${reassuranceClass}`}>
            {t("finalCta.reassurance")}
          </p>
        </div>
      </div>
    </section>
  );
}
