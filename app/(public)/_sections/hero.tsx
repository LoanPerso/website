"use client";

import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Magnetic from "@/_components/ui/magnetic-button";
import { BrandOverlay, type BrandOverlayRef } from "./hero/brand-overlay";

gsap.registerPlugin(ScrollTrigger);


export function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  const cursorCircleRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Refs for animations
  const eyebrowRef = useRef<HTMLDivElement>(null);
  const eyebrowLineLeftRef = useRef<HTMLDivElement>(null);
  const eyebrowLineRightRef = useRef<HTMLDivElement>(null);
  const eyebrowTextRef = useRef<HTMLSpanElement>(null);
  const line1Ref = useRef<HTMLDivElement>(null);
  const line2Ref = useRef<HTMLDivElement>(null);
  const line3Ref = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const decorRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const bottomLeftRef = useRef<HTMLDivElement>(null);
  const bottomRightRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const ctaButtonRef = useRef<HTMLButtonElement>(null);
  const ctaButtonTextRef = useRef<HTMLSpanElement>(null);
  const playButtonRef = useRef<SVGSVGElement>(null);
  const playIconRef = useRef<SVGGElement>(null);
  const playTextRef = useRef<HTMLSpanElement>(null);
  const circleStrokeRef = useRef<SVGCircleElement>(null);
  const circleFillRef = useRef<SVGCircleElement>(null);
  const titleContainerRef = useRef<HTMLDivElement>(null);
  const brandOverlayRef = useRef<BrandOverlayRef>(null);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Mouse follower (desktop only)
  useEffect(() => {
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

      // Set initial states
      gsap.set([eyebrowLineLeftRef.current, eyebrowLineRightRef.current], { scaleX: 0 });
      gsap.set(eyebrowTextRef.current, { opacity: 0, filter: "blur(10px)" });
      gsap.set([line1Ref.current, line2Ref.current], {
        clipPath: "inset(0 100% 0 0)",
        opacity: 1
      });
      gsap.set(line3Ref.current, { opacity: 0, y: 20, filter: "blur(8px)" });
      gsap.set(subtitleRef.current, { opacity: 0, y: 30, filter: "blur(6px)" });
      gsap.set(ctaRef.current?.children || [], { opacity: 0, scale: 0.8, y: 20 });
      gsap.set(bottomRef.current, { opacity: 0 });

      // Decorative circles - subtle fade in
      if (circles) {
        tl.fromTo(
          circles,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 1.2, stagger: 0.15, ease: "elastic.out(1, 0.5)" },
          0
        );
      }

      // SVG arc drawing
      if (arcs) {
        tl.fromTo(
          arcs,
          { strokeDashoffset: 300 },
          { strokeDashoffset: 0, duration: 2.5, stagger: 0.2, ease: "power2.inOut" },
          0.3
        );
      }

      // Eyebrow - lines extend from center
      tl.to(
        eyebrowLineLeftRef.current,
        { scaleX: 1, duration: 0.6, ease: "power3.out", transformOrigin: "right center" },
        0.2
      );
      tl.to(
        eyebrowLineRightRef.current,
        { scaleX: 1, duration: 0.6, ease: "power3.out", transformOrigin: "left center" },
        0.2
      );

      // Eyebrow text - blur reveal
      tl.to(
        eyebrowTextRef.current,
        { opacity: 1, filter: "blur(0px)", duration: 0.8, ease: "power2.out" },
        0.5
      );

      // Title line 1 - clip-path reveal
      tl.to(
        line1Ref.current,
        { clipPath: "inset(0 0% 0 0)", duration: 1, ease: "power3.inOut" },
        0.7
      );

      // Title line 2 - clip-path reveal with slight delay
      tl.to(
        line2Ref.current,
        { clipPath: "inset(0 0% 0 0)", duration: 1, ease: "power3.inOut" },
        0.9
      );

      // Title line 3 - blur + fade reveal
      tl.to(
        line3Ref.current,
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.8, ease: "power3.out" },
        1.3
      );

      // Subtitle - blur + fade reveal
      tl.to(
        subtitleRef.current,
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.9, ease: "power3.out" },
        1.5
      );

      // CTA buttons - scale + fade with stagger
      tl.to(
        ctaRef.current?.children || [],
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.15,
          ease: "back.out(1.7)"
        },
        1.7
      );

      // Bottom bar - fade in with children stagger
      tl.to(
        bottomRef.current,
        { opacity: 1, duration: 0.5, ease: "power2.out" },
        2.0
      );

      // Bottom bar items cascade
      const bottomItems = bottomRef.current?.querySelectorAll("span");
      if (bottomItems) {
        tl.fromTo(
          bottomItems,
          { opacity: 0, x: -10 },
          { opacity: 1, x: 0, duration: 0.4, stagger: 0.1, ease: "power2.out" },
          2.1
        );
      }

      // Floating animation for circles (continuous)
      if (circles) {
        gsap.to(circles, {
          y: "random(-10, 10)",
          x: "random(-5, 5)",
          rotation: "random(-5, 5)",
          duration: "random(3, 5)",
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          stagger: { each: 0.4, from: "random" },
        });
      }
    });

    return () => ctx.revert();
  }, []);

  // Scroll exit animations - ALL content disappears while pinned, then scroll resumes
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Adapted values for mobile vs desktop
      const config = isMobile
        ? {
            bottomX: 100,
            playTextX: -60,
            eyebrowLineX: 80,
            eyebrowTextY: -40,
            titleX: 150,
            titleY: -30,
            scrub: 0.5,
            pinDuration: "+=30%",
          }
        : {
            bottomX: 200,
            playTextX: -100,
            eyebrowLineX: 150,
            eyebrowTextY: -60,
            titleX: 300,
            titleY: -50,
            scrub: 0.8,
            pinDuration: "+=40%",
          };

      // Single pinned timeline - everything disappears before scroll resumes
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: config.pinDuration,
          scrub: config.scrub,
          pin: true,
          pinSpacing: true,
        },
      });

      // ===== 1. BOTTOM BAR - First to go =====
      tl.fromTo(
        bottomLeftRef.current,
        { x: 0, opacity: 1 },
        { x: -config.bottomX, opacity: 0, duration: 0.15 },
        0
      );
      tl.fromTo(
        bottomRightRef.current,
        { x: 0, opacity: 1 },
        { x: config.bottomX, opacity: 0, duration: 0.15 },
        0
      );

      // ===== 2. EYEBROW - Lines extend + text fades =====
      tl.fromTo(
        eyebrowLineLeftRef.current,
        { x: 0, scaleX: 1, opacity: 1 },
        { x: -config.eyebrowLineX, scaleX: 2, opacity: 0, duration: 0.15 },
        0.05
      );
      tl.fromTo(
        eyebrowLineRightRef.current,
        { x: 0, scaleX: 1, opacity: 1 },
        { x: config.eyebrowLineX, scaleX: 2, opacity: 0, duration: 0.15 },
        0.05
      );
      tl.fromTo(
        eyebrowTextRef.current,
        { y: 0, opacity: 1, filter: "blur(0px)" },
        { y: config.eyebrowTextY, opacity: 0, filter: "blur(8px)", duration: 0.15 },
        0.08
      );

      // ===== 3. CTA BUTTONS =====
      tl.fromTo(
        playTextRef.current,
        { x: 0, scale: 1, opacity: 1 },
        { x: config.playTextX, scale: 0.5, opacity: 0, duration: 0.15 },
        0.12
      );

      // Circle stroke draws around progressively
      tl.fromTo(
        circleStrokeRef.current,
        { strokeDashoffset: 1700 },
        { strokeDashoffset: 0, duration: 0.25, ease: "power2.inOut" },
        0.08
      );

      // Circle fills with black (opacity increases)
      tl.fromTo(
        circleFillRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.2, ease: "power2.in" },
        0.18
      );

      // Play icon fades out as the black fills
      tl.fromTo(
        playIconRef.current,
        { opacity: 1 },
        { opacity: 0, duration: 0.15, ease: "power2.in" },
        0.2
      );
      tl.fromTo(
        ctaButtonTextRef.current,
        { clipPath: "inset(0 0% 0 0)" },
        { clipPath: "inset(0 100% 0 0)", duration: 0.18 },
        0.12
      );
      tl.fromTo(
        ctaButtonRef.current,
        { scaleX: 1, opacity: 1 },
        { scaleX: 0, transformOrigin: "right center", opacity: 0, duration: 0.12 },
        0.18
      );

      // ===== 4. SUBTITLE =====
      tl.fromTo(
        subtitleRef.current,
        { opacity: 1, y: 0, filter: "blur(0px)" },
        { opacity: 0, y: 30, filter: "blur(4px)", duration: 0.15 },
        0.2
      );

      // ===== 5. TITLE - Lines transform and fly away =====
      tl.fromTo(
        line3Ref.current,
        { scaleY: 1, scaleX: 1, opacity: 1, y: 0 },
        { scaleY: 0.02, scaleX: 2, opacity: 0, y: config.titleY, transformOrigin: "center center", duration: 0.2 },
        0.25
      );
      tl.fromTo(
        line2Ref.current,
        { scaleY: 1, scaleX: 1, x: 0, opacity: 1 },
        { scaleY: 0.02, scaleX: 1.5, x: config.titleX, opacity: 0, transformOrigin: "left center", duration: 0.25 },
        0.3
      );
      tl.fromTo(
        line1Ref.current,
        { scaleY: 1, scaleX: 1, x: 0, opacity: 1 },
        { scaleY: 1, scaleX: 1.5, x: -config.titleX, opacity: 0, transformOrigin: "right center", duration: 0.25 },
        0.3
      );

      // ===== 6. DECORATIVE CIRCLES =====
      const circles = decorRef.current?.querySelectorAll(".deco-circle");
      if (circles) {
        tl.fromTo(
          circles,
          { opacity: 1, scale: 1 },
          { opacity: 0, scale: 0.5, stagger: 0.02, duration: 0.15 },
          0.1
        );
      }

      // ===== 7. SVG ARCS (desktop) =====
      if (!isMobile) {
        const arcs = decorRef.current?.querySelectorAll(".deco-arc");
        if (arcs) {
          tl.fromTo(arcs, { opacity: 1, strokeDashoffset: 0 }, { opacity: 0, strokeDashoffset: 300, duration: 0.2 }, 0.15);
        }
      }

      // ===== 8. MOUSE FOLLOWER (desktop) =====
      if (!isMobile && cursorCircleRef.current) {
        tl.fromTo(cursorCircleRef.current, { opacity: 0.05, scale: 1 }, { opacity: 0, scale: 0.3, duration: 0.2 }, 0.1);
      }

      // ===== 9. DARK VEIL (mobile) =====
      if (isMobile) {
        tl.fromTo(veilRef.current, { y: "100%" }, { y: 0, duration: 0.4 }, 0.5);
        tl.to(veilRef.current, { opacity: 0, duration: 0.3 }, 0.85);
      }

      // ===== 10. ZOOM THE PLAY BUTTON SVG =====
      // Calculate final size needed to cover entire screen
      const maxDimension = Math.max(window.innerWidth, window.innerHeight) * 2.5;
      const startSize = 56; // Initial SVG size in px

      const zoomStart = 0.38;
      const zoomEnd = 0.88;

      // Get the parent button to disable interactions
      const parentButton = playButtonRef.current?.closest('button');
      const magneticWrapper = parentButton?.closest('.magnetic');

      // Disable pointer events and magnetic effect when zoom starts
      tl.set(playButtonRef.current, { zIndex: 100 }, zoomStart);

      if (parentButton) {
        tl.set(parentButton, { pointerEvents: "none" }, zoomStart);
      }
      if (magneticWrapper) {
        tl.set(magneticWrapper, { pointerEvents: "none" }, zoomStart);
      }

      // Zoom animation using width/height instead of scale for true vector rendering
      tl.fromTo(
        playButtonRef.current,
        {
          width: startSize,
          height: startSize,
          margin: 0,
        },
        {
          width: maxDimension,
          height: maxDimension,
          margin: -(maxDimension - startSize) / 2, // Keep centered
          ease: "power2.inOut",
          duration: zoomEnd - zoomStart
        },
        zoomStart
      );

      // At the end of zoom, show the brand overlay
      const brand = brandOverlayRef.current;
      if (brand) {
        tl.to(brand.overlay, { opacity: 1, duration: 0.05 }, zoomEnd - 0.05);
        tl.to(brand.container, { opacity: 1, duration: 0.01 }, zoomEnd);
        tl.fromTo(
          brand.lines,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.15, stagger: 0.03, ease: "power3.out" },
          zoomEnd
        );
      }
    });

    return () => ctx.revert();
  }, [isMobile]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[100dvh] w-full overflow-hidden bg-background flex flex-col"
    >
      {/* Dark veil overlay - mobile only */}
      <div
        ref={veilRef}
        className="md:hidden fixed inset-0 z-50 bg-deep-black pointer-events-none"
        style={{ transform: "translateY(100%)" }}
      />

      {/* Brand overlay - appears when circle zoom completes */}
      <BrandOverlay ref={brandOverlayRef} />


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

          {/* Centered content */}
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">

            {/* Main content */}
            <div>
              {/* Eyebrow */}
              <div ref={eyebrowRef} className="flex items-center justify-center gap-4 mb-8">
                <div ref={eyebrowLineLeftRef} className="w-12 h-[1px] bg-accent" />
                <span ref={eyebrowTextRef} className="text-sm uppercase tracking-[0.25em] text-muted-foreground font-medium">
                  Crédit transparent
                </span>
                <div ref={eyebrowLineRightRef} className="w-12 h-[1px] bg-accent" />
              </div>

              {/* Title */}
              <div ref={titleContainerRef} className="mb-10">
                <div className="overflow-hidden">
                  <div ref={line1Ref}>
                    <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-7xl xl:text-8xl font-light leading-[0.9] tracking-[-0.02em]">
                      Votre crédit,
                    </h1>
                  </div>
                </div>
                <div className="overflow-hidden">
                  <div ref={line2Ref}>
                    <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-7xl xl:text-8xl font-light leading-[0.9] tracking-[-0.02em]">
                      <span className="text-accent italic">en 24h.</span>
                    </h1>
                  </div>
                </div>
                <div className="overflow-hidden mt-4">
                  <div ref={line3Ref}>
                    <p className="font-serif text-xl sm:text-2xl md:text-3xl font-light leading-[1.2] text-muted-foreground">
                      Sans surprise, sans jargon.
                    </p>
                  </div>
                </div>
              </div>

              {/* Subtitle */}
              <p
                ref={subtitleRef}
                className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10"
              >
                De <span className="text-foreground font-medium">20€ à 10 000€</span>.
                Réponse garantie. Et si c'est non,{" "}
                <span className="text-foreground font-medium">on vous explique pourquoi</span>.
              </p>

              {/* CTA */}
              <div ref={ctaRef} className="flex flex-wrap items-center justify-center gap-6">
                <Magnetic>
                  <button ref={ctaButtonRef} className="group relative px-10 py-5 bg-foreground text-background font-medium text-base overflow-hidden transition-all duration-500 hover:shadow-xl">
                    <span ref={ctaButtonTextRef} className="relative z-10 flex items-center gap-3">
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
                    <svg
                      ref={playButtonRef}
                      className="w-14 h-14 overflow-visible"
                      viewBox="0 0 560 560"
                      fill="none"
                      shapeRendering="geometricPrecision"
                      style={{
                        transformOrigin: "center center",
                      }}
                    >
                      {/* Fill circle - starts transparent, fills with deep-black */}
                      <circle
                        ref={circleFillRef}
                        cx="280"
                        cy="280"
                        r="270"
                        fill="hsl(var(--deep-black))"
                        opacity="0"
                      />
                      {/* Border circle - static */}
                      <circle
                        cx="280"
                        cy="280"
                        r="270"
                        stroke="currentColor"
                        strokeWidth="10"
                        fill="none"
                        className="group-hover:stroke-accent transition-colors duration-300"
                      />
                      {/* Animated stroke circle - draws around */}
                      <circle
                        ref={circleStrokeRef}
                        cx="280"
                        cy="280"
                        r="270"
                        stroke="hsl(var(--deep-black))"
                        strokeWidth="20"
                        fill="none"
                        strokeDasharray="1700"
                        strokeDashoffset="1700"
                        strokeLinecap="round"
                        style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
                      />
                      {/* Play icon - fades out as black fills */}
                      <g ref={playIconRef}>
                        <path
                          d="M240 200L360 280L240 360V200Z"
                          stroke="currentColor"
                          strokeWidth="15"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="none"
                          className="group-hover:stroke-accent transition-colors duration-300"
                        />
                      </g>
                    </svg>
                    <span ref={playTextRef}>Comment ça marche</span>
                  </button>
                </Magnetic>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div ref={bottomRef} className="py-5 border-t border-foreground/5">
        <div className="px-8 sm:px-12 lg:px-20 xl:px-28 flex items-center justify-between text-sm text-muted-foreground">
          <div ref={bottomLeftRef} className="flex items-center gap-6 sm:gap-10">
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
          <div ref={bottomRightRef} className="flex items-center gap-3">
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
