"use client";

import { useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import Link from "next/link";
import { gsap } from "gsap";
import { HeroVariant } from "../types";

interface ProductHeroProps {
  translationKey: string;
  variant?: HeroVariant;
  showStats?: boolean;
}

export function ProductHero({
  translationKey,
  variant = "default",
  showStats = true,
}: ProductHeroProps) {
  const t = useTranslations(translationKey);
  const locale = useLocale();

  const heroRef = useRef<HTMLElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const scrollDotRef = useRef<HTMLDivElement>(null);

  // Get stats from translations if available
  const stats = showStats ? [
    { value: t("stats.minAmount.value"), label: t("stats.minAmount.label") },
    { value: t("stats.maxAmount.value"), label: t("stats.maxAmount.label") },
    { value: t("stats.delay.value"), label: t("stats.delay.label") },
  ] : [];

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.3 });

      gsap.set(
        [eyebrowRef.current, titleRef.current, subtitleRef.current, descriptionRef.current, ctaRef.current],
        { opacity: 0, y: 30 }
      );

      if (cardsRef.current) {
        gsap.set(cardsRef.current.children, { opacity: 0, x: 60 });
      }
      gsap.set(scrollIndicatorRef.current, { opacity: 0 });

      tl.to(eyebrowRef.current, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" });
      tl.to(titleRef.current, { opacity: 1, y: 0, duration: 1, ease: "power2.out" }, "-=0.5");
      tl.to(subtitleRef.current, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, "-=0.6");
      tl.to(descriptionRef.current, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, "-=0.5");
      tl.to(ctaRef.current, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, "-=0.5");

      if (cardsRef.current) {
        tl.to(cardsRef.current.children, {
          opacity: 1,
          x: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: "power2.out",
        }, "-=0.8");
      }

      tl.to(scrollIndicatorRef.current, { opacity: 1, duration: 0.6, ease: "power1.out" }, "-=0.3");

      gsap.to(scrollDotRef.current, {
        y: 12,
        duration: 1,
        ease: "power1.inOut",
        repeat: -1,
        yoyo: true,
        delay: 2,
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  if (variant === "centered") {
    return (
      <section ref={heroRef} className="min-h-screen relative flex flex-col justify-center overflow-hidden py-20 lg:py-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] sm:w-[800px] h-[600px] sm:h-[800px] bg-accent/5 rounded-full blur-3xl" />

        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
            <p ref={eyebrowRef} className="text-xs sm:text-sm uppercase tracking-[0.2em] sm:tracking-[0.3em] text-accent font-medium">
              {t("hero.eyebrow")}
            </p>

            <div className="space-y-3 sm:space-y-4">
              <h1 ref={titleRef} className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl leading-[0.95] tracking-tight">
                {t("hero.title")}
              </h1>
              <p ref={subtitleRef} className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-serif text-muted-foreground">
                {t("hero.subtitle")}
              </p>
            </div>

            <p ref={descriptionRef} className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-4 sm:px-0">
              {t("hero.description")}
            </p>

            <Link
              ref={ctaRef}
              href={`/${locale}/tools/simulator`}
              className="inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-foreground text-background rounded-full text-sm sm:text-base font-medium hover:bg-accent hover:text-white transition-colors duration-300"
            >
              {t("hero.cta")}
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>

            {showStats && stats.length > 0 && (
              <div ref={cardsRef} className="flex flex-wrap justify-center gap-4 sm:gap-8 pt-8 sm:pt-12">
                {stats.map((stat, i) => (
                  <div key={i} className="text-center min-w-[80px]">
                    <p className="text-2xl sm:text-3xl md:text-4xl font-serif text-accent">{stat.value}</p>
                    <p className="text-xs sm:text-sm uppercase tracking-wider text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div ref={scrollIndicatorRef} className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden sm:block">
          <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
            <div ref={scrollDotRef} className="w-1 h-2 bg-muted-foreground/50 rounded-full" />
          </div>
        </div>
      </section>
    );
  }

  // Default variant
  return (
    <section ref={heroRef} className="min-h-screen relative flex flex-col justify-center overflow-hidden py-20 lg:py-0">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-accent/5 -skew-x-12 translate-x-1/4" />

      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div className="space-y-6 lg:space-y-8">
            <p ref={eyebrowRef} className="text-xs sm:text-sm uppercase tracking-[0.2em] sm:tracking-[0.3em] text-accent font-medium">
              {t("hero.eyebrow")}
            </p>

            <div className="space-y-3 lg:space-y-4">
              <h1 ref={titleRef} className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl leading-[0.95] tracking-tight">
                {t("hero.title")}
              </h1>
              <p ref={subtitleRef} className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif text-muted-foreground">
                {t("hero.subtitle")}
              </p>
            </div>

            <p ref={descriptionRef} className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-md">
              {t("hero.description")}
            </p>

            <Link
              ref={ctaRef}
              href={`/${locale}/tools/simulator`}
              className="inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-foreground text-background rounded-full text-sm sm:text-base font-medium hover:bg-accent hover:text-white transition-colors duration-300"
            >
              {t("hero.cta")}
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {showStats && stats.length > 0 && (
            <div className="relative mt-8 lg:mt-0">
              <div ref={cardsRef} className="space-y-3 sm:space-y-4">
                {stats.map((stat, i) => (
                  <div
                    key={i}
                    className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl border ${
                      i === 0
                        ? "bg-foreground text-background border-foreground ml-0 lg:ml-12"
                        : i === 1
                        ? "bg-accent/10 border-accent/20 ml-2 sm:ml-4 lg:ml-20"
                        : "bg-background border-border ml-4 sm:ml-8 lg:ml-8"
                    }`}
                  >
                    <p className={`text-3xl sm:text-4xl md:text-5xl font-serif mb-1 sm:mb-2 ${i === 0 ? "text-background" : ""}`}>
                      {stat.value}
                    </p>
                    <p className={`text-xs sm:text-sm uppercase tracking-wider ${
                      i === 0 ? "text-background/60" : "text-muted-foreground"
                    }`}>
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div ref={scrollIndicatorRef} className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden sm:block">
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
          <div ref={scrollDotRef} className="w-1 h-2 bg-muted-foreground/50 rounded-full" />
        </div>
      </div>
    </section>
  );
}
