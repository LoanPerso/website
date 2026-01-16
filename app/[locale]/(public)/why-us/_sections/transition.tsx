"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function WhyUsTransition() {
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
          end: "+=200%", // Longer scroll for smoother transition
          pin: true,
          scrub: 1,
        },
      });

      // Initial state
      gsap.set(lightBurstRef.current, { scale: 0.1, opacity: 0 });
      gsap.set(textLine1Ref.current, { opacity: 0, y: 50 });
      gsap.set(textLine2Ref.current, { opacity: 0, scale: 0.9, y: 30 });
      gsap.set(logoRef.current, { opacity: 0, scale: 0.5, filter: "blur(20px)" });

      // Phase 1: Question appears (Dark Mode)
      tl.to(textLine1Ref.current, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: "power2.out",
      });
      
      tl.to({}, { duration: 0.2 }); // Pause

      // Phase 2: Light burst begins
      tl.to(
        lightBurstRef.current,
        {
          scale: 4,
          opacity: 1,
          duration: 0.8,
          ease: "power1.in",
        },
        "+=0.1"
      );

      // Phase 3: Text 1 fades as light expands
      tl.to(
        textLine1Ref.current,
        {
          opacity: 0,
          scale: 1.1,
          filter: "blur(10px)",
          duration: 0.4,
        },
        "<"
      );

      // Phase 4: Light consumes everything (Whiteout)
      tl.to(lightBurstRef.current, {
        scale: 30,
        opacity: 1,
        duration: 0.8,
        ease: "power2.inOut",
      });

      // Phase 5: Background switch to Ivory
      tl.to(
        containerRef.current,
        {
          backgroundColor: "#f7f5f0", // Matches ivory/background
          duration: 0.1,
        },
        "-=0.4"
      );

      // Phase 6: Logo reveal
      tl.to(logoRef.current, {
        opacity: 1,
        scale: 1,
        filter: "blur(0px)",
        duration: 0.6,
        ease: "back.out(1.5)",
      });

      // Phase 7: Brand reveal
      tl.to(
        textLine2Ref.current,
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.5,
          ease: "power2.out",
        },
        "-=0.3"
      );

      // Clean up light burst (fade out so it doesn't block clicks)
      tl.to(
        lightBurstRef.current,
        {
          opacity: 0,
          duration: 0.5,
        },
        "-=0.2"
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
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[2] w-[20vw] h-[20vw] rounded-full pointer-events-none mix-blend-screen"
        style={{
          background: "radial-gradient(circle, rgba(255,248,220,1) 0%, rgba(255,215,0,0.4) 40%, rgba(255,165,0,0.1) 70%, transparent 100%)",
          filter: "blur(40px)",
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
            Et si quelqu'un faisait
            <br />
            les choses <span className="text-champagne">différemment</span> ?
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
              Quickfund
            </h2>
            <p className="mt-4 text-lg md:text-xl text-anthracite/60 font-medium tracking-widest uppercase">
              Le crédit réinventé
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default WhyUsTransition;