"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Section } from "@/_components/layout/section";

gsap.registerPlugin(ScrollTrigger);

export function BrandStatement() {
  const containerRef = useRef<HTMLDivElement>(null);
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
            opacity: 0.15,
            y: 30,
          },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: line,
              start: "top 80%",
              end: "top 40%",
              scrub: 1,
            },
          }
        );
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <Section theme="dark" size="xl" className="flex items-center">
      <div ref={containerRef} className="max-w-5xl mx-auto">
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
    </Section>
  );
}

export default BrandStatement;
