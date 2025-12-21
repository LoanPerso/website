"use client";

import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import Magnetic from "@/_components/ui/magnetic-button";

export function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const cursorCircleRef = useRef<HTMLDivElement>(null);

  // Refs for animations
  const line1Ref = useRef<HTMLDivElement>(null);
  const line2Ref = useRef<HTMLDivElement>(null);
  const line3Ref = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const decorRef = useRef<HTMLDivElement>(null);
  const numbersRef = useRef<HTMLDivElement>(null);

  // Mouse follower
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };

      if (cursorCircleRef.current) {
        gsap.to(cursorCircleRef.current, {
          x: e.clientX,
          y: e.clientY,
          duration: 1.2,
          ease: "power3.out",
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Main animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 3.5 });

      // Decorative lines first
      const lines = decorRef.current?.querySelectorAll(".deco-line");
      const circles = decorRef.current?.querySelectorAll(".deco-circle");
      const arcs = decorRef.current?.querySelectorAll(".deco-arc");

      if (lines) {
        tl.fromTo(
          lines,
          { scaleX: 0 },
          { scaleX: 1, duration: 1.5, stagger: 0.1, ease: "power4.inOut" },
          0
        );
      }

      if (circles) {
        tl.fromTo(
          circles,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 1, stagger: 0.15, ease: "back.out(1.7)" },
          0.3
        );
      }

      if (arcs) {
        tl.fromTo(
          arcs,
          { strokeDashoffset: 300 },
          { strokeDashoffset: 0, duration: 2, stagger: 0.2, ease: "power3.inOut" },
          0.2
        );
      }

      // Title reveal - cinematic
      tl.fromTo(
        line1Ref.current,
        { yPercent: 120, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 1.4, ease: "power4.out" },
        0.5
      );

      tl.fromTo(
        line2Ref.current,
        { yPercent: 120, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 1.4, ease: "power4.out" },
        0.7
      );

      tl.fromTo(
        line3Ref.current,
        { yPercent: 120, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 1.4, ease: "power4.out" },
        0.9
      );

      // Numbers
      tl.fromTo(
        numbersRef.current,
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, duration: 1, ease: "power3.out" },
        1.2
      );

      // Subtitle
      tl.fromTo(
        subtitleRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
        1.4
      );

      // CTA
      tl.fromTo(
        ctaRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
        1.6
      );

      // Floating animation for circles
      if (circles) {
        gsap.to(circles, {
          y: "random(-10, 10)",
          x: "random(-5, 5)",
          duration: "random(3, 5)",
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          stagger: {
            each: 0.5,
            from: "random",
          },
        });
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen w-full overflow-hidden bg-background"
    >
      {/* Mouse follower circle */}
      <div
        ref={cursorCircleRef}
        className="fixed top-0 left-0 w-[300px] h-[300px] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0 opacity-[0.07]"
        style={{
          background: "radial-gradient(circle, hsl(var(--accent)) 0%, transparent 70%)",
        }}
      />

      {/* Decorative elements */}
      <div ref={decorRef} className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Circles */}
        <div className="deco-circle absolute top-[15%] right-[12%] w-3 h-3 rounded-full border border-accent/40" />
        <div className="deco-circle absolute top-[70%] left-[8%] w-2 h-2 rounded-full bg-accent/30" />
        <div className="deco-circle absolute bottom-[25%] right-[25%] w-4 h-4 rounded-full border border-foreground/10" />
        <div className="deco-circle absolute top-[40%] left-[85%] w-1.5 h-1.5 rounded-full bg-foreground/20" />
        <div className="deco-circle absolute top-[55%] left-[3%] w-5 h-5 rounded-full border border-accent/20" />

        {/* SVG Arcs */}
        <svg className="absolute top-[10%] right-[5%] w-32 h-32 opacity-20" viewBox="0 0 100 100" fill="none">
          <path
            className="deco-arc"
            d="M 80 50 A 30 30 0 0 1 50 80"
            stroke="hsl(var(--accent))"
            strokeWidth="1"
            strokeDasharray="300"
            strokeDashoffset="300"
          />
        </svg>
        <svg className="absolute bottom-[15%] left-[10%] w-24 h-24 opacity-15" viewBox="0 0 100 100" fill="none">
          <path
            className="deco-arc"
            d="M 20 50 A 30 30 0 0 0 50 20"
            stroke="hsl(var(--foreground))"
            strokeWidth="1"
            strokeDasharray="300"
            strokeDashoffset="300"
          />
        </svg>
        <svg className="absolute top-[45%] right-[8%] w-20 h-20 opacity-10" viewBox="0 0 100 100" fill="none">
          <circle
            className="deco-arc"
            cx="50"
            cy="50"
            r="40"
            stroke="hsl(var(--foreground))"
            strokeWidth="0.5"
            strokeDasharray="300"
            strokeDashoffset="300"
          />
        </svg>

      </div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-6 md:px-8 min-h-screen flex items-center">
        <div className="grid lg:grid-cols-[1fr,auto] gap-16 items-center w-full">

          {/* Left - Main content */}
          <div className="max-w-4xl">
            {/* Eyebrow */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-[1px] bg-accent" />
              <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-medium">
                Crédit transparent
              </span>
            </div>

            {/* Title */}
            <div className="mb-10">
              <div className="overflow-hidden">
                <div ref={line1Ref} className="opacity-0">
                  <h1 className="font-serif text-[clamp(2.5rem,8vw,7rem)] font-light leading-[0.9] tracking-[-0.02em]">
                    Votre crédit,
                  </h1>
                </div>
              </div>
              <div className="overflow-hidden">
                <div ref={line2Ref} className="opacity-0">
                  <h1 className="font-serif text-[clamp(2.5rem,8vw,7rem)] font-light leading-[0.9] tracking-[-0.02em]">
                    <span className="text-accent italic">en 24h.</span>
                  </h1>
                </div>
              </div>
              <div className="overflow-hidden mt-2">
                <div ref={line3Ref} className="opacity-0">
                  <h1 className="font-serif text-[clamp(1.5rem,4vw,3.5rem)] font-light leading-[1.1] tracking-[-0.01em] text-muted-foreground">
                    Sans surprise, sans jargon.
                  </h1>
                </div>
              </div>
            </div>

            {/* Subtitle */}
            <p
              ref={subtitleRef}
              className="text-base md:text-lg text-muted-foreground max-w-md leading-relaxed mb-10 opacity-0"
            >
              De <span className="text-foreground">20€ à 10 000€</span>.
              Une réponse garantie. Et si c'est non,{" "}
              <span className="text-foreground">on vous dit pourquoi</span>.
            </p>

            {/* CTA */}
            <div ref={ctaRef} className="flex flex-wrap items-center gap-6 opacity-0">
              <Magnetic>
                <button className="group relative px-8 py-4 bg-foreground text-background font-medium text-sm overflow-hidden transition-all duration-500 hover:shadow-2xl">
                  <span className="relative z-10 flex items-center gap-3">
                    Simuler mon crédit
                    <svg
                      className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                  <span className="absolute inset-0 bg-accent transform translate-y-full transition-transform duration-500 group-hover:translate-y-0" />
                </button>
              </Magnetic>

              <Magnetic>
                <button className="group flex items-center gap-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-300">
                  <span className="w-10 h-10 rounded-full border border-current flex items-center justify-center group-hover:border-accent group-hover:text-accent transition-colors duration-300">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    </svg>
                  </span>
                  Comment ça marche
                </button>
              </Magnetic>
            </div>
          </div>

          {/* Right - Floating numbers */}
          <div ref={numbersRef} className="hidden lg:block opacity-0">
            <div className="relative">
              {/* Large decorative number */}
              <div className="font-serif text-[12rem] leading-none font-light text-foreground/[0.03] select-none">
                24
              </div>
              {/* Stats overlay */}
              <div className="absolute top-1/2 left-0 -translate-y-1/2 space-y-8">
                <div className="group">
                  <div className="flex items-baseline gap-2">
                    <span className="font-serif text-5xl font-light">24</span>
                    <span className="text-accent text-lg">h</span>
                  </div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
                    Réponse garantie
                  </div>
                  <div className="w-0 group-hover:w-full h-[1px] bg-accent/50 transition-all duration-500 mt-2" />
                </div>
                <div className="group">
                  <div className="flex items-baseline gap-2">
                    <span className="font-serif text-5xl font-light">10</span>
                    <span className="text-accent text-lg">k€</span>
                  </div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
                    Montant max
                  </div>
                  <div className="w-0 group-hover:w-full h-[1px] bg-accent/50 transition-all duration-500 mt-2" />
                </div>
                <div className="group">
                  <div className="flex items-baseline gap-2">
                    <span className="font-serif text-5xl font-light">0</span>
                    <span className="text-accent text-lg">€</span>
                  </div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
                    Frais cachés
                  </div>
                  <div className="w-0 group-hover:w-full h-[1px] bg-accent/50 transition-all duration-500 mt-2" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 h-16 border-t border-foreground/5">
        <div className="container mx-auto px-6 md:px-8 h-full flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-8">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              100% en ligne
            </span>
            <span className="hidden md:flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              Sans engagement
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="uppercase tracking-wider">Scroll</span>
            <svg className="w-4 h-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
