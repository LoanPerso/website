"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { MapPin, ArrowRight } from "lucide-react";
import { CountryCode } from "../types";
import { DEFAULT_COUNTRY } from "../countries";
import { CountryFlag } from "../components/CountryFlags";

interface CountrySelectStepProps {
  onSelect: (country: CountryCode) => void;
  t: (key: string) => string;
  locale?: string;
}

export function CountrySelectStep({ onSelect, t }: CountrySelectStepProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Animate on mount
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
      );
    }
  }, []);

  // Handle continue - always use Estonia
  const handleContinue = () => {
    if (buttonRef.current) {
      gsap.to(buttonRef.current, {
        scale: 0.98,
        duration: 0.1,
        ease: "power2.in",
        onComplete: () => {
          gsap.to(buttonRef.current, {
            scale: 1,
            duration: 0.2,
            ease: "power2.out",
            onComplete: () => {
              setTimeout(() => onSelect(DEFAULT_COUNTRY), 100);
            },
          });
        },
      });
    }
  };

  return (
    <div ref={containerRef} className="relative max-w-lg mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 mb-4">
          <MapPin className="w-6 h-6 text-accent" />
        </div>
        <p className="text-xs uppercase tracking-[0.25em] text-accent mb-4">
          {t("simulator.advanced.step0Eyebrow")}
        </p>
        <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-light mb-4">
          {t("simulator.advanced.step0Title")}
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          {t("simulator.advanced.step0Subtitle")}
        </p>
      </div>

      {/* Estonia display */}
      <div className="bg-foreground/[0.02] border border-foreground/10 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-center gap-4">
          <CountryFlag code="EE" className="w-12 h-9 rounded shadow-sm" />
          <div className="text-left">
            <p className="text-lg font-medium">{t("simulator.advanced.estoniaName")}</p>
            <p className="text-sm text-muted-foreground">
              {t("simulator.advanced.estoniaHint")}
            </p>
          </div>
        </div>
      </div>

      {/* Continue button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={handleContinue}
        className="w-full px-6 py-4 bg-accent text-accent-foreground rounded-xl font-medium transition-all duration-200 hover:bg-accent/90 flex items-center justify-center gap-2"
      >
        {t("simulator.advanced.continue")}
        <ArrowRight className="w-5 h-5" />
      </button>

      {/* Info text */}
      <p className="text-center text-xs text-muted-foreground/60 mt-6">
        {t("simulator.advanced.estoniaOnly")}
      </p>
    </div>
  );
}
