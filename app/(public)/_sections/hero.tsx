"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { HeroOrb } from "@/_components/three/hero-orb";
import Magnetic from "@/_components/ui/magnetic-button";
import { cn } from "@/_lib/utils";

export function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  const line1Ref = useRef<HTMLDivElement>(null);
  const line2Ref = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const line1CharsRef = useRef<HTMLSpanElement[]>([]);
  const line2CharsRef = useRef<HTMLSpanElement[]>([]);

  useEffect(() => {
    // Wait for preloader to finish (approx 3.5s)
    const startDelay = 3.5;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: startDelay });

      // Line 1 chars reveal
      tl.fromTo(
        line1CharsRef.current,
        {
          y: 120,
          rotateX: -90,
          opacity: 0,
        },
        {
          y: 0,
          rotateX: 0,
          opacity: 1,
          duration: 1.2,
          stagger: 0.03,
          ease: "power4.out",
        }
      );

      // Line 2 chars reveal
      tl.fromTo(
        line2CharsRef.current,
        {
          y: 120,
          rotateX: -90,
          opacity: 0,
        },
        {
          y: 0,
          rotateX: 0,
          opacity: 1,
          duration: 1.2,
          stagger: 0.03,
          ease: "power4.out",
        },
        "-=0.9"
      );

      // Subtitle fade up
      tl.fromTo(
        subtitleRef.current,
        {
          y: 40,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
        },
        "-=0.6"
      );

      // CTA scale in
      tl.fromTo(
        ctaRef.current,
        {
          scale: 0.8,
          opacity: 0,
        },
        {
          scale: 1,
          opacity: 1,
          duration: 0.8,
          ease: "back.out(1.7)",
        },
        "-=0.5"
      );

      // Scroll indicator fade in + loop
      tl.fromTo(
        scrollIndicatorRef.current,
        {
          opacity: 0,
          y: -10,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
        },
        "-=0.3"
      );

      // Scroll indicator bounce loop
      gsap.to(scrollIndicatorRef.current, {
        y: 8,
        duration: 1.5,
        ease: "power1.inOut",
        repeat: -1,
        yoyo: true,
        delay: startDelay + 2,
      });
    });

    return () => ctx.revert();
  }, []);

  const line1 = "CRÉDIT";
  const line2 = "ACCESSIBLE";

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen w-full overflow-hidden bg-background flex items-center justify-center"
    >
      {/* 3D Orb Background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <HeroOrb className="w-[600px] h-[600px] md:w-[800px] md:h-[800px] lg:w-[1000px] lg:h-[1000px] opacity-60" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 md:px-8 text-center">
        {/* Main Title */}
        <div className="mb-6">
          {/* Line 1 */}
          <div ref={line1Ref} className="overflow-hidden mb-2">
            <h1 className="flex justify-center perspective-1000">
              {line1.split("").map((char, i) => (
                <span
                  key={i}
                  ref={(el) => {
                    if (el) line1CharsRef.current[i] = el;
                  }}
                  className={cn(
                    "inline-block font-serif text-7xl md:text-9xl lg:text-[12rem] font-medium tracking-tight",
                    char === " " ? "w-4 md:w-8" : ""
                  )}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {char === " " ? "\u00A0" : char}
                </span>
              ))}
            </h1>
          </div>

          {/* Line 2 */}
          <div ref={line2Ref} className="overflow-hidden">
            <h1 className="flex justify-center perspective-1000">
              {line2.split("").map((char, i) => (
                <span
                  key={i}
                  ref={(el) => {
                    if (el) line2CharsRef.current[i] = el;
                  }}
                  className={cn(
                    "inline-block font-serif text-5xl md:text-7xl lg:text-8xl font-medium tracking-tight text-accent",
                    char === " " ? "w-4 md:w-8" : ""
                  )}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {char === " " ? "\u00A0" : char}
                </span>
              ))}
            </h1>
          </div>
        </div>

        {/* Subtitle */}
        <p
          ref={subtitleRef}
          className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10 opacity-0"
        >
          De 20€ à 10 000€. Réponse en 24h.
          <br />
          <span className="text-foreground font-medium">On vous dit pourquoi.</span>
        </p>

        {/* CTA */}
        <div ref={ctaRef} className="opacity-0">
          <Magnetic>
            <button className="group relative px-8 py-4 bg-foreground text-background rounded-full font-medium text-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-accent/20">
              <span className="relative z-10 flex items-center gap-2">
                Simuler mon crédit
                <svg
                  className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
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
              <span className="absolute inset-0 bg-accent transform scale-x-0 origin-left transition-transform duration-500 group-hover:scale-x-100" />
            </button>
          </Magnetic>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div
        ref={scrollIndicatorRef}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-0"
      >
        <span className="text-xs tracking-[0.3em] uppercase text-muted-foreground">
          Scroll
        </span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-foreground/50 to-transparent" />
      </div>

      {/* Corner decoration */}
      <div className="absolute top-8 left-8 md:top-12 md:left-12 text-xs tracking-wider text-muted-foreground">
        <span className="opacity-50">01</span>
        <span className="mx-2 opacity-30">/</span>
        <span className="opacity-30">09</span>
      </div>
    </section>
  );
}

export default Hero;
