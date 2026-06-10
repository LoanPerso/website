"use client";

import { Link } from "@/_i18n/navigation";
import { useTranslations } from "next-intl";

// Minimal "holding" header for the wind-down state: brand wordmark + client
// login only — no marketing nav, no language switcher, no mobile menu. Sits
// just below the wind-down banner via the shared --winddown-offset CSS var.
export function WindDownHeader() {
  const t = useTranslations("common");

  return (
    <header
      style={{ top: "var(--winddown-offset, 0px)" }}
      className="fixed left-0 w-full z-50 mix-blend-difference text-white py-6"
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-serif font-bold tracking-tighter">
          <span className="font-medium">Quick</span>fund
        </Link>
        <Link
          href="/login"
          className="px-6 py-3 border border-white/20 rounded-full text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-300"
        >
          {t("nav.clientArea")}
        </Link>
      </div>
    </header>
  );
}

export default WindDownHeader;
