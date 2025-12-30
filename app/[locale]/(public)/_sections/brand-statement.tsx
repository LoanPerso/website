"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function BrandStatement() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const linesRef = useRef<HTMLDivElement[]>([]);

  const lines = [
    "Les banques vous ignorent.",
    "Nous, on vous écoute.",
    "Crédit transparent pour ceux",
    "que le système oublie.",
  ];

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      linesRef.current.forEach((line, i) => {
        gsap.fromTo(
          line,
          {
            opacity: 0,
            y: 50,
          },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 60%",
              end: "top 20%",
              scrub: 1,
            },
          }
        );
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen w-full flex items-center justify-center z-[60]"
      style={{ backgroundColor: "transparent" }}
    >
      <div className="container mx-auto px-6 md:px-8">
        <div ref={containerRef} className="max-w-5xl mx-auto text-center">
          {lines.map((line, i) => (
            <div
              key={i}
              ref={(el) => {
                if (el) linesRef.current[i] = el;
              }}
              className="overflow-hidden"
            >
              <p
                className={`font-serif text-4xl md:text-6xl lg:text-7xl leading-tight mb-4 ${
                  i === 1 || i === 3 ? "text-accent" : "text-white"
                }`}
              >
                {line}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default BrandStatement;
