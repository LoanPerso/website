"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslations } from "next-intl";

gsap.registerPlugin(ScrollTrigger);

export function WhyUsTransition() {
  const t = useTranslations("why-us.transition");
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const textLine1Ref = useRef<HTMLDivElement>(null);
  const textLine2Ref = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const lightBurstRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Pin the section during the transition
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=250%",
          pin: true,
          scrub: 0.5, // More responsive scrub
        },
      });

      // Initial state
      gsap.set(lightBurstRef.current, { scale: 0.3, opacity: 0 });
      gsap.set(textLine1Ref.current, { opacity: 0, y: 40 });
      gsap.set(textLine2Ref.current, { opacity: 0, scale: 0.95, y: 20 });
      gsap.set(logoRef.current, { opacity: 0, scale: 0.7 });

      // Phase 1: Question appears (Dark Mode)
      tl.to(textLine1Ref.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power3.out",
      });

      tl.to({}, { duration: 0.3 }); // Brief pause

      // Phase 2: Light burst begins - smooth progressive growth
      tl.to(
        lightBurstRef.current,
        {
          scale: 2,
          opacity: 0.6,
          duration: 0.5,
          ease: "sine.inOut",
        },
        "+=0.1"
      );

      // Phase 3: Light grows more, text starts fading
      tl.to(
        lightBurstRef.current,
        {
          scale: 6,
          opacity: 0.9,
          duration: 0.6,
          ease: "sine.inOut",
        }
      );

      tl.to(
        textLine1Ref.current,
        {
          opacity: 0,
          scale: 1.05,
          duration: 0.5,
          ease: "power2.in",
        },
        "<"
      );

      // Phase 4: Light expands to fill screen - smooth continuous growth
      tl.to(lightBurstRef.current, {
        scale: 15,
        opacity: 1,
        duration: 0.7,
        ease: "power1.inOut",
      });

      // Phase 5: Background transition to Ivory - smoother
      tl.to(
        containerRef.current,
        {
          backgroundColor: "#f7f5f0",
          duration: 0.4,
          ease: "power2.inOut",
        },
        "-=0.5"
      );

      // Phase 6: Final light expansion
      tl.to(lightBurstRef.current, {
        scale: 25,
        duration: 0.5,
        ease: "power1.out",
      });

      // Phase 7: Logo reveal - simpler, no blur animation
      tl.to(logoRef.current, {
        opacity: 1,
        scale: 1,
        duration: 0.6,
        ease: "power2.out",
      }, "-=0.3");

      // Phase 8: Brand reveal
      tl.to(
        textLine2Ref.current,
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.5,
          ease: "power2.out",
        },
        "-=0.4"
      );

      // Clean up light burst
      tl.to(
        lightBurstRef.current,
        {
          opacity: 0,
          duration: 0.6,
          ease: "power2.out",
        },
        "-=0.3"
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-screen w-full overflow-hidden"
    >
      <div
        ref={containerRef}
        className="absolute inset-0 bg-deep-black transition-colors duration-300"
      />

      {/* Light Burst Effect (CSS Gradient) */}
      <div
        ref={lightBurstRef}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[2] w-[25vw] h-[25vw] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(255,250,230,1) 0%, rgba(255,235,180,0.8) 25%, rgba(255,215,0,0.4) 50%, rgba(255,200,100,0.15) 75%, transparent 100%)",
          filter: "blur(20px)",
          willChange: "transform, opacity",
        }}
      />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center">
        
        {/* Question text (Dark) */}
        <div
          ref={textLine1Ref}
          className="absolute max-w-4xl mx-auto"
        >
          <p className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white/90 font-light italic leading-tight">
            {t("question")}
            <br />
            {t("questionLine2")} <span className="text-champagne">{t("questionAccent")}</span> ?
          </p>
        </div>

        {/* Logo and answer (Light) */}
        <div className="flex flex-col items-center gap-6 md:gap-10">
          <div
            ref={logoRef}
            className="relative"
          >
            {/* Logo Mark */}
            <div className="w-20 h-20 md:w-28 md:h-28 rounded-2xl bg-gradient-to-br from-champagne to-dark-gold flex items-center justify-center shadow-2xl rotate-3">
               {/* Simple "Q" placeholder SVG */}
               <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10 md:w-14 md:h-14 text-white" stroke="currentColor" strokeWidth="2">
                 <circle cx="12" cy="12" r="8" />
                 <path d="M16 16l2 2" />
               </svg>
            </div>

            {/* Decorative elements around logo */}
            <div className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-champagne/30 blur-xl" />
            <div className="absolute -bottom-4 -left-4 w-12 h-12 rounded-full bg-champagne/20 blur-xl" />
          </div>

          <div
            ref={textLine2Ref}
            className="text-center"
          >
            <h2 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-anthracite font-medium tracking-tight">
              {t("brandName")}
            </h2>
            <p className="mt-4 text-lg md:text-xl text-anthracite/60 font-medium tracking-widest uppercase">
              {t("tagline")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default WhyUsTransition;