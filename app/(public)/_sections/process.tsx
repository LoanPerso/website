"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Section } from "@/_components/layout/section";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    number: "01",
    title: "Simulez",
    description: "2 minutes pour connaître votre éligibilité et votre offre personnalisée.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Envoyez",
    description: "Documents simples, vérification rapide. Pas de paperasse inutile.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Réponse",
    description: "24h maximum. Et si c'est non, on vous explique pourquoi.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    number: "04",
    title: "Recevez",
    description: "Virement instantané dès l'acceptation. L'argent sur votre compte en quelques heures.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export function Process() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement[]>([]);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Animate the progress line
      gsap.fromTo(
        lineRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 60%",
            end: "bottom 40%",
            scrub: 1,
          },
        }
      );

      // Animate each step
      stepsRef.current.forEach((step, i) => {
        gsap.fromTo(
          step,
          {
            opacity: 0,
            x: i % 2 === 0 ? -50 : 50,
          },
          {
            opacity: 1,
            x: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: step,
              start: "top 80%",
            },
          }
        );
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <Section theme="light" size="xl">
      <div className="text-center mb-20">
        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-4">
          Comment ça marche
        </p>
        <h2 className="font-serif text-4xl md:text-6xl">
          Simple. Rapide.
          <br />
          <span className="text-accent">Transparent.</span>
        </h2>
      </div>

      <div ref={containerRef} className="relative max-w-4xl mx-auto">
        {/* Vertical line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-border -translate-x-1/2 hidden md:block">
          <div
            ref={lineRef}
            className="absolute inset-0 bg-accent origin-top"
          />
        </div>

        {/* Steps */}
        <div className="space-y-16 md:space-y-24">
          {steps.map((step, i) => (
            <div
              key={i}
              ref={(el) => {
                if (el) stepsRef.current[i] = el;
              }}
              className={`relative grid md:grid-cols-2 gap-8 items-center ${
                i % 2 === 0 ? "" : "md:direction-rtl"
              }`}
            >
              {/* Content */}
              <div className={`${i % 2 === 0 ? "md:text-right md:pr-16" : "md:text-left md:pl-16 md:col-start-2"}`}>
                <div className={`inline-flex items-center gap-4 mb-4 ${i % 2 === 0 ? "md:flex-row-reverse" : ""}`}>
                  <span className="text-accent text-sm font-medium">{step.number}</span>
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                    {step.icon}
                  </div>
                </div>
                <h3 className="font-serif text-3xl md:text-4xl mb-3">{step.title}</h3>
                <p className="text-muted-foreground text-lg">{step.description}</p>
              </div>

              {/* Circle indicator on line (desktop) */}
              <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-4 h-4 rounded-full bg-accent border-4 border-background" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

export default Process;
