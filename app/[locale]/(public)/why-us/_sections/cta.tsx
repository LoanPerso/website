"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import Magnetic from "@/_components/ui/magnetic-button";

gsap.registerPlugin(ScrollTrigger);

export function WhyUsCta() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const locale = useLocale();

  // Generate particles
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 6 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 3,
  }));

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Content reveal
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: contentRef.current,
            start: "top 80%",
          },
        }
      );

      // Buttons animation
      const buttons = buttonsRef.current?.querySelectorAll("button");
      if (buttons) {
        gsap.fromTo(
          buttons,
          { opacity: 0, y: 30, scale: 0.9 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            stagger: 0.15,
            ease: "back.out(1.7)",
            scrollTrigger: {
              trigger: buttonsRef.current,
              start: "top 85%",
            },
          }
        );
      }

      // Video scale on scroll
      gsap.fromTo(
        videoRef.current,
        { scale: 1 },
        {
          scale: 1.15,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        }
      );
    });

    // GSAP for floating particles
    if (particlesRef.current) {
      const particleElements = particlesRef.current.querySelectorAll(".cta-particle");
      particleElements.forEach((particle) => {
        gsap.to(particle, {
          y: `random(-40, 40)`,
          x: `random(-30, 30)`,
          opacity: 0.6,
          scale: 1.2,
          duration: `random(4, 8)`,
          delay: `random(0, 3)`,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      });
    }

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[80vh] flex items-center justify-center overflow-hidden"
    >
      {/* Video background */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          poster="/videos/why-us/cta-poster.jpg"
        >
          <source src="/videos/why-us/cta-loop.mp4" type="video/mp4" />
          <source src="/videos/why-us/cta-loop.webm" type="video/webm" />
        </video>

        {/* Fallback gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-deep-black via-anthracite to-deep-black" />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 z-[1] bg-deep-black/70" />

      {/* Animated particles */}
      <div ref={particlesRef} className="absolute inset-0 z-[2] pointer-events-none overflow-hidden">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="cta-particle absolute rounded-full bg-champagne/40"
            style={{
              width: particle.size,
              height: particle.size,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
          />
        ))}
      </div>

      {/* Radial gradient overlay */}
      <div className="absolute inset-0 z-[3] bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(11,11,12,0.6)_100%)]" />

      {/* Content */}
      <div ref={contentRef} className="relative z-10 text-center px-6 md:px-12 max-w-4xl mx-auto">
        {/* Eyebrow */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="w-12 h-[1px] bg-champagne/50" />
          <span className="text-sm uppercase tracking-[0.3em] text-champagne">
            Prêt à commencer ?
          </span>
          <div className="w-12 h-[1px] bg-champagne/50" />
        </div>

        {/* Title */}
        <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-white leading-tight mb-6">
          Essayez le crédit
          <br />
          <span className="text-champagne italic">autrement</span>
        </h2>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed mb-12">
          Simulation gratuite, sans engagement.
          <span className="text-white"> Réponse en 24h.</span>
          <br />
          Découvrez si nous pouvons vous accompagner.
        </p>

        {/* CTA Buttons */}
        <div ref={buttonsRef} className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
          <Magnetic>
            <button
              onClick={() => router.push(`/${locale}/tools/simulator`)}
              className="group relative px-10 py-5 bg-champagne text-deep-black font-medium text-base overflow-hidden transition-all duration-500 hover:shadow-xl hover:shadow-champagne/20"
            >
              <span className="relative z-10 flex items-center gap-3">
                Simuler mon crédit
                <svg
                  className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
              <span className="absolute inset-0 bg-white transform translate-y-full transition-transform duration-500 group-hover:translate-y-0" />
            </button>
          </Magnetic>

          <Magnetic>
            <button
              onClick={() => router.push(`/${locale}/products`)}
              className="group relative px-10 py-5 bg-transparent border border-white/30 text-white font-medium text-base overflow-hidden transition-all duration-500 hover:border-champagne/50"
            >
              <span className="relative z-10 flex items-center gap-3">
                Voir nos produits
                <svg
                  className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                </svg>
              </span>
              <span className="absolute inset-0 bg-champagne/10 transform translate-y-full transition-transform duration-500 group-hover:translate-y-0" />
            </button>
          </Magnetic>
        </div>

        {/* Trust badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 md:gap-10">
          <div className="flex items-center gap-2 text-white/40">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-sm">100% sécurisé</span>
          </div>
          <div className="flex items-center gap-2 text-white/40">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-sm">Réponse 24h</span>
          </div>
          <div className="flex items-center gap-2 text-white/40">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-sm">Sans engagement</span>
          </div>
        </div>
      </div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent z-[5]" />
    </section>
  );
}

export default WhyUsCta;
