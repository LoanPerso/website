"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslations } from "next-intl";
import Magnetic from "@/_components/ui/magnetic-button";

gsap.registerPlugin(ScrollTrigger);

export function CtaFinal() {
  const t = useTranslations("home");
  const containerRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const decorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 70%",
        },
      });

      tl.fromTo(
        titleRef.current,
        { opacity: 0, y: 60 },
        { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
      )
        .fromTo(
          subtitleRef.current,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
          "-=0.5"
        )
        .fromTo(
          ctaRef.current,
          { opacity: 0, scale: 0.9 },
          { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.7)" },
          "-=0.3"
        );

      gsap.to(decorRef.current, {
        y: 20,
        rotation: 5,
        duration: 4,
        ease: "power1.inOut",
        repeat: -1,
        yoyo: true,
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative py-32 md:py-48 bg-deep-black overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-deep-black via-deep-black to-accent/10" />

      <div
        ref={decorRef}
        className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-accent/5 blur-3xl"
      />

      <div className="relative z-10 container mx-auto px-6 md:px-8 text-center">
        <h2
          ref={titleRef}
          className="font-serif text-5xl md:text-7xl lg:text-8xl text-white mb-6"
        >
          {t("cta.title.line1")}
          <br />
          <span className="text-accent">{t("cta.title.line2")}</span>
        </h2>

        <p
          ref={subtitleRef}
          className="text-xl md:text-2xl text-white/60 max-w-2xl mx-auto mb-12"
        >
          {t("cta.subtitle.line1")}
          <br />
          {t("cta.subtitle.line2")}
        </p>

        <div ref={ctaRef}>
          <Magnetic>
            <button className="group relative px-12 py-5 bg-accent text-deep-black rounded-full font-medium text-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-accent/30">
              <span className="relative z-10 flex items-center gap-3">
                {t("cta.button")}
                <svg
                  className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </span>
            </button>
          </Magnetic>

          <p className="mt-6 text-sm text-white/40">
            {t("cta.benefits")}
          </p>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-deep-black to-transparent" />
    </section>
  );
}

export default CtaFinal;
