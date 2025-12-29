"use client";

import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Section } from "@/_components/layout/section";

gsap.registerPlugin(ScrollTrigger);

const faqs = [
  {
    question: "Qui peut demander un crédit ?",
    answer:
      "Toute personne majeure résidant en France, même avec un historique bancaire compliqué. Nous analysons votre situation actuelle, pas seulement votre passé.",
  },
  {
    question: "Combien de temps pour recevoir l'argent ?",
    answer:
      "Réponse de principe en 24h, fonds versés sous 48-72h après validation. Tout se fait 100% en ligne.",
  },
  {
    question: "Y a-t-il des frais cachés ?",
    answer:
      "Aucun. Le taux affiché est le taux final. Pas de frais de dossier, pas de pénalités de remboursement anticipé.",
  },
];

export function Faq() {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLDivElement[]>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        itemsRef.current,
        {
          opacity: 0,
          y: 40,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
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

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <Section theme="light" size="xl">
      <div className="text-center mb-16">
        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-4">
          Questions fréquentes
        </p>
        <h2 className="font-serif text-4xl md:text-6xl">
          On vous
          <br />
          <span className="text-accent">répond</span>
        </h2>
      </div>

      <div ref={containerRef} className="max-w-3xl mx-auto space-y-4">
        {faqs.map((faq, i) => (
          <div
            key={i}
            ref={(el) => {
              if (el) itemsRef.current[i] = el;
            }}
            className="border border-border rounded-lg bg-white overflow-hidden"
          >
            <button
              onClick={() => toggleItem(i)}
              className="w-full flex items-center justify-between p-6 text-left hover:bg-secondary/30 transition-colors duration-200"
            >
              <span className="text-lg font-medium text-foreground pr-4">
                {faq.question}
              </span>
              <span
                className={`flex-shrink-0 w-8 h-8 rounded-full border border-border flex items-center justify-center transition-transform duration-300 ${
                  openIndex === i ? "rotate-45 bg-accent border-accent" : ""
                }`}
              >
                <svg
                  className={`w-4 h-4 transition-colors duration-300 ${
                    openIndex === i ? "text-deep-black" : "text-foreground"
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </span>
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ease-out ${
                openIndex === i ? "max-h-48" : "max-h-0"
              }`}
            >
              <p className="px-6 pb-6 text-muted-foreground leading-relaxed">
                {faq.answer}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

export default Faq;
