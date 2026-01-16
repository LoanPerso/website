"use client";

import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function WhyUsHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);

  const [hasAnimated, setHasAnimated] = useState(false);

  // Generate particles for background effect
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 2,
  }));

  // Initial animations on mount
  useEffect(() => {
    if (hasAnimated) return;
    setHasAnimated(true);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.3 });

      // Set initial states
      gsap.set(overlayRef.current, { opacity: 1 });
      gsap.set(titleRef.current, { opacity: 0, y: 100, filter: "blur(20px)" });
      gsap.set(subtitleRef.current, { opacity: 0, y: 50, filter: "blur(10px)" });
      gsap.set(scrollIndicatorRef.current, { opacity: 0, y: 20 });

      // Overlay fade
      tl.to(overlayRef.current, {
        opacity: 0.6,
        duration: 2,
        ease: "power2.out",
      });

      // Title reveal with blur
      tl.to(
        titleRef.current,
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 1.5,
          ease: "power3.out",
        },
        "-=1.5"
      );

      // Subtitle reveal
      tl.to(
        subtitleRef.current,
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 1.2,
          ease: "power3.out",
        },
        "-=1"
      );

      // Scroll indicator
      tl.to(
        scrollIndicatorRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
        },
        "-=0.5"
      );
    });

    // GSAP for particles floating
    if (particlesRef.current) {
      const particleElements = particlesRef.current.querySelectorAll(".particle");
      particleElements.forEach((particle) => {
        gsap.to(particle, {
          y: `random(-30, 30)`,
          x: `random(-20, 20)`,
          opacity: 0.8,
          scale: 1.2,
          duration: `random(3, 6)`,
          delay: `random(0, 2)`,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      });
    }

    return () => ctx.revert();
  }, [hasAnimated]);

  // Scroll-based parallax
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Parallax on title
      gsap.to(titleRef.current, {
        y: -100,
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });

      // Parallax on subtitle
      gsap.to(subtitleRef.current, {
        y: -50,
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "80% top",
          scrub: 1,
        },
      });

      // Video zoom effect on scroll
      gsap.to(videoRef.current, {
        scale: 1.2,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100dvh] w-full overflow-hidden flex items-center justify-center"
    >
      {/* Video Background with placeholder */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover scale-100"
          poster="/videos/why-us/hero-poster.jpg"
        >
          {/* Placeholder: Replace with actual video */}
          <source src="/videos/why-us/hero-loop.mp4" type="video/mp4" />
          <source src="/videos/why-us/hero-loop.webm" type="video/webm" />
        </video>

        {/* Fallback gradient if video doesn't load */}
        <div className="absolute inset-0 bg-gradient-to-br from-deep-black via-deep-black/95 to-anthracite" />
      </div>

      {/* Dark overlay for text readability */}
      <div
        ref={overlayRef}
        className="absolute inset-0 z-[1] bg-deep-black/60"
      />

      {/* Animated particles */}
      <div ref={particlesRef} className="absolute inset-0 z-[2] pointer-events-none overflow-hidden">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="particle absolute rounded-full bg-champagne/30"
            style={{
              width: particle.size,
              height: particle.size,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
          />
        ))}
      </div>

      {/* Gradient vignette */}
      <div className="absolute inset-0 z-[3] pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(11,11,12,0.4)_100%)]" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 md:px-12 max-w-5xl mx-auto">
        <h1
          ref={titleRef}
          className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-light text-white leading-[0.95] tracking-[-0.02em] mb-8"
        >
          Le crédit qui vous{" "}
          <span className="text-champagne italic">respecte</span>
        </h1>

        <p
          ref={subtitleRef}
          className="text-lg sm:text-xl md:text-2xl text-white/70 max-w-3xl mx-auto leading-relaxed font-light"
        >
          Découvrez pourquoi des milliers de personnes nous font confiance pour
          leurs projets financiers
        </p>
      </div>

      {/* Scroll indicator */}
      <div
        ref={scrollIndicatorRef}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3"
      >
        <span className="text-white/50 text-xs uppercase tracking-[0.3em]">
          Découvrir
        </span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-champagne/50 to-transparent relative overflow-hidden">
          <div className="absolute inset-0 bg-champagne animate-scroll-line" />
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-[5]" />

      <style jsx>{`
        @keyframes scroll-line {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(100%);
          }
        }
        .animate-scroll-line {
          animation: scroll-line 1.5s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}

export default WhyUsHero;
