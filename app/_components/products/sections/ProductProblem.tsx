"use client";

import { useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface ProductProblemProps {
  translationKey: string;
  darkBackground?: boolean;
}

export function ProductProblem({
  translationKey,
  darkBackground = true,
}: ProductProblemProps) {
  const t = useTranslations(translationKey);

  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLDivElement>(null);

  const rawItems = t.raw("problem.items");
  const problemItems = Array.isArray(rawItems) ? rawItems as Array<{ number: string; text: string }> : [];

  useEffect(() => {
    if (!headerRef.current || !itemsRef.current) return;

    const ctx = gsap.context(() => {
      gsap.set(headerRef.current, { opacity: 0, y: 30 });
      gsap.set(itemsRef.current!.children, { opacity: 0, y: 40 });

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 70%",
        onEnter: () => {
          gsap.to(headerRef.current, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
          });
          gsap.to(itemsRef.current!.children, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: "power2.out",
            delay: 0.3,
          });
        },
        once: true,
      });
    });

    return () => ctx.revert();
  }, []);

  const bgClass = darkBackground
    ? "bg-deep-black text-white"
    : "bg-secondary/30";

  const textClass = darkBackground ? "text-white/70" : "text-muted-foreground";

  return (
    <section ref={sectionRef} className={`py-32 overflow-hidden ${bgClass}`}>
      <div className="container">
        <div ref={headerRef} className="mb-20">
          <p className="text-sm uppercase tracking-[0.3em] text-accent mb-4">
            {t("problem.eyebrow")}
          </p>
          <h2 className="font-serif text-5xl md:text-6xl lg:text-7xl max-w-4xl">
            {t("problem.title")}
          </h2>
        </div>

        <div ref={itemsRef} className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {problemItems.map((item, i) => (
            <div key={i}>
              <p className="font-serif text-6xl md:text-7xl lg:text-8xl text-accent mb-4">
                {item.number}
              </p>
              <p className={`text-lg max-w-xs ${textClass}`}>
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
