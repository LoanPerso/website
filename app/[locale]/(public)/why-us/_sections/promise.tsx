"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslations } from "next-intl";

gsap.registerPlugin(ScrollTrigger);

export function WhyUsPromise() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const guaranteeRef = useRef<HTMLDivElement>(null);
  const honestRef = useRef<HTMLDivElement>(null);
  const sealRef = useRef<HTMLDivElement>(null);
  const strikethroughRef = useRef<HTMLSpanElement>(null);
  const t = useTranslations("why-us.promise");

  const weGuarantee = [
    { key: "response", title: t("weGuarantee.items.response.title"), description: t("weGuarantee.items.response.description") },
    { key: "explanation", title: t("weGuarantee.items.explanation.title"), description: t("weGuarantee.items.explanation.description") },
    { key: "instant", title: t("weGuarantee.items.instant.title"), description: t("weGuarantee.items.instant.description") },
    { key: "support", title: t("weGuarantee.items.support.title"), description: t("weGuarantee.items.support.description") },
    { key: "noFees", title: t("weGuarantee.items.noFees.title"), description: t("weGuarantee.items.noFees.description") },
  ];

  const weDoNotPromise = [
    { key: "guaranteed", title: t("weDoNotPromise.items.guaranteed.title"), description: t("weDoNotPromise.items.guaranteed.description") },
    { key: "rates", title: t("weDoNotPromise.items.rates.title"), description: t("weDoNotPromise.items.rates.description") },
    { key: "charity", title: t("weDoNotPromise.items.charity.title"), description: t("weDoNotPromise.items.charity.description") },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header animation
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: headerRef.current,
            start: "top 80%",
          },
        }
      );

      // Strikethrough animation
      const strikethrough = strikethroughRef.current?.querySelector(".strikethrough-line");
      if (strikethrough) {
        gsap.fromTo(
          strikethrough,
          { scaleX: 0, transformOrigin: "left center" },
          {
            scaleX: 1,
            duration: 0.8,
            delay: 0.5,
            ease: "power2.inOut",
            scrollTrigger: {
              trigger: headerRef.current,
              start: "top 70%",
            },
          }
        );
      }

      // Guarantee items
      const guaranteeItems = guaranteeRef.current?.querySelectorAll(".guarantee-item");
      if (guaranteeItems) {
        guaranteeItems.forEach((item, index) => {
          const checkmark = item.querySelector(".checkmark");

          gsap.fromTo(
            item,
            { opacity: 0, x: -20 },
            {
              opacity: 1,
              x: 0,
              duration: 0.5,
              delay: index * 0.1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: guaranteeRef.current,
                start: "top 70%",
              },
            }
          );

          ScrollTrigger.create({
            trigger: item,
            start: "top 75%",
            onEnter: () => {
              if (checkmark) {
                gsap.fromTo(
                  checkmark,
                  { strokeDashoffset: 20 },
                  { strokeDashoffset: 0, duration: 0.4, delay: 0.2, ease: "power2.out" }
                );
              }
            },
            once: true,
          });
        });
      }

      // Honest items
      const honestItems = honestRef.current?.querySelectorAll(".honest-item");
      if (honestItems) {
        gsap.fromTo(
          honestItems,
          { opacity: 0, x: 20 },
          {
            opacity: 1,
            x: 0,
            duration: 0.5,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: honestRef.current,
              start: "top 70%",
            },
          }
        );
      }

      // Seal animation
      ScrollTrigger.create({
        trigger: sealRef.current,
        start: "top 80%",
        onEnter: () => {
          gsap.fromTo(
            sealRef.current,
            { scale: 0.8, opacity: 0, rotation: -10 },
            { scale: 1, opacity: 1, rotation: 0, duration: 0.8, ease: "elastic.out(1, 0.6)" }
          );

          const sealStamp = sealRef.current?.querySelector(".seal-stamp");
          if (sealStamp) {
            gsap.fromTo(sealStamp, { scale: 1.1 }, { scale: 1, duration: 0.3, ease: "back.out(2)" });
          }
        },
        once: true,
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-24 md:py-32 lg:py-40 overflow-hidden bg-background"
    >
      {/* Background Gradients */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-champagne/5 to-transparent opacity-50" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-tl from-background via-background to-transparent opacity-20" />
      </div>

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '30px 30px' }}
      />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 md:px-12">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-20 md:mb-28">
          <span className="inline-block text-xs uppercase tracking-[0.3em] text-champagne mb-4 font-medium">
            {t("eyebrow")}
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-foreground leading-tight">
            {t("titlePromise")}
            <br />
            <span
              ref={strikethroughRef}
              className="relative inline-block text-muted-foreground/50 italic"
            >
              {t("titleNoPromise")}
              <span
                className="strikethrough-line absolute left-0 right-0 top-1/2 h-[3px] md:h-[4px] bg-gradient-to-r from-champagne/80 via-champagne to-champagne/80 rounded-full"
                style={{ transform: "scaleX(0)" }}
              />
            </span>
          </h2>
        </div>

        {/* Two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 max-w-7xl mx-auto">
          {/* We guarantee (Left) */}
          <div ref={guaranteeRef} className="relative">
            <div className="flex items-center gap-5 mb-10">
              <div className="w-14 h-14 rounded-2xl bg-success/10 border border-success/20 flex items-center justify-center shadow-sm">
                <svg className="w-7 h-7 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="text-3xl font-serif text-foreground">
                {t("weGuarantee.title")}
              </h3>
            </div>

            <div className="space-y-4">
              {weGuarantee.map((item) => (
                <div
                  key={item.key}
                  className="guarantee-item group flex items-start gap-5 p-6 bg-white border border-foreground/5 rounded-lg hover:border-success/30 hover:shadow-lg hover:shadow-success/5 transition-all duration-300"
                >
                  <div className="flex-shrink-0 mt-1">
                    <svg className="w-6 h-6 text-success" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" opacity="0.2" />
                      <path
                        className="checkmark"
                        d="M8 12l3 3 5-6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray="20"
                        strokeDashoffset="20"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-foreground mb-1 group-hover:text-success transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="absolute top-10 -left-10 w-full h-full bg-success/5 rounded-3xl -z-10 blur-3xl opacity-50" />
          </div>

          {/* We don't promise (Right) */}
          <div ref={honestRef} className="relative">
            <div className="flex items-center gap-5 mb-10">
              <div className="w-14 h-14 rounded-2xl bg-foreground/5 border border-foreground/10 flex items-center justify-center">
                <svg className="w-7 h-7 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="text-3xl font-serif text-foreground">
                {t("weDoNotPromise.title")}
              </h3>
            </div>

            <div className="space-y-4">
              {weDoNotPromise.map((item) => (
                <div
                  key={item.key}
                  className="honest-item group flex items-start gap-5 p-6 bg-foreground/[0.02] border border-foreground/5 rounded-lg hover:bg-foreground/[0.04] transition-all duration-300"
                >
                  <div className="flex-shrink-0 mt-1.5">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/40 group-hover:bg-muted-foreground transition-colors" />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-foreground mb-1">
                      {item.title}
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Honesty note */}
            <div className="mt-10 p-8 bg-champagne/5 border border-champagne/20 rounded-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-champagne/10 rounded-bl-full" />
              <p className="text-foreground/80 italic font-serif text-lg relative z-10">
                {t("honestyQuote")}
              </p>
            </div>
          </div>
        </div>

        {/* Seal / Signature */}
        <div className="mt-28 flex justify-center">
          <div ref={sealRef} className="relative">
            <div className="seal-stamp w-40 h-40 rounded-full border-[3px] border-champagne/40 flex flex-col items-center justify-center bg-background shadow-soft relative z-10 group cursor-default hover:border-champagne/60 transition-colors duration-500">
              <div className="absolute inset-2 border border-champagne/20 rounded-full" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-champagne font-bold mb-2">
                {t("seal.engagement")}
              </span>
              <span className="font-serif text-4xl text-foreground font-medium">
                {t("seal.initials")}
              </span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground mt-2 font-medium">
                {t("seal.certified")}
              </span>
            </div>
            <div className="absolute inset-0 rounded-full bg-champagne/30 blur-3xl -z-10 scale-125 opacity-40 animate-pulse-slow" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default WhyUsPromise;
