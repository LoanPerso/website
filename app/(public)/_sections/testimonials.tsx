"use client";

import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Section } from "@/_components/layout/section";

gsap.registerPlugin(ScrollTrigger);

const testimonials = [
  {
    quote: "Les banques m'avaient tous refusé. Quickfund m'a expliqué pourquoi et m'a donné une chance. 3 mois plus tard, j'ai remboursé sans problème.",
    author: "Marie L.",
    role: "Freelance designer",
    initials: "ML",
  },
  {
    quote: "Le coaching financier inclus m'a vraiment aidé à mieux gérer mon budget. C'est pas juste un crédit, c'est un accompagnement.",
    author: "Thomas R.",
    role: "Étudiant",
    initials: "TR",
  },
  {
    quote: "Réponse en 6 heures, argent le lendemain. Et surtout, des vrais humains au téléphone quand j'avais des questions.",
    author: "Sophie M.",
    role: "Auto-entrepreneur",
    initials: "SM",
  },
];

export function Testimonials() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardsRef.current,
        {
          opacity: 0,
          y: 60,
          rotateY: -15,
        },
        {
          opacity: 1,
          y: 0,
          rotateY: 0,
          duration: 1,
          stagger: 0.2,
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
    <Section theme="light" size="xl">
      <div className="text-center mb-16">
        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-4">
          Témoignages
        </p>
        <h2 className="font-serif text-4xl md:text-6xl">
          Ils nous font
          <br />
          <span className="text-accent">confiance</span>
        </h2>
      </div>

      <div
        ref={containerRef}
        className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto perspective-1000"
      >
        {testimonials.map((testimonial, i) => (
          <div
            key={i}
            ref={(el) => {
              if (el) cardsRef.current[i] = el;
            }}
            className="group relative p-8 bg-white border border-border rounded-lg shadow-soft hover:shadow-crisp transition-all duration-500"
            style={{ transformStyle: "preserve-3d" }}
            onMouseEnter={() => setActiveIndex(i)}
          >
            {/* Quote mark */}
            <div className="absolute -top-4 left-8 text-6xl font-serif text-accent/20">
              &ldquo;
            </div>

            {/* Quote */}
            <p className="relative text-lg leading-relaxed text-foreground/80 mb-8 pt-4">
              {testimonial.quote}
            </p>

            {/* Author */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent font-medium">
                {testimonial.initials}
              </div>
              <div>
                <p className="font-medium text-foreground">{testimonial.author}</p>
                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
              </div>
            </div>

            {/* Hover accent line */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-accent transform scale-x-0 origin-left transition-transform duration-500 group-hover:scale-x-100 rounded-b-lg" />
          </div>
        ))}
      </div>

      {/* Navigation dots (mobile) */}
      <div className="flex justify-center gap-2 mt-8 md:hidden">
        {testimonials.map((_, i) => (
          <button
            key={i}
            className={`w-2 h-2 rounded-full transition-colors duration-300 ${
              activeIndex === i ? "bg-accent" : "bg-border"
            }`}
            onClick={() => setActiveIndex(i)}
          />
        ))}
      </div>
    </Section>
  );
}

export default Testimonials;
