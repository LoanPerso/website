"use client";

import { forwardRef, useImperativeHandle, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslations } from "next-intl";

gsap.registerPlugin(ScrollTrigger);

export interface BrandOverlayRef {
  overlay: HTMLDivElement | null;
  container: HTMLDivElement | null;
  lines: HTMLDivElement[];
}

export const BrandOverlay = forwardRef<BrandOverlayRef>((_, ref) => {
  const t = useTranslations("home");
  const overlayRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const linesRef = useRef<HTMLDivElement[]>([]);

  const brandLines = [
    { text: t("brandStatement.line1"), accent: false },
    { text: t("brandStatement.line2"), accent: true },
    { text: t("brandStatement.line3"), accent: false },
    { text: t("brandStatement.line4"), accent: true },
  ];

  // Hide overlay when scrolled past hero section
  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: "body",
        start: "top top",
        end: "+=200%", // After hero + some scroll
        onUpdate: (self) => {
          // Hide when scrolled past ~150% of viewport
          if (self.progress > 0.6) {
            gsap.set(overlayRef.current, { visibility: "hidden" });
            gsap.set(containerRef.current, { visibility: "hidden" });
          } else {
            gsap.set(overlayRef.current, { visibility: "visible" });
            gsap.set(containerRef.current, { visibility: "visible" });
          }
        },
      });
    });

    return () => ctx.revert();
  }, []);

  useImperativeHandle(ref, () => ({
    overlay: overlayRef.current,
    container: containerRef.current,
    lines: linesRef.current,
  }));

  return (
    <>
      {/* Black overlay background */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[55] bg-deep-black pointer-events-none opacity-0"
      />

      {/* Brand statement text */}
      <div
        ref={containerRef}
        className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none opacity-0"
      >
        <div className="max-w-5xl mx-auto text-center px-6">
          {brandLines.map((line, i) => (
            <div
              key={i}
              ref={(el) => {
                if (el) linesRef.current[i] = el;
              }}
            >
              <p
                className={`font-serif text-4xl md:text-6xl lg:text-7xl leading-tight mb-4 ${
                  line.accent ? "text-accent" : "text-white"
                }`}
              >
                {line.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
});

BrandOverlay.displayName = "BrandOverlay";

export default BrandOverlay;
