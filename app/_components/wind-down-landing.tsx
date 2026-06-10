"use client";

import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { WIND_DOWN_CONTACT_EMAIL } from "@/_config/site-mode";

// Minimal, single-screen holding landing shown while the site is wound down:
// no marketing, no scroll — the message, how to reach us, and client login.
const LEGAL_LINKS = [
  { href: "legal/notices", key: "legal.legalNotice" },
  { href: "legal/privacy", key: "legal.privacy" },
  { href: "legal/terms", key: "legal.terms" },
] as const;

export function WindDownLanding() {
  const t = useTranslations("common");
  const locale = useLocale();

  return (
    <section className="relative flex min-h-[100dvh] flex-col bg-background px-6">
      <div className="flex flex-1 items-center justify-center">
        <div className="mx-auto w-full max-w-2xl text-center">
          <div className="mx-auto mb-8 h-px w-12 bg-accent" />

          <h1 className="mb-6 font-serif text-4xl leading-[1.05] tracking-tight sm:text-5xl">
            {t("winddown.notice.title")}
          </h1>

          <p className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-muted-foreground">
            {t("winddown.notice.body")}
          </p>

          <p className="mb-10 text-sm text-muted-foreground">
            {t("winddown.notice.contactIntro")}{" "}
            <a
              href={`mailto:${WIND_DOWN_CONTACT_EMAIL}`}
              className="font-medium text-foreground underline underline-offset-4 transition-colors hover:text-accent"
            >
              {WIND_DOWN_CONTACT_EMAIL}
            </a>
          </p>

          <Link
            href={`/${locale}/login`}
            className="inline-flex items-center justify-center rounded bg-foreground px-8 py-3 text-sm font-medium tracking-wide text-background transition-colors hover:bg-accent"
          >
            {t("winddown.notice.login")}
          </Link>
        </div>
      </div>

      <footer className="shrink-0 py-6">
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
          {LEGAL_LINKS.map((l) => (
            <Link
              key={l.href}
              href={`/${locale}/${l.href}`}
              className="transition-colors hover:text-foreground"
            >
              {t(l.key)}
            </Link>
          ))}
          <span className="text-muted-foreground/60">© Quickfund OÜ</span>
        </div>
      </footer>
    </section>
  );
}

export default WindDownLanding;
