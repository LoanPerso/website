"use client";

import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslations } from "next-intl";
import { Section } from "@/_components/layout/section";

gsap.registerPlugin(ScrollTrigger);

export function FeaturesGrid() {
  const t = useTranslations("home");
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLDivElement[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const features = [
    {
      title: t("features.items.transparency.title"),
      description: t("features.items.transparency.description"),
    },
    {
      title: t("features.items.atypical.title"),
      description: t("features.items.atypical.description"),
    },
    {
      title: t("features.items.coaching.title"),
      description: t("features.items.coaching.description"),
    },
    {
      title: t("features.items.flexibility.title"),
      description: t("features.items.flexibility.description"),
    },
  ];

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        itemsRef.current,
        { opacity: 0, y: 80 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 75%",
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <Section theme="dark" size="xl">
      <div className="text-center mb-16">
        <p className="text-sm uppercase tracking-[0.3em] text-accent mb-4">
          {t("features.eyebrow")}
        </p>
        <h2 className="font-serif text-4xl md:text-6xl text-white">
          {t("features.title.line1")}
          <br />
          <span className="text-accent">{t("features.title.line2")}</span>
        </h2>
      </div>

      <div
        ref={containerRef}
        className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto"
      >
        {features.map((feature, i) => (
          <div
            key={i}
            ref={(el) => {
              if (el) itemsRef.current[i] = el;
            }}
            className="group relative p-8 md:p-12 border border-white/10 rounded-lg overflow-hidden cursor-pointer transition-colors duration-500 hover:border-accent/50"
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent transition-opacity duration-500 ${
                hoveredIndex === i ? "opacity-100" : "opacity-0"
              }`}
            />

            <div className="relative z-10">
              <span className="text-accent text-sm tracking-wider mb-4 block">
                0{i + 1}
              </span>
              <h3 className="font-serif text-2xl md:text-3xl text-white mb-4 transition-transform duration-300 group-hover:translate-x-2">
                {feature.title}
              </h3>
              <p className="text-white/60 text-lg leading-relaxed">
                {feature.description}
              </p>

              <div
                className={`mt-6 flex items-center gap-2 text-accent transition-all duration-300 ${
                  hoveredIndex === i
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-4"
                }`}
              >
                <span className="text-sm uppercase tracking-wider">{t("features.learnMore")}</span>
                <svg
                  className="w-4 h-4"
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
              </div>
            </div>

            <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden">
              <div
                className={`absolute top-0 right-0 w-[1px] h-20 bg-accent origin-top transition-transform duration-500 ${
                  hoveredIndex === i ? "scale-y-100" : "scale-y-0"
                }`}
              />
              <div
                className={`absolute top-0 right-0 w-20 h-[1px] bg-accent origin-right transition-transform duration-500 delay-100 ${
                  hoveredIndex === i ? "scale-x-100" : "scale-x-0"
                }`}
              />
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

export default FeaturesGrid;
