"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { HorizontalSection, HorizontalPanel } from "@/_components/layout/horizontal-section";
import Magnetic from "@/_components/ui/magnetic-button";

gsap.registerPlugin(ScrollTrigger);

const products = [
  {
    number: "01",
    title: "Micro-crédit",
    range: "20€ - 500€",
    description: "Pour les petits besoins urgents. Réponse en moins de 24h, sans paperasse inutile.",
    features: ["Montants dès 20€", "Approbation rapide", "Sans justificatif complexe"],
    color: "bg-accent/10",
  },
  {
    number: "02",
    title: "Crédit Conso",
    range: "500€ - 5 000€",
    description: "Financez vos projets personnels avec transparence. On vous dit toujours pourquoi.",
    features: ["Taux compétitifs", "Échéances flexibles", "Remboursement anticipé gratuit"],
    color: "bg-deep-black text-white",
  },
  {
    number: "03",
    title: "Crédit Pro",
    range: "1 000€ - 10 000€",
    description: "Pour les freelances et TPEs. On comprend les revenus variables.",
    features: ["Profils atypiques acceptés", "Analyse personnalisée", "Coaching inclus"],
    color: "bg-accent/10",
  },
];

export function HorizontalProducts() {
  const numbersRef = useRef<HTMLSpanElement[]>([]);
  const titlesRef = useRef<HTMLHeadingElement[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate elements as they come into view during horizontal scroll
      numbersRef.current.forEach((num) => {
        if (!num) return;
        gsap.fromTo(
          num,
          { opacity: 0.2, scale: 0.8 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.5,
            scrollTrigger: {
              trigger: num,
              start: "left 80%",
              end: "left 30%",
              scrub: 1,
              horizontal: true,
            },
          }
        );
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="relative z-[70]">
      {/* Horizontal scroll section - header integrated as first panel */}
      <HorizontalSection panels={products.length + 2} className="bg-background">
        {/* Intro Panel */}
        <HorizontalPanel className="bg-background">
          <div className="text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-6">
              Nos Solutions
            </p>
            <h2 className="font-serif text-5xl md:text-7xl lg:text-8xl mb-8">
              Un crédit pour
              <br />
              <span className="text-accent">chaque besoin</span>
            </h2>
            <div className="flex items-center justify-center gap-3 text-muted-foreground">
              <span className="text-sm uppercase tracking-wider">Scroll</span>
              <svg className="w-6 h-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </div>
        </HorizontalPanel>

        {products.map((product, i) => (
          <HorizontalPanel key={i} className={product.color}>
            <div className="max-w-4xl w-full grid md:grid-cols-2 gap-12 items-center">
              {/* Left: Number & Title */}
              <div>
                <span
                  ref={(el) => {
                    if (el) numbersRef.current[i] = el;
                  }}
                  className="block font-serif text-[12rem] md:text-[16rem] leading-none opacity-20"
                >
                  {product.number}
                </span>
              </div>

              {/* Right: Content */}
              <div>
                <p className="text-accent text-sm uppercase tracking-wider mb-2">
                  {product.range}
                </p>
                <h3
                  ref={(el) => {
                    if (el) titlesRef.current[i] = el;
                  }}
                  className="font-serif text-4xl md:text-5xl lg:text-6xl mb-6"
                >
                  {product.title}
                </h3>
                <p className="text-lg text-muted-foreground mb-8 max-w-md">
                  {product.description}
                </p>
                <ul className="space-y-3 mb-8">
                  {product.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </HorizontalPanel>
        ))}

        {/* CTA Panel */}
        <HorizontalPanel className="bg-deep-black">
          <div className="text-center text-white">
            <p className="text-accent text-sm uppercase tracking-wider mb-4">
              Et bien plus encore
            </p>
            <h3 className="font-serif text-4xl md:text-6xl mb-8">
              Découvrez tous
              <br />
              nos produits
            </h3>
            <Magnetic>
              <button className="px-8 py-4 border border-white/20 rounded-full text-white hover:bg-white hover:text-deep-black transition-colors duration-300">
                Voir tout →
              </button>
            </Magnetic>
          </div>
        </HorizontalPanel>
      </HorizontalSection>
    </div>
  );
}

export default HorizontalProducts;
