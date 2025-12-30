"use client";

import { useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useLocale } from "next-intl";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ProductCard } from "./_components/product-card";
import {
  MicroCreditIcon,
  ConsumerCreditIcon,
  ProfessionalCreditIcon,
  StudentLoanIcon,
  SalaryAdvanceIcon,
  LeasingIcon,
  LoanConsolidationIcon,
  FinancialCoachingIcon,
} from "./_components/product-icons";

gsap.registerPlugin(ScrollTrigger);

// All products configuration
const allProducts = [
  { key: "microCredit", slug: "micro-credit", icon: <MicroCreditIcon />, variant: "default" as const },
  { key: "consumer", slug: "consumer", icon: <ConsumerCreditIcon />, variant: "dark" as const },
  { key: "professional", slug: "professional", icon: <ProfessionalCreditIcon />, variant: "accent" as const },
  { key: "student", slug: "student", icon: <StudentLoanIcon />, variant: "default" as const },
  { key: "salaryAdvance", slug: "salary-advance", icon: <SalaryAdvanceIcon />, variant: "dark" as const },
  { key: "leasing", slug: "leasing", icon: <LeasingIcon />, variant: "accent" as const },
  { key: "loanConsolidation", slug: "loan-consolidation", icon: <LoanConsolidationIcon />, variant: "default" as const },
  { key: "financialCoaching", slug: "financial-coaching", icon: <FinancialCoachingIcon />, variant: "dark" as const },
];

export default function ProductsPage() {
  const t = useTranslations("products");
  const locale = useLocale();

  // Hero refs
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  // Cards container ref
  const cardsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.3 });

      // Set initial states - simple opacity only
      gsap.set([eyebrowRef.current, line1Ref.current, line2Ref.current, subtitleRef.current, ctaRef.current], {
        opacity: 0
      });

      // Simple fade in sequence
      tl.to(eyebrowRef.current, { opacity: 1, duration: 0.8, ease: "power1.out" }, 0);
      tl.to(line1Ref.current, { opacity: 1, duration: 1, ease: "power1.out" }, 0.2);
      tl.to(line2Ref.current, { opacity: 1, duration: 1, ease: "power1.out" }, 0.4);
      tl.to(subtitleRef.current, { opacity: 1, duration: 0.8, ease: "power1.out" }, 0.8);
      tl.to(ctaRef.current, { opacity: 1, duration: 0.8, ease: "power1.out" }, 1.1);

      // Cards - simple fade
      if (cardsContainerRef.current) {
        const cards = cardsContainerRef.current.querySelectorAll(".product-card");

        gsap.set(cards, { opacity: 0 });

        ScrollTrigger.create({
          trigger: cardsContainerRef.current,
          start: "top 85%",
          onEnter: () => {
            gsap.to(cards, {
              opacity: 1,
              duration: 0.8,
              stagger: 0.1,
              ease: "power1.out"
            });
          },
          once: true
        });
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="bg-background text-foreground">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center py-20">
        <div className="container text-center">
          <p
            ref={eyebrowRef}
            className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-6"
          >
            {t("hero.eyebrow")}
          </p>

          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl xl:text-8xl mb-6 leading-[1.1]">
            <span ref={line1Ref} className="block">
              {t("hero.title.line1")}
            </span>
            <span ref={line2Ref} className="block text-accent">
              {t("hero.title.line2")}
            </span>
          </h1>

          <p
            ref={subtitleRef}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            {t("hero.subtitle")}
          </p>

          <div ref={ctaRef}>
            <Link
              href={`/${locale}/simulateur`}
              className="inline-flex items-center gap-3 px-8 py-4 bg-foreground text-background rounded-full text-base font-medium hover:bg-accent hover:text-white transition-colors duration-200"
            >
              {t("cta.simulate")}
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* All Products Grid */}
      <section className="py-20 lg:py-32">
        <div className="container">
          <div ref={cardsContainerRef} className="grid gap-6 lg:gap-8 md:grid-cols-2 lg:grid-cols-3 items-stretch">
            {allProducts.map((product) => (
              <div key={product.key} className="product-card h-full">
                <ProductCard
                  slug={product.slug}
                  title={t(`products.${product.key}.title`)}
                  tagline={t(`products.${product.key}.tagline`)}
                  range={t(`products.${product.key}.range`)}
                  duration={t(`products.${product.key}.duration`)}
                  rate={t(`products.${product.key}.rate`)}
                  features={t.raw(`products.${product.key}.features`) as string[]}
                  icon={product.icon}
                  variant={product.variant}
                  ctaLabel={t("cta.learnMore")}
                  labels={{
                    amount: t("labels.amount"),
                    duration: t("labels.duration"),
                    rate: t("labels.rate"),
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us Section */}
      <section className="py-20 lg:py-32 bg-secondary/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl">
              {t("whyUs.title")}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {(["transparency", "speed", "coaching"] as const).map((key) => (
              <div key={key} className="text-center">
                <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
                  {key === "transparency" && (
                    <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                  {key === "speed" && (
                    <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  )}
                  {key === "coaching" && (
                    <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </div>
                <h3 className="font-serif text-2xl lg:text-3xl mb-4">
                  {t(`whyUs.items.${key}.title`)}
                </h3>
                <p className="text-muted-foreground text-lg">
                  {t(`whyUs.items.${key}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-40 bg-deep-black text-white">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-serif text-4xl md:text-5xl lg:text-7xl mb-6 leading-tight">
              {t("finalCta.title.line1")}
              <br />
              <span className="text-accent">{t("finalCta.title.line2")}</span>
            </h2>

            <p className="text-lg lg:text-xl text-white/60 mb-12 max-w-xl mx-auto">
              {t("finalCta.subtitle")}
            </p>

            <Link
              href={`/${locale}/simulateur`}
              className="inline-flex items-center gap-3 px-12 py-5 bg-white text-deep-black rounded-full text-lg font-medium hover:bg-accent hover:text-white transition-colors duration-200"
            >
              {t("cta.simulate")}
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>

            <p className="text-sm text-white/40 mt-10">
              {t("finalCta.features")}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
