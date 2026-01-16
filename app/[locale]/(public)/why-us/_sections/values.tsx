"use client";

import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const values = [
  {
    id: "transparency",
    title: "Transparence",
    subtitle: "On dit tout, même ce qui dérange",
    description: "Si on refuse, on explique pourquoi. Si on accepte, on détaille les conditions. Pas de frais cachés, pas de surprises. Vous savez exactement où vous en êtes.",
    example: "Explication systématique des décisions",
    gradient: "from-blue-900/20 to-transparent", // Subtle background hint
  },
  {
    id: "speed",
    title: "Rapidité",
    subtitle: "24h = 24h, ou moins",
    description: "Les promesses sont tenues. Réponse en 24-48h maximum. Argent versé quasi-instantanément après acceptation. Votre temps est précieux, on le respecte.",
    example: "Versement immédiat après validation",
    gradient: "from-amber-900/20 to-transparent",
  },
  {
    id: "respect",
    title: "Respect",
    subtitle: "Du client, de nous-mêmes, de nos engagements",
    description: "On accompagne même ceux qu'on refuse. Vous n'êtes pas un numéro de dossier. Chaque demande mérite attention et considération.",
    example: "Accompagnement personnalisé",
    gradient: "from-emerald-900/20 to-transparent",
  },
  {
    id: "pragmatism",
    title: "Pragmatisme",
    subtitle: "Business first, pas de naïveté",
    description: "On est là pour vous aider, mais on reste réalistes. Des conditions claires, des engagements tenus. Un partenariat gagnant-gagnant.",
    example: "Conditions réalistes et tenables",
    gradient: "from-slate-900/20 to-transparent",
  },
];

export function WhyUsValues() {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const valuesContainerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

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

      const totalWidth = (valueCards.length - 1) * 100;

      // Pin and horizontal scroll
      const scrollTween = gsap.to(valuesContainerRef.current, {
        xPercent: -totalWidth,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: () => `+=${window.innerHeight * values.length}`,
          pin: true,
          scrub: 1,
          onUpdate: (self) => {
            const newIndex = Math.round(self.progress * (values.length - 1));
            setActiveIndex(newIndex);
          },
        },
      });

      // Individual card animations
      valueCards.forEach((card) => {
        const content = card.querySelector(".value-content");
        const icon = card.querySelector(".value-icon");
        const decorLines = card.querySelectorAll(".decor-line");

        // Content reveal animation
        gsap.fromTo(
          content,
          { opacity: 0, x: 50 },
          {
            opacity: 1,
            x: 0,
            duration: 0.5,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              containerAnimation: scrollTween,
              start: "left 70%",
              end: "left 30%",
              scrub: 0.5,
            },
          }
        );

        // Icon animation
        ScrollTrigger.create({
          trigger: card,
          containerAnimation: scrollTween,
          start: "left center",
          onEnter: () => {
            gsap.fromTo(
              icon,
              { scale: 0.5, rotation: -10, opacity: 0 },
              {
                scale: 1,
                rotation: 0,
                opacity: 1,
                duration: 0.8,
                ease: "elastic.out(1, 0.5)",
              }
            );

            gsap.fromTo(
              decorLines,
              { scaleX: 0, opacity: 0 },
              {
                scaleX: 1,
                opacity: 1,
                duration: 0.6,
                stagger: 0.1,
                ease: "expo.out",
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
      className="relative min-h-screen bg-background overflow-hidden"
    >
      {/* Header - Fixed during scroll */}
      <div className="absolute top-0 left-0 right-0 z-20 pt-12 pb-8 px-6 md:px-12 bg-gradient-to-b from-background via-background/90 to-transparent backdrop-blur-[2px]">
        <div ref={headerRef} className="max-w-7xl mx-auto">
          <span className="text-sm uppercase tracking-[0.3em] text-champagne mb-4 block font-medium">
            Nos valeurs
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-light text-foreground">
            4 piliers, 0 compromis
          </h2>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="fixed top-1/2 right-8 -translate-y-1/2 z-30 hidden lg:flex flex-col gap-3">
        {values.map((value, index) => (
          <button
            key={value.id}
            className={`w-3 h-3 rounded-full transition-all duration-500 border border-champagne/20 ${
              activeIndex === index
                ? "bg-champagne scale-125"
                : "bg-transparent hover:bg-champagne/20"
            }`}
            aria-label={`Go to ${value.title}`}
          />
        ))}
      </div>

      {/* Horizontal scroll container */}
      <div ref={containerRef} className="h-screen flex items-center pt-24 md:pt-32">
        <div
          ref={valuesContainerRef}
          className="flex"
          style={{ width: `${values.length * 100}vw` }}
        >
          {values.map((value, index) => (
            <div
              key={value.id}
              className="value-card relative w-screen h-screen flex items-center justify-center px-6 md:px-12 lg:px-20"
            >
              {/* Abstract Background for this value */}
              <div className={`absolute inset-0 z-0 bg-gradient-to-br ${value.gradient}`} />
              
              {/* Geometric Decoration */}
              <div className="absolute right-0 bottom-0 opacity-[0.03] pointer-events-none">
                 <svg width="600" height="600" viewBox="0 0 600 600" fill="currentColor" className="text-foreground">
                    <circle cx="400" cy="400" r="300" />
                 </svg>
              </div>

              {/* Content */}
              <div className="value-content relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center max-w-6xl mx-auto w-full">
                {/* Left: Icon and number */}
                <div className="flex flex-col items-center lg:items-center justify-center order-2 lg:order-1">
                  <div className="value-icon relative mb-8">
                    {/* Large number */}
                    <span className="font-serif text-[10rem] md:text-[14rem] lg:text-[18rem] font-light text-foreground/[0.03] leading-none select-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      {index + 1}
                    </span>
                    {/* Icon Container */}
                    <div className="relative z-10 w-32 h-32 md:w-40 md:h-40 rounded-full border border-champagne/30 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-champagne/10 flex items-center justify-center shadow-inner">
                          <ValueIcon id={value.id} />
                        </div>
                        {/* Orbiting dot */}
                        <div className="absolute inset-0 animate-spin-slow">
                           <div className="w-2 h-2 bg-champagne rounded-full absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        </div>
                    </div>
                  </div>
                </div>

                {/* Right: Text content */}
                <div className="text-center lg:text-left order-1 lg:order-2">
                  {/* Decorative lines */}
                  <div className="flex items-center gap-4 mb-8 justify-center lg:justify-start">
                    <div className="decor-line w-8 h-[1px] bg-champagne origin-left" />
                    <span className="text-xs uppercase tracking-[0.2em] text-champagne font-medium">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="decor-line w-8 h-[1px] bg-champagne origin-left" />
                  </div>

                  <h3 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-foreground mb-6">
                    {value.title}
                  </h3>
                  <p className="text-lg md:text-xl lg:text-2xl text-champagne italic mb-8 font-serif">
                    {value.subtitle}
                  </p>
                  <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-10 max-w-lg mx-auto lg:mx-0">
                    {value.description}
                  </p>

                  {/* Example badge */}
                  <div className="inline-flex items-center gap-3 px-5 py-3 bg-champagne/5 border border-champagne/10 rounded-full">
                    <svg className="w-5 h-5 text-champagne flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-sm font-medium text-foreground/80">{value.example}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile progress dots */}
      <div className="lg:hidden fixed bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2 p-2 bg-background/50 backdrop-blur-md rounded-full border border-white/10">
        {values.map((value, index) => (
          <div
            key={value.id}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              activeIndex === index ? "bg-champagne w-6" : "bg-foreground/20"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

function ValueIcon({ id }: { id: string }) {
  const icons: Record<string, JSX.Element> = {
    transparency: (
      <svg className="w-10 h-10 text-champagne" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4M12 8h.01" strokeLinecap="round" />
      </svg>
    ),
    speed: (
      <svg className="w-10 h-10 text-champagne" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinejoin="round" />
      </svg>
    ),
    respect: (
      <svg className="w-10 h-10 text-champagne" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    pragmatism: (
      <svg className="w-10 h-10 text-champagne" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
  };

  return icons[id] || null;
}

export default WhyUsValues;