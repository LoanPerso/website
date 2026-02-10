"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslations } from "next-intl";

gsap.registerPlugin(ScrollTrigger);

type StatKey = "response" | "minimum" | "transparency" | "hidden";

type StatConfig = {
  key: StatKey;
  defaultValue: number;
  defaultPrefix?: string;
  defaultSuffix?: string;
};

const statsConfig: StatConfig[] = [
  { key: "response", defaultValue: 24, defaultSuffix: "h" },
  { key: "minimum", defaultValue: 20, defaultSuffix: "€" },
  { key: "transparency", defaultValue: 100, defaultSuffix: "%" },
  { key: "hidden", defaultValue: 0, defaultSuffix: "€" },
];

export function WhyUsStats() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const statsGridRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("why-us.stats");

  const stats = statsConfig.map((config) => {
    const valueTranslation = t(`items.${config.key}.value`);
    const parsedValue = Number(valueTranslation);
    const value = Number.isFinite(parsedValue) ? parsedValue : config.defaultValue;

    const suffixTranslation = t(`items.${config.key}.suffix`);
    const suffix = suffixTranslation.includes("items.") ? config.defaultSuffix ?? "" : suffixTranslation;

    const prefixTranslation = t(`items.${config.key}.prefix`);
    const prefix = prefixTranslation.includes("items.") ? config.defaultPrefix ?? "" : prefixTranslation;

    return {
      key: config.key,
      value,
      prefix,
      suffix,
      label: t(`items.${config.key}.label`),
      description: t(`items.${config.key}.description`),
    };
  });

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header animation
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: headerRef.current,
            start: "top 80%",
          },
        }
      );

      // Stats cards animation
      const statCards = statsGridRef.current?.querySelectorAll(".stat-card");
      if (statCards) {
        gsap.fromTo(
          statCards,
          {
            opacity: 0,
            y: 60,
            scale: 0.9,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: "power3.out",
            scrollTrigger: {
              trigger: statsGridRef.current,
              start: "top 75%",
            },
          }
        );

        // Decorative circle animations
        statCards.forEach((card) => {
          const circle = card.querySelector(".stat-circle") as SVGCircleElement;
          if (circle) {
            const length = circle.getTotalLength?.() || 126;
            gsap.set(circle, { strokeDasharray: length, strokeDashoffset: length });
            ScrollTrigger.create({
              trigger: card,
              start: "top 70%",
              onEnter: () => {
                gsap.to(circle, {
                  strokeDashoffset: 0,
                  duration: 1.5,
                  ease: "sine.inOut",
                });
              },
              once: true,
            });
          }
        });
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-24 md:py-32 lg:py-40 bg-deep-black overflow-hidden"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Top decorative separator */}
      <div className="absolute top-0 left-0 right-0 z-[1] flex items-center justify-center -translate-y-1/2">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-champagne/30 to-transparent" />
        <div className="mx-4 w-2 h-2 rotate-45 border border-champagne/40 bg-background" />
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-champagne/30 to-transparent" />
      </div>

      {/* Bottom decorative separator */}
      <div className="absolute bottom-0 left-0 right-0 z-[1] flex items-center justify-center translate-y-1/2">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-champagne/30 to-transparent" />
        <div className="mx-4 w-2 h-2 rotate-45 border border-champagne/40 bg-background" />
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-champagne/30 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 md:px-12">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-16 md:mb-24">
          <span className="inline-block text-sm uppercase tracking-[0.3em] text-champagne mb-4">
            {t("eyebrow")}
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-white leading-tight">
            {t("title")}
            <br />
            <span className="text-white/50">{t("titleAccent")}</span>
          </h2>
        </div>

        {/* Stats grid */}
        <div
          ref={statsGridRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-6xl mx-auto"
        >
          {stats.map((stat, index) => (
            <div
              key={index}
              className="stat-card group relative p-8 md:p-10 text-center bg-white/[0.02] border border-white/5 rounded-sm hover:bg-white/[0.04] hover:border-champagne/20 transition-all duration-500"
            >
              {/* Decorative SVG circle */}
              <svg
                className="absolute top-4 right-4 w-12 h-12 -rotate-90"
                viewBox="0 0 50 50"
              >
                <circle
                  cx="25"
                  cy="25"
                  r="20"
                  fill="none"
                  stroke="rgba(200, 169, 106, 0.1)"
                  strokeWidth="2"
                />
                <circle
                  className="stat-circle"
                  cx="25"
                  cy="25"
                  r="20"
                  fill="none"
                  stroke="rgba(200, 169, 106, 0.5)"
                  strokeWidth="2"
                  strokeDasharray="126"
                  strokeDashoffset="126"
                  strokeLinecap="round"
                />
              </svg>

              {/* Number */}
              <div className="font-serif text-6xl md:text-7xl lg:text-8xl text-white mb-4 leading-none">
                <span className="tabular-nums">
                  {stat.prefix}
                  {stat.value}
                  {stat.suffix}
                </span>
              </div>

              {/* Label */}
              <h3 className="text-lg md:text-xl text-champagne font-medium mb-2">
                {t(`items.${stat.key}.label`)}
              </h3>

              {/* Description */}
              <p className="text-sm text-white/50 leading-relaxed">
                {t(`items.${stat.key}.description`)}
              </p>

              {/* Bottom accent line */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-champagne/50 group-hover:w-1/2 transition-all duration-500" />
            </div>
          ))}
        </div>

        {/* Additional proof point */}
        <div className="mt-16 md:mt-24 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 sm:gap-8 px-8 py-6 bg-champagne/5 border border-champagne/10 rounded-sm">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-champagne" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-white">{t("badges.estonian")}</span>
            </div>
            <div className="hidden sm:block w-[1px] h-6 bg-white/20" />
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-champagne" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-white">{t("badges.secure")}</span>
            </div>
            <div className="hidden sm:block w-[1px] h-6 bg-white/20" />
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-champagne" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-white">{t("badges.euRegulated")}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default WhyUsStats;
