"use client";

import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Magnetic from "@/_components/ui/magnetic-button";

gsap.registerPlugin(ScrollTrigger);

interface Particle {
  id: number;
  size: number;
  x: number;
  y: number;
  delay: number;
}

export function WhyUsCta() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("why-us.cta");

  const [particles, setParticles] = useState<Particle[]>([]);

  // Generate particles on client side
  useEffect(() => {
    const newParticles = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      size: Math.random() * 5 + 2,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 3,
    }));
    setParticles(newParticles);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Content reveal
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 50 },
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
          { opacity: 0, y: 20, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: "back.out(1.5)",
            scrollTrigger: {
              trigger: buttonsRef.current,
              start: "top 90%",
            },
          }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  // Particle animation
  useEffect(() => {
    if (particles.length === 0 || !particlesRef.current) return;

    const ctx = gsap.context(() => {
      const particleElements = particlesRef.current!.querySelectorAll(".cta-particle");
      particleElements.forEach((particle) => {
        gsap.to(particle, {
          y: `random(-50, 50)`,
          x: `random(-30, 30)`,
          opacity: "random(0.3, 0.7)",
          scale: "random(0.8, 1.2)",
          duration: `random(5, 10)`,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      });
    });

    return () => ctx.revert();
  }, [particles]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-deep-black max-w-[100vw]"
      style={{ overflowX: 'clip' }}
    >
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Deep Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-deep-black via-[#1a1a1a] to-[#0f0f0f]" />
        
        {/* Animated Glows */}
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-champagne/10 blur-[100px] animate-blob" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-champagne/5 blur-[120px] animate-blob animation-delay-4000" />
        
        {/* Grid Overlay */}
        <div 
            className="absolute inset-0 opacity-[0.05]" 
            style={{ 
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', 
                backgroundSize: '50px 50px' 
            }} 
        />
      </div>

      {/* Animated particles */}
      <div ref={particlesRef} className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="cta-particle absolute rounded-full bg-champagne"
            style={{
              width: particle.size,
              height: particle.size,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              boxShadow: `0 0 ${particle.size * 2}px ${particle.size}px rgba(220, 180, 100, 0.2)`
            }}
          />
        ))}
      </div>

      {/* Radial gradient vignette */}
      <div className="absolute inset-0 z-[2] bg-[radial-gradient(circle_at_center,transparent_0%,rgba(5,5,5,0.6)_100%)] pointer-events-none" />

      {/* Content */}
      <div ref={contentRef} className="relative z-10 text-center px-6 md:px-12 py-20 md:py-28 max-w-5xl mx-auto">
        {/* Eyebrow */}
        <div className="flex items-center justify-center gap-6 mb-10 opacity-80">
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-champagne/50 to-transparent" />
          <span className="text-xs uppercase tracking-[0.4em] text-champagne font-medium">
            {t("eyebrow")}
          </span>
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-champagne/50 to-transparent" />
        </div>

        {/* Title */}
        <h2 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light text-white leading-[1.1] mb-8 tracking-tight">
          {t("title")}
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-champagne via-yellow-200 to-champagne italic">
            {t("titleAccent")}
          </span>
        </h2>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed mb-16 font-light">
          {t("subtitle")}
          <strong className="text-white font-medium"> {t("subtitleHighlight")}</strong>
          <br />
          {t("subtitleEnd")}
        </p>

        {/* CTA Buttons */}
        <div ref={buttonsRef} className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Magnetic strength={0.2}>
            <button
              onClick={() => router.push(`/${locale}/tools/simulator`)}
              className="group relative px-12 py-6 bg-champagne text-deep-black font-semibold text-lg rounded-sm overflow-hidden transition-all duration-300 hover:shadow-[0_0_40px_-10px_rgba(200,160,80,0.5)]"
            >
              <span className="relative z-10 flex items-center gap-3">
                {t("primaryButton")}
                <svg
                  className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
              <span className="absolute inset-0 bg-white/20 transform translate-y-full transition-transform duration-500 group-hover:translate-y-0" />
            </button>
          </Magnetic>

          <Magnetic strength={0.2}>
            <button
              onClick={() => router.push(`/${locale}/products`)}
              className="group relative px-12 py-6 bg-transparent border border-white/20 text-white font-medium text-lg rounded-sm overflow-hidden transition-all duration-300 hover:border-white/50 hover:bg-white/5"
            >
              <span className="relative z-10 flex items-center gap-3">
                {t("secondaryButton")}
                <svg
                  className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </button>
          </Magnetic>
        </div>

        {/* Trust badges */}
        <div className="mt-20 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          <div className="flex items-center gap-3 text-white/40 hover:text-white/60 transition-colors cursor-default">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-sm tracking-wide uppercase">{t("badges.secure")}</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-white/10 hidden sm:block" />
          <div className="flex items-center gap-3 text-white/40 hover:text-white/60 transition-colors cursor-default">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-sm tracking-wide uppercase">{t("badges.response")}</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-white/10 hidden sm:block" />
          <div className="flex items-center gap-3 text-white/40 hover:text-white/60 transition-colors cursor-default">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-sm tracking-wide uppercase">{t("badges.noCommitment")}</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 20s infinite;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  );
}

export default WhyUsCta;