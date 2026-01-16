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
  const videoRef = useRef<HTMLVideoElement>(null);
  const raysRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Pin the section during the transition
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=150%",
          pin: true,
          scrub: 1,
        },
      });

      // Initial state - dark
      gsap.set(lightBurstRef.current, { scale: 0, opacity: 0 });
      gsap.set(textLine1Ref.current, { opacity: 0, y: 50 });
      gsap.set(textLine2Ref.current, { opacity: 0, y: 30, scale: 0.9 });
      gsap.set(logoRef.current, { opacity: 0, scale: 0.5, filter: "blur(20px)" });

      // Phase 1: Question appears
      tl.to(textLine1Ref.current, {
        opacity: 1,
        y: 0,
        duration: 0.3,
        ease: "power2.out",
      });

      // Phase 2: Light burst begins
      tl.to(
        lightBurstRef.current,
        {
          scale: 3,
          opacity: 1,
          duration: 0.4,
          ease: "power2.in",
        },
        "+=0.1"
      );

      // Phase 3: First text fades as light expands
      tl.to(
        textLine1Ref.current,
        {
          opacity: 0,
          scale: 1.1,
          filter: "blur(10px)",
          duration: 0.2,
        },
        "-=0.2"
      );

      // Phase 4: Light reaches full intensity
      tl.to(lightBurstRef.current, {
        scale: 20,
        opacity: 0.9,
        duration: 0.3,
        ease: "power2.out",
      });

      // Phase 5: Background transitions to warm
      tl.to(
        containerRef.current,
        {
          backgroundColor: "hsl(38, 44%, 94%)", // Ivoire
          duration: 0.3,
        },
        "-=0.2"
      );

      // Phase 6: Logo appears
      tl.to(logoRef.current, {
        opacity: 1,
        scale: 1,
        filter: "blur(0px)",
        duration: 0.4,
        ease: "back.out(1.7)",
      });

      // Phase 7: Answer text appears
      tl.to(
        textLine2Ref.current,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.3,
          ease: "power3.out",
        },
        "-=0.2"
      );

      // Phase 8: Light burst fades
      tl.to(
        lightBurstRef.current,
        {
          opacity: 0,
          duration: 0.3,
        },
        "-=0.1"
      );
    });

    // GSAP for light rays rotation
    if (raysRef.current) {
      gsap.to(raysRef.current, {
        rotation: 360,
        duration: 20,
        repeat: -1,
        ease: "none",
      });
    }

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-screen w-full overflow-hidden"
    >
      <div
        ref={containerRef}
        className="absolute inset-0 bg-deep-black transition-colors duration-1000"
      />

      {/* Video transition background */}
      <div className="absolute inset-0 z-[1]">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-0"
          poster="/videos/why-us/transition-poster.jpg"
        >
          <source src="/videos/why-us/transition-light.mp4" type="video/mp4" />
          <source src="/videos/why-us/transition-light.webm" type="video/webm" />
        </video>
      </div>

      {/* Light burst effect */}
      <div
        ref={lightBurstRef}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[2] w-32 h-32 rounded-full"
        style={{
          background: "radial-gradient(circle, hsl(40, 48%, 70%) 0%, hsl(40, 48%, 60%) 30%, transparent 70%)",
          boxShadow: "0 0 100px 50px hsla(40, 48%, 60%, 0.5)",
        }}
      />

      {/* Animated light rays */}
      <div
        ref={raysRef}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1] w-[200vmax] h-[200vmax] opacity-0 pointer-events-none"
        style={{
          background: `conic-gradient(from 0deg, transparent 0deg, hsla(40, 48%, 60%, 0.1) 10deg, transparent 20deg, transparent 40deg, hsla(40, 48%, 60%, 0.1) 50deg, transparent 60deg, transparent 80deg, hsla(40, 48%, 60%, 0.1) 90deg, transparent 100deg, transparent 120deg, hsla(40, 48%, 60%, 0.1) 130deg, transparent 140deg, transparent 160deg, hsla(40, 48%, 60%, 0.1) 170deg, transparent 180deg, transparent 200deg, hsla(40, 48%, 60%, 0.1) 210deg, transparent 220deg, transparent 240deg, hsla(40, 48%, 60%, 0.1) 250deg, transparent 260deg, transparent 280deg, hsla(40, 48%, 60%, 0.1) 290deg, transparent 300deg, transparent 320deg, hsla(40, 48%, 60%, 0.1) 330deg, transparent 340deg, transparent 360deg)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6">
        {/* Question text (dark phase) */}
        <div
          ref={textLine1Ref}
          className="absolute text-center"
        >
          <p className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white/90 font-light italic">
            Et si quelqu'un faisait
            <br />
            les choses <span className="text-champagne">différemment</span> ?
          </p>
        </div>

        {/* Logo and answer (light phase) */}
        <div className="flex flex-col items-center gap-8">
          <div
            ref={logoRef}
            className="relative"
          >
            {/* Logo placeholder - replace with actual logo */}
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-champagne to-dark-gold flex items-center justify-center shadow-2xl">
              <span className="font-serif text-3xl md:text-4xl text-white font-light">Q</span>
            </div>
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-full bg-champagne/30 blur-2xl -z-10 scale-150" />
          </div>

          <div
            ref={textLine2Ref}
            className="text-center"
          >
            <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-foreground font-light leading-tight">
              Quickfund
            </h2>
            <p className="mt-4 text-lg md:text-xl text-muted-foreground">
              Le crédit réinventé
            </p>
          </div>
        </div>
      </div>

      {/* Decorative corner elements */}
      <div className="absolute top-8 left-8 w-16 h-16 border-l border-t border-champagne/20 opacity-0 transition-opacity duration-1000" />
      <div className="absolute bottom-8 right-8 w-16 h-16 border-r border-b border-champagne/20 opacity-0 transition-opacity duration-1000" />
    </section>
  );
}

export default WhyUsTransition;
