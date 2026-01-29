"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslations } from "next-intl";

gsap.registerPlugin(ScrollTrigger);

export function WhyUsStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const quoteRef = useRef<HTMLBlockquoteElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const visionHeaderRef = useRef<HTMLDivElement>(null);
  const timelineProgressRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("why-us.story");

  const visionSteps = [
    {
      year: t("vision.steps.today.year"),
      title: t("vision.steps.today.title"),
      description: t("vision.steps.today.description"),
    },
    {
      year: t("vision.steps.fiveYears.year"),
      title: t("vision.steps.fiveYears.title"),
      description: t("vision.steps.fiveYears.description"),
    },
    {
      year: t("vision.steps.tenYears.year"),
      title: t("vision.steps.tenYears.title"),
      description: t("vision.steps.tenYears.description"),
    },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Parallax on image container
      if (imageContainerRef.current && sectionRef.current) {
        gsap.fromTo(
          imageContainerRef.current,
          { y: 50 },
          {
            y: -50,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
            },
          }
        );
      }

      // Content reveal
      const textElements = contentRef.current?.querySelectorAll(".reveal-text");
      if (textElements && textElements.length > 0) {
        gsap.fromTo(
          textElements,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: "power2.out",
            scrollTrigger: {
              trigger: contentRef.current,
              start: "top 75%",
            },
          }
        );
      }

      // Quote animation
      if (quoteRef.current) {
        gsap.fromTo(
          quoteRef.current,
          { opacity: 0, scale: 0.98 },
          {
            opacity: 1,
            scale: 1,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: quoteRef.current,
              start: "top 80%",
            },
          }
        );
      }

      // Vision Section Animations
      const visionHeader = visionHeaderRef.current;

      if (visionHeader) {
        const headerTitle = visionHeader.querySelector("h3");
        const headerSubline = visionHeader.querySelector(".vision-subline");
        const headerIntro = visionHeader.querySelector(".vision-intro");

        if (headerTitle) {
          gsap.fromTo(
            headerTitle,
            { opacity: 0, y: 40 },
            {
              opacity: 1,
              y: 0,
              duration: 1,
              ease: "power3.out",
              scrollTrigger: {
                trigger: visionHeader,
                start: "top 80%",
              },
            }
          );
        }

        if (headerSubline) {
          gsap.fromTo(
            headerSubline,
            { scaleX: 0 },
            {
              scaleX: 1,
              duration: 0.8,
              ease: "power2.out",
              scrollTrigger: {
                trigger: visionHeader,
                start: "top 75%",
              },
            }
          );
        }

        if (headerIntro) {
          gsap.fromTo(
            headerIntro,
            { opacity: 0, y: 20 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: "power2.out",
              scrollTrigger: {
                trigger: visionHeader,
                start: "top 70%",
              },
            }
          );
        }
      }

      // Timeline progress line animation
      if (timelineProgressRef.current && timelineRef.current) {
        gsap.fromTo(
          timelineProgressRef.current,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
              trigger: timelineRef.current,
              start: "top 60%",
              end: "bottom 40%",
              scrub: 0.5,
            },
          }
        );
      }

      // Timeline items animations
      const timelineItems = timelineRef.current?.querySelectorAll(".timeline-item");
      if (timelineItems && timelineItems.length > 0) {
        timelineItems.forEach((item, index) => {
          const dot = item.querySelector(".timeline-dot");
          const dotInner = item.querySelector(".timeline-dot-inner");
          const dotGlow = item.querySelector(".timeline-dot-glow");
          const card = item.querySelector(".timeline-card");

          const itemTl = gsap.timeline({
            scrollTrigger: {
              trigger: item,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          });

          if (dot) {
            itemTl.fromTo(
              dot,
              { scale: 0 },
              { scale: 1, duration: 0.4, ease: "back.out(2)" },
              0
            );
          }

          if (dotInner) {
            itemTl.fromTo(
              dotInner,
              { scale: 0 },
              { scale: 1, duration: 0.3, ease: "power2.out" },
              0.15
            );
          }

          if (dotGlow) {
            itemTl.fromTo(
              dotGlow,
              { opacity: 0, scale: 0.5 },
              { opacity: 0.6, scale: 1.2, duration: 0.5, ease: "power2.out" },
              0.1
            );
          }

          if (card) {
            itemTl.fromTo(
              card,
              { opacity: 0, y: 20 },
              { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
              0.2
            );
          }
        });
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-24 md:py-32 lg:py-40 bg-background overflow-hidden"
    >
      {/* Background Texture */}
      <div className="absolute inset-0 opacity-[0.4] pointer-events-none mix-blend-multiply">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-pattern-story" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-foreground/5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern-story)" />
        </svg>
      </div>

      <div className="relative z-10 container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* Left: Estonian Flag Illustration */}
          <div ref={imageContainerRef} className="relative order-2 lg:order-1 flex items-center justify-center">
            <div className="relative">
              <img
                src="/images/story-illustration.png"
                alt="Drapeau estonien"
                className="w-full max-w-md lg:max-w-lg h-auto object-contain"
              />
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-3 bg-white/90 backdrop-blur-md rounded-full shadow-soft border border-foreground/5">
                <div className="w-2 h-2 rounded-full bg-success" />
                <span className="text-sm text-foreground font-medium tracking-wide">{t("badge")}</span>
              </div>
            </div>
          </div>

          {/* Right: Content */}
          <div ref={contentRef} className="order-1 lg:order-2">
            <span className="reveal-text inline-block text-xs uppercase tracking-[0.3em] text-champagne font-medium mb-6">
              {t("eyebrow")}
            </span>

            <h2 className="reveal-text font-serif text-4xl sm:text-5xl md:text-6xl font-light text-foreground leading-[1.1] mb-10">
              {t("title")}
              <br />
              <span className="text-muted-foreground/60">{t("titleAccent")}</span>
            </h2>

            <div className="reveal-text space-y-8 text-lg text-muted-foreground leading-relaxed mb-12">
              <p>
                {t("paragraphs.p1")} <span className="text-foreground font-medium border-b border-champagne/30 pb-0.5">{t("paragraphs.p1Highlight")}</span>.
              </p>
              <p>
                {t("paragraphs.p2Start")}
                <span className="text-foreground font-medium"> {t("paragraphs.p2Highlight")}</span>
              </p>
              <p>
                {t("paragraphs.p3Start")}
                <span className="text-champagne font-medium"> {t("paragraphs.p3Highlight")}</span>.
              </p>
            </div>

            {/* Quote */}
            <blockquote
              ref={quoteRef}
              className="reveal-text relative pl-8 border-l-4 border-champagne/50 mb-12"
            >
              <p className="text-xl md:text-2xl font-serif italic text-foreground leading-relaxed">
                {t("quote.text")}
              </p>
              <footer className="mt-4 text-sm text-muted-foreground uppercase tracking-widest font-medium">
                {t("quote.author")}
              </footer>
            </blockquote>
          </div>
        </div>

        {/* Timeline / Vision */}
        <div ref={timelineRef} className="mt-40 md:mt-56 pt-16 md:pt-24">
          {/* Vision Header */}
          <div ref={visionHeaderRef} className="text-center mb-20 md:mb-28">
            <span className="inline-block text-xs uppercase tracking-[0.3em] text-champagne font-medium mb-5">
              {t("vision.eyebrow")}
            </span>
            <h3 className="font-serif text-4xl sm:text-5xl md:text-6xl text-foreground mb-8">
              {t("vision.title")}
            </h3>
            <div className="vision-subline w-20 h-[2px] bg-gradient-to-r from-transparent via-champagne to-transparent mx-auto origin-center" />
            <p className="vision-intro text-base md:text-lg text-muted-foreground mt-8 max-w-lg mx-auto leading-relaxed px-4">
              {t("vision.intro")}
            </p>
          </div>

          {/* Timeline container */}
          <div className="relative max-w-2xl mx-auto">
            {/* Vertical line - background */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-[2px] bg-foreground/5 md:-translate-x-[1px]" />

            {/* Vertical line - progress */}
            <div
              ref={timelineProgressRef}
              className="absolute left-6 md:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-champagne via-champagne/80 to-champagne/40 md:-translate-x-[1px] origin-top"
            />

            {/* Timeline items */}
            <div className="space-y-16 md:space-y-20">
              {visionSteps.map((item, index) => (
                <div key={index} className="timeline-item relative">
                  {/* Dot - positioned on the line */}
                  <div className="absolute left-6 md:left-1/2 top-0 -translate-x-1/2 z-10">
                    <div className="timeline-dot-glow absolute inset-0 w-8 h-8 -translate-x-1 -translate-y-1 rounded-full bg-champagne/30 blur-md" />
                    <div className="timeline-dot relative w-6 h-6 rounded-full border-2 border-champagne bg-background flex items-center justify-center shadow-lg shadow-champagne/20">
                      <div className="timeline-dot-inner w-2 h-2 rounded-full bg-champagne" />
                    </div>
                  </div>

                  {/* Content card */}
                  <div className={`timeline-card ml-16 md:ml-0 ${
                    index % 2 === 0
                      ? "md:mr-[calc(50%+2rem)] md:text-right"
                      : "md:ml-[calc(50%+2rem)] md:text-left"
                  }`}>
                    <div className={`inline-block p-6 rounded-xl bg-white/80 dark:bg-foreground/[0.03] border border-foreground/5 shadow-sm ${
                      index % 2 === 0 ? "md:text-left" : ""
                    }`}>
                      {/* Badge */}
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-champagne/10 text-champagne text-[11px] font-bold uppercase tracking-wider rounded-full mb-4">
                        <span className="w-1.5 h-1.5 rounded-full bg-champagne animate-pulse" />
                        {item.year}
                      </span>

                      <h4 className="text-xl md:text-2xl font-serif font-medium text-foreground mb-2">
                        {item.title}
                      </h4>
                      <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* End marker */}
            <div className="flex items-center gap-3 mt-16 ml-6 md:ml-0 md:justify-center">
              <div className="w-3 h-3 rounded-full bg-champagne/30 border border-champagne" />
              <span className="text-[10px] uppercase tracking-widest text-champagne/60 font-medium">
                {t("vision.endMarker")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default WhyUsStory;
