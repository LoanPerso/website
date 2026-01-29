"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslations } from "next-intl";

gsap.registerPlugin(ScrollTrigger);

const valueColors = {
  transparency: "59, 130, 246",
  speed: "245, 158, 11",
  respect: "16, 185, 129",
  pragmatism: "148, 163, 184",
};

export function WhyUsValues() {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const valuesContainerRef = useRef<HTMLDivElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const lastIndexRef = useRef(0);
  const t = useTranslations("why-us.values");

  const values = [
    { id: "transparency", color: valueColors.transparency },
    { id: "speed", color: valueColors.speed },
    { id: "respect", color: valueColors.respect },
    { id: "pragmatism", color: valueColors.pragmatism },
  ];

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

      // Horizontal scroll for values
      const valueCards = valuesContainerRef.current?.querySelectorAll(".value-card");
      if (!valueCards || valueCards.length === 0) return;

      // Calculate the correct translation percentage
      // Container is 400vw (4 cards), we need to move 300vw (3 card widths)
      // 300vw / 400vw = 75% of the container
      const totalScrollPercent = ((valueCards.length - 1) / valueCards.length) * 100;

      // Pin and horizontal scroll
      const scrollTween = gsap.to(valuesContainerRef.current, {
        xPercent: -totalScrollPercent,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: () => `+=${window.innerHeight * (values.length - 1)}`,
          pin: true,
          scrub: 0.5,
          onUpdate: (self) => {
            const progress = self.progress;
            const exactIndex = progress * (values.length - 1);
            const newIndex = Math.min(values.length - 1, Math.max(0, Math.round(exactIndex)));

            if (newIndex !== lastIndexRef.current) {
              lastIndexRef.current = newIndex;

              // Animate background color
              if (backgroundRef.current) {
                gsap.to(backgroundRef.current, {
                  background: `radial-gradient(ellipse at center, rgba(${values[newIndex].color}, 0.08) 0%, transparent 70%)`,
                  duration: 0.5,
                  ease: "power2.out",
                });
              }
            }
          },
        },
      });

      // Individual card animations
      valueCards.forEach((card) => {
        const content = card.querySelector(".value-content");
        const icon = card.querySelector(".value-icon");
        const decorLines = card.querySelectorAll(".decor-line");

        gsap.fromTo(
          content,
          { opacity: 0, x: 30 },
          {
            opacity: 1,
            x: 0,
            duration: 0.5,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              containerAnimation: scrollTween,
              start: "left 80%",
              end: "left 40%",
              scrub: 0.5,
            },
          }
        );

        ScrollTrigger.create({
          trigger: card,
          containerAnimation: scrollTween,
          start: "left 60%",
          onEnter: () => {
            gsap.fromTo(
              icon,
              { scale: 0.7, rotation: -5, opacity: 0 },
              {
                scale: 1,
                rotation: 0,
                opacity: 1,
                duration: 0.6,
                ease: "back.out(1.5)",
              }
            );

            gsap.fromTo(
              decorLines,
              { scaleX: 0, opacity: 0 },
              {
                scaleX: 1,
                opacity: 1,
                duration: 0.5,
                stagger: 0.08,
                ease: "power2.out",
              }
            );
          },
        });
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-screen bg-background overflow-hidden"
    >
      {/* Dynamic background glow */}
      <div
        ref={backgroundRef}
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, rgba(${values[0].color}, 0.08) 0%, transparent 70%)`,
        }}
      />

      {/* Header - Solid background */}
      <div className="absolute top-0 left-0 right-0 z-20 pt-8 md:pt-12 pb-8 md:pb-10 px-4 md:px-12 bg-background">
        <div ref={headerRef} className="max-w-7xl mx-auto">
          <span className="text-xs md:text-sm uppercase tracking-[0.2em] md:tracking-[0.3em] text-champagne mb-2 md:mb-4 block font-medium">
            {t("eyebrow")}
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-foreground">
            {t("title")}
          </h2>
        </div>
        {/* Subtle fade at bottom of header */}
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-b from-background to-transparent translate-y-full" />
      </div>

      {/* Horizontal scroll container */}
      <div ref={containerRef} className="h-screen flex items-center pt-32 md:pt-36 lg:pt-32">
        <div
          ref={valuesContainerRef}
          className="flex will-change-transform"
          style={{ width: `${values.length * 100}vw` }}
        >
          {values.map((value, index) => (
            <div
              key={value.id}
              className="value-card relative w-screen h-[calc(100vh-8rem)] md:h-[calc(100vh-9rem)] flex items-center justify-center px-4 md:px-8 lg:px-16"
            >
              {/* Geometric Decoration - Hidden on mobile */}
              <div className="absolute right-0 bottom-0 opacity-[0.03] pointer-events-none hidden md:block">
                <svg width="400" height="400" viewBox="0 0 600 600" fill="currentColor" className="text-foreground">
                  <circle cx="400" cy="400" r="300" />
                </svg>
              </div>

              {/* Content */}
              <div className="value-content relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-16 items-center max-w-6xl mx-auto w-full">
                {/* Left: Icon and number */}
                <div className="flex flex-col items-center justify-center order-2 lg:order-1">
                  <div className="value-icon relative">
                    {/* Large number */}
                    <span className="font-serif text-[6rem] sm:text-[8rem] md:text-[12rem] lg:text-[16rem] font-light text-foreground/[0.03] leading-none select-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      {index + 1}
                    </span>
                    {/* Icon Container */}
                    <div className="relative z-10 w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 lg:w-40 lg:h-40 rounded-full border border-champagne/30 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full bg-champagne/10 flex items-center justify-center shadow-inner">
                        <ValueIcon id={value.id} />
                      </div>
                      {/* Orbiting dot */}
                      <div className="absolute inset-0 animate-spin-slow">
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-champagne rounded-full absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Text content */}
                <div className="text-center lg:text-left order-1 lg:order-2">
                  {/* Decorative lines */}
                  <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6 lg:mb-8 justify-center lg:justify-start">
                    <div className="decor-line w-6 md:w-8 h-[1px] bg-champagne origin-left" />
                    <span className="text-xs uppercase tracking-[0.15em] md:tracking-[0.2em] text-champagne font-medium">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="decor-line w-6 md:w-8 h-[1px] bg-champagne origin-left" />
                  </div>

                  <h3 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light text-foreground mb-3 md:mb-4 lg:mb-6">
                    {t(`${value.id}.title`)}
                  </h3>
                  <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-champagne italic mb-4 md:mb-6 lg:mb-8 font-serif">
                    {t(`${value.id}.subtitle`)}
                  </p>
                  <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed mb-6 md:mb-8 lg:mb-10 max-w-lg mx-auto lg:mx-0">
                    {t(`${value.id}.description`)}
                  </p>

                  {/* Example badge */}
                  <div className="inline-flex items-center gap-2 md:gap-3 px-4 md:px-5 py-2.5 md:py-3 bg-champagne/5 border border-champagne/10 rounded-full">
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-champagne flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-xs sm:text-sm font-medium text-foreground/80">{t(`${value.id}.example`)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}

function ValueIcon({ id }: { id: string }) {
  const iconClass = "w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-champagne";

  const icons: Record<string, JSX.Element> = {
    transparency: (
      <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4M12 8h.01" strokeLinecap="round" />
      </svg>
    ),
    speed: (
      <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinejoin="round" />
      </svg>
    ),
    respect: (
      <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    pragmatism: (
      <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
  };

  return icons[id] || null;
}

export default WhyUsValues;
