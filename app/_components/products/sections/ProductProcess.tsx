"use client";

import { useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ProcessVariant } from "../types";

gsap.registerPlugin(ScrollTrigger);

interface ProductProcessProps {
  translationKey: string;
  variant?: ProcessVariant;
}

export function ProductProcess({
  translationKey,
  variant = "stepped",
}: ProductProcessProps) {
  const t = useTranslations(translationKey);

  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);

  const rawSteps = t.raw("process.steps");
  const steps = Array.isArray(rawSteps) ? rawSteps as Array<{ number: string; title: string; description: string }> : [];

  useEffect(() => {
    if (!headerRef.current || !stepsRef.current) return;

    const ctx = gsap.context(() => {
      gsap.set(headerRef.current, { opacity: 0, y: 20 });
      gsap.set(stepsRef.current!.children, { opacity: 0, y: 40 });

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 40%",
        onEnter: () => {
          gsap.to(headerRef.current, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
          });
          gsap.to(stepsRef.current!.children, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.25,
            ease: "power2.out",
            delay: 0.4,
          });
        },
        once: true,
      });
    });

    return () => ctx.revert();
  }, []);

  const renderStepped = () => (
    <div ref={stepsRef} className="max-w-5xl mx-auto">
      {steps.map((step, i) => (
        <div
          key={i}
          className={`flex flex-col md:flex-row items-start gap-8 md:gap-16 py-12 ${
            i !== steps.length - 1 ? "border-b border-border" : ""
          }`}
        >
          <div className="flex-shrink-0">
            <span className="font-serif text-8xl md:text-9xl text-accent/20">
              {step.number}
            </span>
          </div>
          <div className="flex-1 md:pt-8">
            <h3 className="font-serif text-3xl md:text-4xl mb-4">{step.title}</h3>
            <p className="text-xl text-muted-foreground">{step.description}</p>
          </div>
        </div>
      ))}
    </div>
  );

  const renderTimeline = () => (
    <div ref={stepsRef} className="max-w-3xl mx-auto relative">
      <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />
      {steps.map((step, i) => (
        <div key={i} className="relative flex gap-8 pb-12 last:pb-0">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent flex items-center justify-center text-white font-serif z-10">
            {step.number}
          </div>
          <div className="flex-1 pt-2">
            <h3 className="font-serif text-2xl mb-2">{step.title}</h3>
            <p className="text-muted-foreground">{step.description}</p>
          </div>
        </div>
      ))}
    </div>
  );

  const renderCards = () => (
    <div ref={stepsRef} className="grid sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
      {steps.map((step, i) => (
        <div
          key={i}
          className="p-8 rounded-2xl bg-background border border-border text-center"
        >
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
            <span className="text-accent font-serif text-2xl">{step.number}</span>
          </div>
          <h3 className="font-serif text-2xl mb-3">{step.title}</h3>
          <p className="text-muted-foreground">{step.description}</p>
        </div>
      ))}
    </div>
  );

  const renderContent = () => {
    switch (variant) {
      case "timeline":
        return renderTimeline();
      case "cards":
        return renderCards();
      case "stepped":
      default:
        return renderStepped();
    }
  };

  return (
    <section ref={sectionRef} className="py-32">
      <div className="container">
        <div ref={headerRef} className="text-center mb-20">
          <p className="text-sm uppercase tracking-[0.3em] text-accent mb-4">
            {t("process.eyebrow")}
          </p>
          <h2 className="font-serif text-5xl md:text-6xl lg:text-7xl">
            {t("process.title")}
          </h2>
        </div>

        {renderContent()}
      </div>
    </section>
  );
}
