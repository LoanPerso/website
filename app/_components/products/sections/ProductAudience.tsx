"use client";

import { useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AudienceVariant } from "../types";

gsap.registerPlugin(ScrollTrigger);

interface ProductAudienceProps {
  translationKey: string;
  variant?: AudienceVariant;
}

export function ProductAudience({
  translationKey,
  variant = "offset",
}: ProductAudienceProps) {
  const t = useTranslations(translationKey);

  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const rawProfiles = t.raw("audience.profiles");
  const profiles = Array.isArray(rawProfiles) ? rawProfiles as Array<{ title: string; description: string }> : [];

  useEffect(() => {
    if (!headerRef.current || !cardsRef.current) return;

    const ctx = gsap.context(() => {
      gsap.set(headerRef.current, { opacity: 0, y: 20 });
      const cards = cardsRef.current!.children;
      Array.from(cards).forEach((card, i) => {
        gsap.set(card, { opacity: 0, x: i % 2 === 0 ? -60 : 60 });
      });

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 40%",
        onEnter: () => {
          gsap.to(headerRef.current, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
          });
          Array.from(cards).forEach((card, i) => {
            gsap.to(card, {
              opacity: 1,
              x: 0,
              duration: 0.8,
              delay: 0.3 + i * 0.15,
              ease: "power2.out",
            });
          });
        },
        once: true,
      });
    });

    return () => ctx.revert();
  }, []);

  const renderOffsetGrid = () => (
    <div ref={cardsRef} className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
      {profiles.map((profile, i) => (
        <div
          key={i}
          className={`p-8 rounded-2xl bg-background border border-border ${
            i % 2 === 1 ? "md:translate-y-12" : ""
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-6">
            <span className="text-accent font-serif text-xl">{i + 1}</span>
          </div>
          <h3 className="font-serif text-2xl mb-3">{profile.title}</h3>
          <p className="text-muted-foreground">{profile.description}</p>
        </div>
      ))}
    </div>
  );

  const renderGrid = () => (
    <div ref={cardsRef} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
      {profiles.map((profile, i) => (
        <div
          key={i}
          className="p-6 rounded-2xl bg-background border border-border text-center"
        >
          <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4 mx-auto">
            <span className="text-accent font-serif text-xl">{i + 1}</span>
          </div>
          <h3 className="font-serif text-xl mb-2">{profile.title}</h3>
          <p className="text-sm text-muted-foreground">{profile.description}</p>
        </div>
      ))}
    </div>
  );

  const renderCentered = () => (
    <div ref={cardsRef} className="max-w-3xl mx-auto space-y-6">
      {profiles.map((profile, i) => (
        <div
          key={i}
          className="flex items-start gap-6 p-6 rounded-2xl bg-background border border-border"
        >
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
            <span className="text-accent font-serif text-xl">{i + 1}</span>
          </div>
          <div>
            <h3 className="font-serif text-xl mb-2">{profile.title}</h3>
            <p className="text-muted-foreground">{profile.description}</p>
          </div>
        </div>
      ))}
    </div>
  );

  const renderContent = () => {
    switch (variant) {
      case "grid":
        return renderGrid();
      case "centered":
        return renderCentered();
      case "offset":
      default:
        return renderOffsetGrid();
    }
  };

  return (
    <section ref={sectionRef} className="py-32 bg-secondary/30 overflow-hidden">
      <div className="container">
        <div ref={headerRef} className="text-center mb-20">
          <p className="text-sm uppercase tracking-[0.3em] text-accent mb-4">
            {t("audience.eyebrow")}
          </p>
          <h2 className="font-serif text-5xl md:text-6xl lg:text-7xl">
            {t("audience.title")}
          </h2>
        </div>

        {renderContent()}
      </div>
    </section>
  );
}
