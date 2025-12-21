"use client";

import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Section } from "@/_components/layout/section";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    title: "Transparence totale",
    description: "On vous dit toujours pourquoi. Accepté ou refusé, vous saurez la raison exacte.",
    image: "/images/transparency.jpg",
  },
  {
    title: "Profils atypiques",
    description: "Freelances, étudiants, refusés bancaires... On comprend que chaque situation est unique.",
    image: "/images/profiles.jpg",
  },
  {
    title: "Coaching financier",
    description: "Inclus gratuitement. On vous accompagne pour gérer votre budget, pas juste pour prêter.",
    image: "/images/coaching.jpg",
  },
  {
    title: "Flexibilité totale",
    description: "Report d'échéance, remboursement anticipé gratuit, restructuration si besoin.",
    image: "/images/flexibility.jpg",
  },
];

export function FeaturesGrid() {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLDivElement[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        itemsRef.current,
        {
          opacity: 0,
          y: 80,
        },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 75%",
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <Section theme="dark" size="xl">
      <div className="text-center mb-16">
        <p className="text-sm uppercase tracking-[0.3em] text-accent mb-4">
          Pourquoi nous
        </p>
        <h2 className="font-serif text-4xl md:text-6xl text-white">
          Ce qui nous rend
          <br />
          <span className="text-accent">différents</span>
        </h2>
      </div>

      <div
        ref={containerRef}
        className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto"
      >
        {features.map((feature, i) => (
          <div
            key={i}
            ref={(el) => {
              if (el) itemsRef.current[i] = el;
            }}
            className="group relative p-8 md:p-12 border border-white/10 rounded-lg overflow-hidden cursor-pointer transition-colors duration-500 hover:border-accent/50"
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {/* Background gradient on hover */}
            <div
              className={`absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent transition-opacity duration-500 ${
                hoveredIndex === i ? "opacity-100" : "opacity-0"
              }`}
            />

            {/* Content */}
            <div className="relative z-10">
              <span className="text-accent text-sm tracking-wider mb-4 block">
                0{i + 1}
              </span>
              <h3 className="font-serif text-2xl md:text-3xl text-white mb-4 transition-transform duration-300 group-hover:translate-x-2">
                {feature.title}
              </h3>
              <p className="text-white/60 text-lg leading-relaxed">
                {feature.description}
              </p>

              {/* Arrow on hover */}
              <div
                className={`mt-6 flex items-center gap-2 text-accent transition-all duration-300 ${
                  hoveredIndex === i
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-4"
                }`}
              >
                <span className="text-sm uppercase tracking-wider">En savoir plus</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </div>
            </div>

            {/* Corner decoration */}
            <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden">
              <div
                className={`absolute top-0 right-0 w-[1px] h-20 bg-accent origin-top transition-transform duration-500 ${
                  hoveredIndex === i ? "scale-y-100" : "scale-y-0"
                }`}
              />
              <div
                className={`absolute top-0 right-0 w-20 h-[1px] bg-accent origin-right transition-transform duration-500 delay-100 ${
                  hoveredIndex === i ? "scale-x-100" : "scale-x-0"
                }`}
              />
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

export default FeaturesGrid;
