"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useLocale } from "next-intl";

export default function MicroCreditPage() {
  const t = useTranslations("products.microCredit");
  const locale = useLocale();

  const stats = [
    { value: t("stats.minAmount.value"), label: t("stats.minAmount.label") },
    { value: t("stats.maxAmount.value"), label: t("stats.maxAmount.label") },
    { value: t("stats.delay.value"), label: t("stats.delay.label") },
  ];

  const problemItems = t.raw("problem.items") as Array<{ number: string; text: string }>;
  const solutionFeatures = t.raw("solution.features") as Array<{ title: string; description: string }>;
  const audienceProfiles = t.raw("audience.profiles") as Array<{ title: string; description: string }>;
  const processSteps = t.raw("process.steps") as Array<{ number: string; title: string; description: string }>;

  return (
    <div className="bg-background text-foreground">
      {/* Hero - Immersive full screen */}
      <section className="min-h-screen relative flex flex-col justify-center overflow-hidden">
        {/* Background accent */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-accent/5 -skew-x-12 translate-x-1/4" />

        <div className="container relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left - Content */}
            <div className="space-y-8">
              <p className="text-sm uppercase tracking-[0.3em] text-accent font-medium">
                {t("hero.eyebrow")}
              </p>

              <div className="space-y-4">
                <h1 className="font-serif text-7xl md:text-8xl lg:text-9xl leading-[0.9] tracking-tight">
                  {t("hero.title")}
                </h1>
                <p className="text-3xl md:text-4xl lg:text-5xl font-serif text-muted-foreground">
                  {t("hero.subtitle")}
                </p>
              </div>

              <p className="text-xl text-muted-foreground max-w-md">
                {t("hero.description")}
              </p>

              <Link
                href={`/${locale}/simulateur`}
                className="inline-flex items-center gap-3 px-8 py-4 bg-foreground text-background rounded-full text-base font-medium hover:bg-accent hover:text-white transition-colors duration-300"
              >
                {t("hero.cta")}
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            {/* Right - Stats cards stacked */}
            <div className="relative">
              <div className="space-y-4">
                {stats.map((stat, i) => (
                  <div
                    key={i}
                    className={`p-6 rounded-2xl border ${
                      i === 0
                        ? "bg-foreground text-background border-foreground ml-0 lg:ml-12"
                        : i === 1
                        ? "bg-accent/10 border-accent/20 ml-4 lg:ml-20"
                        : "bg-background border-border ml-8 lg:ml-8"
                    }`}
                  >
                    <p className={`text-4xl md:text-5xl font-serif mb-2 ${i === 0 ? "text-background" : ""}`}>
                      {stat.value}
                    </p>
                    <p className={`text-sm uppercase tracking-wider ${
                      i === 0 ? "text-background/60" : "text-muted-foreground"
                    }`}>
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-muted-foreground/50 rounded-full" />
          </div>
        </div>
      </section>

      {/* Problem Section - Horizontal layout with big numbers */}
      <section className="py-32 bg-deep-black text-white overflow-hidden">
        <div className="container">
          <div className="mb-20">
            <p className="text-sm uppercase tracking-[0.3em] text-accent mb-4">
              {t("problem.eyebrow")}
            </p>
            <h2 className="font-serif text-5xl md:text-6xl lg:text-7xl max-w-4xl">
              {t("problem.title")}
            </h2>
          </div>

          {/* Horizontal scroll-like layout */}
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {problemItems.map((item, i) => (
              <div key={i} className="group">
                <p className="font-serif text-6xl md:text-7xl lg:text-8xl text-white/10 group-hover:text-accent/30 transition-colors duration-500 mb-4">
                  {item.number}
                </p>
                <p className="text-lg text-white/60 max-w-xs">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section - Bento grid */}
      <section className="py-32">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
            {/* Left - Sticky header */}
            <div className="lg:sticky lg:top-32 space-y-6">
              <p className="text-sm uppercase tracking-[0.3em] text-accent">
                {t("solution.eyebrow")}
              </p>
              <h2 className="font-serif text-5xl md:text-6xl leading-[1.1]">
                {t("solution.title")}
              </h2>
              <p className="text-xl text-muted-foreground">
                {t("solution.description")}
              </p>
            </div>

            {/* Right - Bento grid */}
            <div className="grid grid-cols-2 gap-4">
              {solutionFeatures.map((feature, i) => (
                <div
                  key={i}
                  className={`p-6 lg:p-8 rounded-2xl border border-border hover:border-accent/30 transition-colors duration-300 ${
                    i === 0 ? "col-span-2 bg-accent/5" :
                    i === 3 ? "col-span-2 bg-foreground text-background" :
                    "bg-background"
                  }`}
                >
                  <h3 className={`font-serif text-2xl lg:text-3xl mb-3 ${i === 3 ? "text-background" : ""}`}>
                    {feature.title}
                  </h3>
                  <p className={`${i === 3 ? "text-background/70" : "text-muted-foreground"}`}>
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Audience Section - Creative offset cards */}
      <section className="py-32 bg-secondary/30">
        <div className="container">
          <div className="text-center mb-20">
            <p className="text-sm uppercase tracking-[0.3em] text-accent mb-4">
              {t("audience.eyebrow")}
            </p>
            <h2 className="font-serif text-5xl md:text-6xl lg:text-7xl">
              {t("audience.title")}
            </h2>
          </div>

          {/* Offset grid */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {audienceProfiles.map((profile, i) => (
              <div
                key={i}
                className={`p-8 rounded-2xl bg-background border border-border ${
                  i % 2 === 1 ? "md:translate-y-12" : ""
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-6">
                  <span className="text-accent font-serif text-xl">{i + 1}</span>
                </div>
                <h3 className="font-serif text-2xl mb-3">{profile.title}</h3>
                <p className="text-muted-foreground">{profile.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section - Large stepped numbers */}
      <section className="py-32">
        <div className="container">
          <div className="text-center mb-20">
            <p className="text-sm uppercase tracking-[0.3em] text-accent mb-4">
              {t("process.eyebrow")}
            </p>
            <h2 className="font-serif text-5xl md:text-6xl lg:text-7xl">
              {t("process.title")}
            </h2>
          </div>

          {/* Steps */}
          <div className="max-w-5xl mx-auto">
            {processSteps.map((step, i) => (
              <div
                key={i}
                className={`flex flex-col md:flex-row items-start gap-8 md:gap-16 py-12 ${
                  i !== processSteps.length - 1 ? "border-b border-border" : ""
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
        </div>
      </section>

      {/* Final CTA - Full bleed */}
      <section className="py-32 lg:py-48 bg-foreground text-background relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-accent/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-accent/5 rounded-full translate-x-1/2 translate-y-1/2" />

        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-serif text-5xl md:text-6xl lg:text-7xl mb-6">
              {t("finalCta.title")}
            </h2>
            <p className="text-xl text-background/60 mb-12">
              {t("finalCta.subtitle")}
            </p>

            <Link
              href={`/${locale}/simulateur`}
              className="inline-flex items-center gap-3 px-12 py-5 bg-accent text-white rounded-full text-lg font-medium hover:bg-dark-gold transition-colors duration-300"
            >
              {t("finalCta.cta")}
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>

            <p className="text-sm text-background/40 mt-8">
              {t("finalCta.reassurance")}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
