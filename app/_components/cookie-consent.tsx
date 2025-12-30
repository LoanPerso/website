"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Cookie } from "lucide-react";
import gsap from "gsap";

const STORAGE_KEY = "quickfund_cookies_consent";

export function CookieConsent() {
  const t = useTranslations("common");
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
    try {
      const consent = localStorage.getItem(STORAGE_KEY);
      if (!consent) {
        // Small delay to not show immediately with regulatory banner
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 1000);
        return () => clearTimeout(timer);
      }
    } catch {
      // localStorage not available
    }
  }, []);

  // Animate in when visible
  useEffect(() => {
    if (isVisible && containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 20, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "back.out(1.7)" }
      );
    }
  }, [isVisible]);

  const handleDismiss = (accepted: boolean) => {
    try {
      localStorage.setItem(STORAGE_KEY, accepted ? "accepted" : "declined");
    } catch {
      // localStorage not available
    }

    // Animate out
    if (containerRef.current) {
      gsap.to(containerRef.current, {
        opacity: 0,
        y: 20,
        scale: 0.95,
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
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-[90]"
    >
      <div className="bg-foreground text-background rounded-xl p-4 shadow-2xl">
        <div className="flex items-start gap-3">
          <Cookie className="w-5 h-5 mt-0.5 flex-shrink-0 text-accent" />
          <div className="flex-1">
            <p className="text-sm leading-relaxed mb-3">
              {t("cookies.message")}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDismiss(true)}
                className="px-4 py-2 bg-accent text-deep-black text-xs font-medium uppercase tracking-wider rounded hover:bg-accent/90 transition-colors"
              >
                {t("cookies.accept")}
              </button>
              <button
                onClick={() => handleDismiss(false)}
                className="px-4 py-2 text-xs font-medium uppercase tracking-wider text-background/60 hover:text-background transition-colors"
              >
                {t("cookies.decline")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CookieConsent;
