"use client";

import { useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useLocale } from "next-intl";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function MicroCreditPage() {
  const t = useTranslations("products.microCredit");
  const locale = useLocale();

  // Hero refs
  const heroRef = useRef<HTMLElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const scrollDotRef = useRef<HTMLDivElement>(null);

  // Problem section refs
  const problemSectionRef = useRef<HTMLElement>(null);
  const problemHeaderRef = useRef<HTMLDivElement>(null);
  const problemItemsRef = useRef<HTMLDivElement>(null);

  // Audience section refs
  const audienceSectionRef = useRef<HTMLElement>(null);
  const audienceHeaderRef = useRef<HTMLDivElement>(null);
  const audienceCardsRef = useRef<HTMLDivElement>(null);

  // Process section refs
  const processSectionRef = useRef<HTMLElement>(null);
  const processHeaderRef = useRef<HTMLDivElement>(null);
  const processStepsRef = useRef<HTMLDivElement>(null);

  const stats = [
    { value: t("stats.minAmount.value"), label: t("stats.minAmount.label") },
    { value: t("stats.maxAmount.value"), label: t("stats.maxAmount.label") },
    { value: t("stats.delay.value"), label: t("stats.delay.label") },
  ];

  const problemItems = t.raw("problem.items") as Array<{ number: string; text: string }>;
  const solutionFeatures = t.raw("solution.features") as Array<{ title: string; description: string }>;
  const audienceProfiles = t.raw("audience.profiles") as Array<{ title: string; description: string }>;
  const processSteps = t.raw("process.steps") as Array<{ number: string; title: string; description: string }>;

  // Hero animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.3 });

      // Set initial states
      gsap.set([eyebrowRef.current, titleRef.current, subtitleRef.current, descriptionRef.current, ctaRef.current], {
        opacity: 0,
        y: 30,
      });

      if (cardsRef.current) {
        const cards = cardsRef.current.children;
        gsap.set(cards, { opacity: 0, x: 60 });
      }

      gsap.set(scrollIndicatorRef.current, { opacity: 0 });

      // Animate text elements with stagger
      tl.to(eyebrowRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
      });

      tl.to(titleRef.current, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power2.out",
      }, "-=0.5");

      tl.to(subtitleRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
      }, "-=0.6");

      tl.to(descriptionRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
      }, "-=0.5");

      tl.to(ctaRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
      }, "-=0.5");

      // Animate cards sliding in from right with stagger
      if (cardsRef.current) {
        const cards = cardsRef.current.children;
        tl.to(cards, {
          opacity: 1,
          x: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: "power2.out",
        }, "-=0.8");
      }

      // Scroll indicator fade in
      tl.to(scrollIndicatorRef.current, {
        opacity: 1,
        duration: 0.6,
        ease: "power1.out",
      }, "-=0.3");

      // Scroll dot bounce animation (looping)
      gsap.to(scrollDotRef.current, {
        y: 12,
        duration: 1,
        ease: "power1.inOut",
        repeat: -1,
        yoyo: true,
        delay: 2,
      });

      // Problem section animations
      if (problemHeaderRef.current && problemItemsRef.current) {
        gsap.set(problemHeaderRef.current, { opacity: 0, y: 30 });
        gsap.set(problemItemsRef.current.children, { opacity: 0, y: 40 });

        ScrollTrigger.create({
          trigger: problemSectionRef.current,
          start: "top 70%",
          onEnter: () => {
            gsap.to(problemHeaderRef.current, {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: "power2.out",
            });
            gsap.to(problemItemsRef.current!.children, {
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
      }

      // Audience section animations
      if (audienceHeaderRef.current && audienceCardsRef.current) {
        // Initial states - header fade, cards slide from left/right
        gsap.set(audienceHeaderRef.current, { opacity: 0, y: 20 });
        const cards = audienceCardsRef.current.children;
        Array.from(cards).forEach((card, i) => {
          // Even index = slide from left, odd = slide from right
          gsap.set(card, { opacity: 0, x: i % 2 === 0 ? -60 : 60 });
        });

        ScrollTrigger.create({
          trigger: audienceSectionRef.current,
          start: "top 40%",
          onEnter: () => {
            // Fade in header
            gsap.to(audienceHeaderRef.current, {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: "power2.out",
            });
            // Slide in cards with stagger
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
      }

      // Process section animations
      if (processHeaderRef.current && processStepsRef.current) {
        gsap.set(processHeaderRef.current, { opacity: 0, y: 20 });
        gsap.set(processStepsRef.current.children, { opacity: 0, y: 40 });

        ScrollTrigger.create({
          trigger: processSectionRef.current,
          start: "top 40%",
          onEnter: () => {
            // Fade in header
            gsap.to(processHeaderRef.current, {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: "power2.out",
            });
            // Steps appear one by one
            gsap.to(processStepsRef.current!.children, {
              opacity: 1,
              y: 0,
              duration: 0.6,
              stagger: 0.25,
              ease: "power2.out",
              delay: 0.4,
            });
          },
          once: true,
        });
      }

    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="bg-background text-foreground">
      {/* Hero - Immersive full screen */}
      <section ref={heroRef} className="min-h-screen relative flex flex-col justify-center overflow-hidden">
        {/* Background accent */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-accent/5 -skew-x-12 translate-x-1/4" />

        <div className="container relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left - Content */}
            <div className="space-y-8">
              <p
                ref={eyebrowRef}
                className="text-sm uppercase tracking-[0.3em] text-accent font-medium"
              >
                {t("hero.eyebrow")}
              </p>

              <div className="space-y-4">
                <h1
                  ref={titleRef}
                  className="font-serif text-7xl md:text-8xl lg:text-9xl leading-[0.9] tracking-tight"
                >
                  {t("hero.title")}
                </h1>
                <p
                  ref={subtitleRef}
                  className="text-3xl md:text-4xl lg:text-5xl font-serif text-muted-foreground"
                >
                  {t("hero.subtitle")}
                </p>
              </div>

              <p
                ref={descriptionRef}
                className="text-xl text-muted-foreground max-w-md"
              >
                {t("hero.description")}
              </p>

              <Link
                ref={ctaRef}
                href={`/${locale}/simulateur`}
                className="inline-flex items-center gap-3 px-8 py-4 bg-foreground text-background rounded-full text-base font-medium hover:bg-accent hover:text-white transition-colors duration-300"
              >
                {t("hero.cta")}
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            {/* Right - Stats cards stacked */}
            <div className="relative">
              <div ref={cardsRef} className="space-y-4">
                {stats.map((stat, i) => (
                  <div
                    key={i}
                    className={`p-6 rounded-2xl border ${
                      i === 0
                        ? "bg-foreground text-background border-foreground ml-0 lg:ml-12"
                        : i === 1
                        ? "bg-accent/10 border-accent/20 ml-4 lg:ml-20"
                        : "bg-background border-border ml-8 lg:ml-8"
                    }`}
                  >
                    <p className={`text-4xl md:text-5xl font-serif mb-2 ${i === 0 ? "text-background" : ""}`}>
                      {stat.value}
                    </p>
                    <p className={`text-sm uppercase tracking-wider ${
                      i === 0 ? "text-background/60" : "text-muted-foreground"
                    }`}>
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div ref={scrollIndicatorRef} className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
            <div ref={scrollDotRef} className="w-1 h-2 bg-muted-foreground/50 rounded-full" />
          </div>
        </div>
      </section>

      {/* Problem Section - Horizontal layout with big numbers */}
      <section ref={problemSectionRef} className="py-32 bg-deep-black text-white overflow-hidden">
        <div className="container">
          <div ref={problemHeaderRef} className="mb-20">
            <p className="text-sm uppercase tracking-[0.3em] text-accent mb-4">
              {t("problem.eyebrow")}
            </p>
            <h2 className="font-serif text-5xl md:text-6xl lg:text-7xl max-w-4xl">
              {t("problem.title")}
            </h2>
          </div>

          {/* Horizontal scroll-like layout */}
          <div ref={problemItemsRef} className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {problemItems.map((item, i) => (
              <div key={i}>
                <p className="font-serif text-6xl md:text-7xl lg:text-8xl text-accent mb-4">
                  {item.number}
                </p>
                <p className="text-lg text-white/70 max-w-xs">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section - Sticky left, bento grid right */}
      <section className="py-32">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Left - Sticky header */}
            <div className="lg:sticky lg:top-32 lg:self-start space-y-6">
              <p className="text-sm uppercase tracking-[0.3em] text-accent">
                {t("solution.eyebrow")}
              </p>
              <h2 className="font-serif text-5xl md:text-6xl leading-[1.1]">
                {t("solution.title")}
              </h2>
              <p className="text-xl text-muted-foreground max-w-md">
                {t("solution.description")}
              </p>
            </div>

            {/* Right - Bento grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {solutionFeatures.map((feature, i) => {
                // Bento: only col-span for width, height = auto (content)
                const bentoConfig: Record<number, { col: string; style: string }> = {
                  0: { col: "sm:col-span-2", style: "bg-accent/10 border-accent/20" },
                  1: { col: "", style: "bg-background border-border hover:border-accent/30" },
                  2: { col: "", style: "bg-foreground text-background border-foreground" },
                  3: { col: "sm:col-span-2", style: "bg-background border-border hover:border-accent/30" },
                  4: { col: "sm:col-span-2", style: "bg-deep-black text-white border-deep-black" },
                  5: { col: "", style: "bg-accent text-white border-accent" },
                  6: { col: "", style: "bg-background border-border hover:border-accent/30" },
                  7: { col: "sm:col-span-2", style: "bg-secondary/50 border-border hover:border-accent/30" },
                };

                const config = bentoConfig[i] || { col: "", style: "bg-background border-border" };
                const isDark = i === 2 || i === 4;
                const isAccent = i === 5;
                const isWide = i === 0 || i === 3 || i === 4 || i === 7;

                return (
                  <div
                    key={i}
                    className={`${config.col} p-5 lg:p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1 ${config.style}`}
                  >
                    <h3 className={`font-serif mb-2 ${
                      isWide ? "text-xl lg:text-2xl" : "text-lg lg:text-xl"
                    } ${
                      isDark ? "text-background" :
                      isAccent ? "text-white" : ""
                    }`}>
                      {feature.title}
                    </h3>
                    <p className={`text-sm lg:text-base leading-relaxed ${
                      isDark ? "text-background/70" :
                      isAccent ? "text-white/70" :
                      "text-muted-foreground"
                    }`}>
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Audience Section - Creative offset cards */}
      <section ref={audienceSectionRef} className="py-32 bg-secondary/30 overflow-hidden">
        <div className="container">
          <div ref={audienceHeaderRef} className="text-center mb-20">
            <p className="text-sm uppercase tracking-[0.3em] text-accent mb-4">
              {t("audience.eyebrow")}
            </p>
            <h2 className="font-serif text-5xl md:text-6xl lg:text-7xl">
              {t("audience.title")}
            </h2>
          </div>

          {/* Offset grid */}
          <div ref={audienceCardsRef} className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {audienceProfiles.map((profile, i) => (
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
        </div>
      </section>

      {/* Process Section - Large stepped numbers */}
      <section ref={processSectionRef} className="py-32">
        <div className="container">
          <div ref={processHeaderRef} className="text-center mb-20">
            <p className="text-sm uppercase tracking-[0.3em] text-accent mb-4">
              {t("process.eyebrow")}
            </p>
            <h2 className="font-serif text-5xl md:text-6xl lg:text-7xl">
              {t("process.title")}
            </h2>
          </div>

          {/* Steps */}
          <div ref={processStepsRef} className="max-w-5xl mx-auto">
            {processSteps.map((step, i) => (
              <div
                key={i}
                className={`flex flex-col md:flex-row items-start gap-8 md:gap-16 py-12 ${
                  i !== processSteps.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <div className="flex-shrink-0">
                  <span className="font-serif text-8xl md:text-9xl text-accent/20">
                    {step.number}
                  </span>
                </div>
                <div className="flex-1 md:pt-8">
                  <h3 className="font-serif text-3xl md:text-4xl mb-4">{step.title}</h3>
                  <p className="text-xl text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA - Full bleed */}
      <section className="py-32 lg:py-48 bg-foreground text-background relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-accent/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-accent/5 rounded-full translate-x-1/2 translate-y-1/2" />

        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-serif text-5xl md:text-6xl lg:text-7xl mb-6">
              {t("finalCta.title")}
            </h2>
            <p className="text-xl text-background/60 mb-12">
              {t("finalCta.subtitle")}
            </p>

            <Link
              href={`/${locale}/simulateur`}
              className="inline-flex items-center gap-3 px-12 py-5 bg-accent text-white rounded-full text-lg font-medium hover:bg-dark-gold transition-colors duration-300"
            >
              {t("finalCta.cta")}
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>

            <p className="text-sm text-background/40 mt-8">
              {t("finalCta.reassurance")}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
