"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { X } from "lucide-react";
import gsap from "gsap";
import { WIND_DOWN_CONTACT_EMAIL } from "@/_config/site-mode";

const STORAGE_KEY = "quickfund_winddown_dismissed";
// Drives the fixed SiteHeader top offset so it sits just below the banner.
const OFFSET_VAR = "--winddown-offset";

export function WindDownBanner() {
  const t = useTranslations("common");
  const locale = useLocale();
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Re-show on every visit: dismissal is remembered per session only.
  useEffect(() => {
    setIsMounted(true);
    try {
      if (!sessionStorage.getItem(STORAGE_KEY)) setIsVisible(true);
    } catch {
      setIsVisible(true);
    }
  }, []);

  // Animate in and keep the header offset in sync with the banner height.
  useEffect(() => {
    const el = containerRef.current;
    if (!isVisible || !el) return;

    gsap.fromTo(
      el,
      { opacity: 0, y: -16 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
    );

    const applyOffset = () => {
      document.documentElement.style.setProperty(OFFSET_VAR, `${el.offsetHeight}px`);
    };
    applyOffset();
    window.addEventListener("resize", applyOffset);

    return () => {
      window.removeEventListener("resize", applyOffset);
      document.documentElement.style.setProperty(OFFSET_VAR, "0px");
    };
  }, [isVisible]);

  const handleDismiss = () => {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // sessionStorage not available
    }

    if (containerRef.current) {
      gsap.to(containerRef.current, {
        opacity: 0,
        y: -16,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => setIsVisible(false),
      });
    } else {
      setIsVisible(false);
    }
  };

  if (!isMounted || !isVisible) return null;

  return (
    <div
      ref={containerRef}
      className="fixed top-0 left-0 w-full z-[60] bg-foreground text-background border-b border-background/10"
    >
      <div className="relative container mx-auto px-10 py-2.5">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-xs sm:text-sm">
          <span className="font-medium">{t("winddown.banner.message")}</span>
          <span className="hidden sm:inline text-background/30" aria-hidden>
            ·
          </span>
          <a
            href={`mailto:${WIND_DOWN_CONTACT_EMAIL}`}
            className="underline underline-offset-2 hover:text-background/70 transition-colors"
          >
            {WIND_DOWN_CONTACT_EMAIL}
          </a>
          <span className="hidden sm:inline text-background/30" aria-hidden>
            ·
          </span>
          <Link
            href={`/${locale}/login`}
            className="underline underline-offset-2 hover:text-background/70 transition-colors"
          >
            {t("winddown.banner.loginLabel")}
          </Link>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss"
          className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 text-background/60 hover:text-background transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default WindDownBanner;
