"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslations } from "next-intl";
import { Section } from "@/_components/layout/section";
import { Counter } from "@/_components/animations/counter";

gsap.registerPlugin(ScrollTrigger);

export function Stats() {
  const t = useTranslations("home");
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLDivElement[]>([]);

  const stats = [
    { value: 24, suffix: "h", label: t("stats.items.response.label") },
    { value: 20, prefix: "", suffix: "€", label: t("stats.items.minimum.label") },
    { value: 100, suffix: "%", label: t("stats.items.transparency.label") },
    { value: 0, prefix: "", suffix: "€", label: t("stats.items.hiddenFees.label") },
  ];

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        itemsRef.current,
        { opacity: 0, y: 60 },
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
    <Section theme="light" size="lg">
      <div ref={containerRef} className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
        {stats.map((stat, i) => (
          <div
            key={i}
            ref={(el) => {
              if (el) itemsRef.current[i] = el;
            }}
            className="text-center"
          >
            <div className="font-serif text-6xl md:text-7xl lg:text-8xl text-foreground mb-2">
              <Counter
                value={stat.value}
                prefix={stat.prefix}
                suffix={stat.suffix}
                duration={2}
                delay={i * 0.1}
              />
            </div>
            <p className="text-sm md:text-base text-muted-foreground uppercase tracking-wider">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}

export default Stats;
