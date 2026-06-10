"use client";

import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { Lock } from "lucide-react";
import { WIND_DOWN_CONTACT_EMAIL } from "@/_config/site-mode";

// Dedicated, non-modal notice (Golden Rule 9) rendered in place of the
// application form / simulator while the acquisition funnel is closed.
export function ServiceClosedNotice() {
  const t = useTranslations("common");
  const locale = useLocale();

  return (
    <main className="bg-background min-h-screen">
      <section className="pt-32 pb-20 lg:pt-40 lg:pb-32">
        <div className="container">
          <div className="max-w-xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-foreground/5 border border-foreground/10 mb-8">
              <Lock className="w-7 h-7 text-muted-foreground" strokeWidth={1.5} />
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl leading-tight mb-5">
              {t("winddown.notice.title")}
            </h1>

            <p className="text-muted-foreground leading-relaxed mb-8">
              {t("winddown.notice.body")}
            </p>

            <p className="text-sm text-muted-foreground mb-10">
              {t("winddown.notice.contactIntro")}{" "}
              <a
                href={`mailto:${WIND_DOWN_CONTACT_EMAIL}`}
                className="text-foreground font-medium underline underline-offset-2 hover:text-accent transition-colors"
              >
                {WIND_DOWN_CONTACT_EMAIL}
              </a>
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href={`/${locale}`}
                className="px-6 py-3 border border-foreground/20 rounded text-sm font-medium hover:bg-foreground/5 transition-colors"
              >
                {t("winddown.notice.home")}
              </Link>
              <Link
                href={`/${locale}/login`}
                className="px-6 py-3 bg-foreground text-background rounded text-sm font-medium hover:bg-accent transition-colors"
              >
                {t("winddown.notice.login")}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default ServiceClosedNotice;
