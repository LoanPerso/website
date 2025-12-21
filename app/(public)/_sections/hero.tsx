"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import Magnetic from "@/_components/ui/magnetic-button";

export function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  const cursorCircleRef = useRef<HTMLDivElement>(null);

  // Refs for animations
  const eyebrowRef = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<HTMLDivElement>(null);
  const line2Ref = useRef<HTMLDivElement>(null);
  const line3Ref = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const decorRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Mouse follower (desktop only)
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMobile) return;

    const handleMouseMove = (e: MouseEvent) => {
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

      // Decorative elements
      const circles = decorRef.current?.querySelectorAll(".deco-circle");
      const arcs = decorRef.current?.querySelectorAll(".deco-arc");

      if (circles) {
        tl.fromTo(
          circles,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 1, stagger: 0.1, ease: "back.out(1.7)" },
          0
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

      // Eyebrow
      tl.fromTo(
        eyebrowRef.current,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.8, ease: "power3.out" },
        0.3
      );

      // Title reveal
      tl.fromTo(
        line1Ref.current,
        { yPercent: 100, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 1.2, ease: "power4.out" },
        0.5
      );

      tl.fromTo(
        line2Ref.current,
        { yPercent: 100, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 1.2, ease: "power4.out" },
        0.65
      );

      tl.fromTo(
        line3Ref.current,
        { yPercent: 100, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 1.2, ease: "power4.out" },
        0.8
      );

      // Stats - aligned with title animation
      tl.fromTo(
        statsRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1, ease: "power3.out" },
        0.7
      );

      // Subtitle
      tl.fromTo(
        subtitleRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
        1.1
      );

      // CTA
      tl.fromTo(
        ctaRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
        1.3
      );

      // Bottom bar
      tl.fromTo(
        bottomRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.6, ease: "power3.out" },
        1.5
      );

      // Floating animation for circles
      if (circles) {
        gsap.to(circles, {
          y: "random(-8, 8)",
          x: "random(-4, 4)",
          duration: "random(3, 4)",
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          stagger: { each: 0.3, from: "random" },
        });
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[100dvh] w-full overflow-hidden bg-background flex flex-col"
    >
      {/* Mouse follower circle - hidden on mobile */}
      <div
        ref={cursorCircleRef}
        className="hidden md:block fixed top-0 left-0 w-[300px] h-[300px] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0 opacity-[0.05]"
        style={{
          background: "radial-gradient(circle, hsl(var(--accent)) 0%, transparent 70%)",
        }}
      />

      {/* Decorative elements */}
      <div ref={decorRef} className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="deco-circle absolute top-[15%] right-[12%] w-2 md:w-2.5 h-2 md:h-2.5 rounded-full border border-accent/30" />
        <div className="deco-circle hidden sm:block absolute top-[70%] left-[8%] w-1.5 h-1.5 rounded-full bg-accent/20" />
        <div className="deco-circle absolute bottom-[35%] right-[25%] w-3 h-3 rounded-full border border-foreground/5" />
        <div className="deco-circle hidden lg:block absolute top-[45%] left-[5%] w-3 h-3 rounded-full border border-accent/15" />

        {/* SVG Arc - subtle */}
        <svg className="hidden md:block absolute top-[12%] right-[8%] w-20 lg:w-24 h-20 lg:h-24 opacity-10" viewBox="0 0 100 100" fill="none">
          <path
            className="deco-arc"
            d="M 75 50 A 25 25 0 0 1 50 75"
            stroke="hsl(var(--accent))"
            strokeWidth="1"
            strokeDasharray="300"
            strokeDashoffset="300"
          />
        </svg>
      </div>

      {/* Main content - full width */}
      <div className="relative z-10 flex-1 flex items-center">
        <div className="w-full px-8 sm:px-12 lg:px-20 xl:px-28">

          {/* Grid: 2 columns using full width */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 xl:gap-32 items-center">

            {/* Left - Main content */}
            <div className="max-w-2xl">
              {/* Eyebrow */}
              <div ref={eyebrowRef} className="flex items-center gap-4 mb-8 opacity-0">
                <div className="w-12 h-[1px] bg-accent" />
                <span className="text-sm uppercase tracking-[0.25em] text-muted-foreground font-medium">
                  Crédit transparent
                </span>
              </div>

              {/* Title */}
              <div className="mb-10">
                <div className="overflow-hidden">
                  <div ref={line1Ref} className="opacity-0">
                    <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-7xl xl:text-8xl font-light leading-[0.9] tracking-[-0.02em]">
                      Votre crédit,
                    </h1>
                  </div>
                </div>
                <div className="overflow-hidden">
                  <div ref={line2Ref} className="opacity-0">
                    <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-7xl xl:text-8xl font-light leading-[0.9] tracking-[-0.02em]">
                      <span className="text-accent italic">en 24h.</span>
                    </h1>
                  </div>
                </div>
                <div className="overflow-hidden mt-4">
                  <div ref={line3Ref} className="opacity-0">
                    <p className="font-serif text-xl sm:text-2xl md:text-3xl font-light leading-[1.2] text-muted-foreground">
                      Sans surprise, sans jargon.
                    </p>
                  </div>
                </div>
              </div>

              {/* Subtitle */}
              <p
                ref={subtitleRef}
                className="text-lg sm:text-xl text-muted-foreground max-w-lg leading-relaxed mb-10 opacity-0"
              >
                De <span className="text-foreground font-medium">20€ à 10 000€</span>.
                Réponse garantie. Et si c'est non,{" "}
                <span className="text-foreground font-medium">on vous explique pourquoi</span>.
              </p>

              {/* CTA */}
              <div ref={ctaRef} className="flex flex-wrap items-center gap-6 opacity-0">
                <Magnetic>
                  <button className="group relative px-10 py-5 bg-foreground text-background font-medium text-base overflow-hidden transition-all duration-500 hover:shadow-xl">
                    <span className="relative z-10 flex items-center gap-3">
                      Simuler mon crédit
                      <svg
                        className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
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
                  <button className="group flex items-center gap-4 text-base font-medium text-muted-foreground hover:text-foreground transition-colors duration-300">
                    <span className="w-14 h-14 rounded-full border border-current flex items-center justify-center group-hover:border-accent group-hover:text-accent transition-colors duration-300">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      </svg>
                    </span>
                    Comment ça marche
                  </button>
                </Magnetic>
              </div>
            </div>

            {/* Right - Stats */}
            <div ref={statsRef} className="hidden lg:flex flex-col justify-center opacity-0">
              <div className="grid grid-cols-1 gap-8 xl:gap-10">
                {/* Stat 1 */}
                <div className="group">
                  <div className="flex items-baseline gap-2">
                    <span className="font-serif text-6xl xl:text-7xl font-light">24</span>
                    <span className="text-accent text-xl xl:text-2xl">h</span>
                  </div>
                  <div className="text-sm text-muted-foreground uppercase tracking-wider mt-2">
                    Réponse garantie
                  </div>
                  <div className="w-16 h-[1px] bg-accent/30 mt-4" />
                </div>

                {/* Stat 2 */}
                <div className="group">
                  <div className="flex items-baseline gap-2">
                    <span className="font-serif text-6xl xl:text-7xl font-light">10 000</span>
                    <span className="text-accent text-xl xl:text-2xl">€</span>
                  </div>
                  <div className="text-sm text-muted-foreground uppercase tracking-wider mt-2">
                    Montant maximum
                  </div>
                  <div className="w-16 h-[1px] bg-accent/30 mt-4" />
                </div>

                {/* Stat 3 */}
                <div className="group">
                  <div className="flex items-baseline gap-2">
                    <span className="font-serif text-6xl xl:text-7xl font-light">0</span>
                    <span className="text-accent text-xl xl:text-2xl">€</span>
                  </div>
                  <div className="text-sm text-muted-foreground uppercase tracking-wider mt-2">
                    Frais cachés
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile stats - horizontal row below CTA */}
          <div className="lg:hidden mt-12 pt-10 border-t border-foreground/5">
            <div className="flex justify-between text-center">
              <div>
                <div className="font-serif text-4xl font-light">24<span className="text-accent text-sm ml-1">h</span></div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider mt-2">Réponse</div>
              </div>
              <div>
                <div className="font-serif text-4xl font-light">10k<span className="text-accent text-sm ml-1">€</span></div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider mt-2">Maximum</div>
              </div>
              <div>
                <div className="font-serif text-4xl font-light">0<span className="text-accent text-sm ml-1">€</span></div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider mt-2">Frais cachés</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div ref={bottomRef} className="py-5 border-t border-foreground/5 opacity-0">
        <div className="px-8 sm:px-12 lg:px-20 xl:px-28 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-6 sm:gap-10">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              100% en ligne
            </span>
            <span className="hidden sm:flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              Sans engagement
            </span>
            <span className="hidden md:flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              Réponse garantie
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="uppercase tracking-widest text-xs">Scroll</span>
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
