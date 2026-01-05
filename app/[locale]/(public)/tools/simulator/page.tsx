"use client";

import { useRef, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SimulatorWidget, AdvancedSimulator, SimulatorModeToggle } from "@/_components/tools";

gsap.registerPlugin(ScrollTrigger);

type SimulatorMode = "simple" | "advanced";

export default function SimulatorPage() {
  const t = useTranslations("tools");
  const [mode, setMode] = useState<SimulatorMode>("advanced");

  const heroRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const simulatorRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.2 });

      gsap.set([titleRef.current, subtitleRef.current], { opacity: 0, y: 30 });
      gsap.set(simulatorRef.current, { opacity: 0, y: 40 });
      gsap.set(featuresRef.current?.children || [], { opacity: 0, y: 20 });

      tl.to(titleRef.current, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" });
      tl.to(subtitleRef.current, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, "-=0.5");
      tl.to(simulatorRef.current, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, "-=0.4");
      tl.to(featuresRef.current?.children || [], {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out"
      }, "-=0.4");
    }, heroRef);

    return () => ctx.revert();
  }, []);

  // Animate mode switch
  const handleModeChange = (newMode: SimulatorMode) => {
    if (simulatorRef.current) {
      gsap.to(simulatorRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          setMode(newMode);
          gsap.to(simulatorRef.current, {
            opacity: 1,
            y: 0,
            duration: 0.4,
            ease: "power3.out"
          });
        }
      });
    } else {
      setMode(newMode);
    }
  };

  const features = [
    { icon: "⚡", title: t("simulator.features.instant.title"), description: t("simulator.features.instant.description") },
    { icon: "🔒", title: t("simulator.features.noCommitment.title"), description: t("simulator.features.noCommitment.description") },
    { icon: "📊", title: t("simulator.features.transparent.title"), description: t("simulator.features.transparent.description") },
    { icon: "💬", title: t("simulator.features.explained.title"), description: t("simulator.features.explained.description") },
  ];

  return (
    <main className="bg-background">
      {/* Hero Section */}
      <section ref={heroRef} className="pt-32 pb-20 lg:pt-40 lg:pb-32">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-12 lg:mb-16">
            <p className="text-sm uppercase tracking-[0.3em] text-accent mb-4">
              {t("simulator.eyebrow")}
            </p>
            <h1 ref={titleRef} className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[0.95] tracking-tight mb-6">
              {t("simulator.title")}
            </h1>
            <p ref={subtitleRef} className="text-lg sm:text-xl text-muted-foreground">
              {t("simulator.subtitle")}
            </p>
          </div>

          {/* Mode Toggle */}
          <SimulatorModeToggle
            mode={mode}
            onModeChange={handleModeChange}
            t={t}
          />

          {/* Simulator Widget */}
          <div ref={simulatorRef} className={mode === "simple" ? "max-w-3xl mx-auto" : "max-w-5xl mx-auto"}>
            {mode === "simple" ? (
              <SimulatorWidget />
            ) : (
              <AdvancedSimulator />
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32 bg-secondary/30">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-serif text-3xl sm:text-4xl text-center mb-12 lg:mb-16">
              {t("simulator.whySimulate")}
            </h2>
            <div ref={featuresRef} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, i) => (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-background border border-border text-center"
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="font-serif text-xl mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 lg:py-32">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-serif text-3xl sm:text-4xl text-center mb-12">
              {t("simulator.faq.title")}
            </h2>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <details
                  key={i}
                  className="group p-6 rounded-2xl bg-secondary/30 border border-border"
                >
                  <summary className="flex justify-between items-center cursor-pointer list-none">
                    <span className="font-serif text-lg pr-4">
                      {t(`simulator.faq.q${i}.question`)}
                    </span>
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-4 text-muted-foreground">
                    {t(`simulator.faq.q${i}.answer`)}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
