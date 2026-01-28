"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Shield, ChevronDown, ChevronUp } from "lucide-react";
import gsap from "gsap";
import { useSiteReady } from "./site-ready-provider";

const STORAGE_KEY = "quickfund_regulatory_accepted";

export function RegulatoryDisclaimer() {
  const t = useTranslations("common");
  const { isPreloaderDone, setRegulatoryAccepted } = useSiteReady();
  const [isMounted, setIsMounted] = useState(false);
  const [needsAcceptance, setNeedsAcceptance] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
    try {
      const accepted = localStorage.getItem(STORAGE_KEY);
      if (accepted) {
        setRegulatoryAccepted();
      } else {
        setNeedsAcceptance(true);
      }
    } catch {
      setRegulatoryAccepted();
    }
  }, [setRegulatoryAccepted]);

  // Show modal after preloader is done
  useEffect(() => {
    if (isPreloaderDone && needsAcceptance && !isVisible) {
      setIsVisible(true);
      document.body.style.overflow = "hidden";

      // Animate in
      if (containerRef.current && modalRef.current) {
        gsap.fromTo(
          containerRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.3, ease: "power2.out" }
        );
        gsap.fromTo(
          modalRef.current,
          { opacity: 0, y: 30, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "back.out(1.7)", delay: 0.1 }
        );
      }
    }
  }, [isPreloaderDone, needsAcceptance, isVisible]);

  const handleAccept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // localStorage not available
    }

    const closeModal = () => {
      setIsVisible(false);
      setRegulatoryAccepted();
      document.body.style.overflow = "";
    };

    // Animate out with fallback
    if (containerRef.current && modalRef.current) {
      // Safety timeout in case animation fails
      const fallbackTimeout = setTimeout(closeModal, 600);

      const tl = gsap.timeline({
        onComplete: () => {
          clearTimeout(fallbackTimeout);
          closeModal();
        },
      });

      tl.to(modalRef.current, {
        opacity: 0,
        y: -20,
        scale: 0.95,
        duration: 0.3,
        ease: "power2.in",
      });
      tl.to(
        containerRef.current,
        { opacity: 0, duration: 0.2, ease: "power2.in" },
        "-=0.1"
      );
    } else {
      closeModal();
    }
  };

  if (!isMounted || !isVisible) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] bg-deep-black/95 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div
        ref={modalRef}
        className="bg-background border border-foreground/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="p-6 border-b border-foreground/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
            <Shield className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h2 className="text-xl font-serif font-medium text-foreground">
              {t("regulatory.title")}
            </h2>
            <p className="text-sm text-muted-foreground">Quickfund OÜ</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p>{t("regulatory.company")}</p>
            <p>{t("regulatory.passport")}</p>

            {/* Expandable section */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 text-accent hover:text-accent/80 transition-colors text-sm font-medium"
            >
              {t("regulatory.moreInfo")}
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {isExpanded && (
              <div className="space-y-4 pt-2 border-t border-foreground/5">
                <p>{t("regulatory.availability")}</p>
                <p>{t("regulatory.refusal")}</p>
                <p>{t("regulatory.compliance")}</p>
                <p className="text-foreground/70 font-medium">
                  {t("regulatory.fraud")}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-foreground/10 bg-foreground/[0.02]">
          <button
            onClick={handleAccept}
            className="w-full py-4 bg-foreground text-background font-medium text-sm uppercase tracking-wider hover:bg-accent transition-colors duration-300"
          >
            {t("regulatory.accept")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default RegulatoryDisclaimer;
