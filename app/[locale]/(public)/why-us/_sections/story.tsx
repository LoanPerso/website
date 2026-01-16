"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function WhyUsStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const quoteRef = useRef<HTMLBlockquoteElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Parallax on image
      gsap.fromTo(
        imageRef.current,
        { y: 100 },
        {
          y: -100,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        }
      );

      // Content reveal
      const textElements = contentRef.current?.querySelectorAll(".reveal-text");
      if (textElements) {
        gsap.fromTo(
          textElements,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: contentRef.current,
              start: "top 70%",
            },
          }
        );
      }

      // Quote animation
      gsap.fromTo(
        quoteRef.current,
        { opacity: 0, scale: 0.95 },
        {
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: quoteRef.current,
            start: "top 75%",
          },
        }
      );

      // Timeline items
      const timelineItems = timelineRef.current?.querySelectorAll(".timeline-item");
      if (timelineItems) {
        timelineItems.forEach((item) => {
          const dot = item.querySelector(".timeline-dot");
          const line = item.querySelector(".timeline-line");
          const content = item.querySelector(".timeline-content");

          ScrollTrigger.create({
            trigger: item,
            start: "top 75%",
            onEnter: () => {
              // Dot pulse
              gsap.fromTo(
                dot,
                { scale: 0, opacity: 0 },
                {
                  scale: 1,
                  opacity: 1,
                  duration: 0.6,
                  ease: "back.out(1.7)",
                  keyframes: [
                    { scale: 1.5, duration: 0.3 },
                    { scale: 1, duration: 0.3 },
                  ],
                }
              );

              // Line grow
              gsap.fromTo(
                line,
                { scaleY: 0 },
                {
                  scaleY: 1,
                  duration: 0.4,
                  delay: 0.2,
                  ease: "expo.out",
                }
              );

              // Content fade
              gsap.fromTo(
                content,
                { opacity: 0, x: 30 },
                { opacity: 1, x: 0, duration: 0.6, delay: 0.3, ease: "power2.out" }
              );
            },
            once: true,
          });
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
      {/* Background subtle texture */}
      <div className="absolute inset-0 opacity-[0.015]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: Image/Video */}
          <div ref={imageRef} className="relative order-2 lg:order-1">
            <div className="relative aspect-[4/5] rounded-sm overflow-hidden">
              {/* Video placeholder */}
              <video
                ref={videoRef}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
                poster="/videos/why-us/story-poster.jpg"
              >
                <source src="/videos/why-us/story-ambiance.mp4" type="video/mp4" />
                <source src="/videos/why-us/story-ambiance.webm" type="video/webm" />
              </video>

              {/* Fallback image placeholder */}
              <div className="absolute inset-0 bg-gradient-to-br from-warm-beige to-champagne/20" />

              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />

              {/* Location badge */}
              <div className="absolute bottom-6 left-6 flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-sm">
                <svg className="w-4 h-4 text-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-sm text-foreground font-medium">Tallinn, Estonie</span>
              </div>
            </div>

            {/* Decorative frame */}
            <div className="absolute -top-4 -left-4 w-24 h-24 border-l-2 border-t-2 border-champagne/30" />
            <div className="absolute -bottom-4 -right-4 w-24 h-24 border-r-2 border-b-2 border-champagne/30" />
          </div>

          {/* Right: Content */}
          <div ref={contentRef} className="order-1 lg:order-2">
            <span className="reveal-text inline-block text-sm uppercase tracking-[0.3em] text-champagne mb-6">
              Notre histoire
            </span>

            <h2 className="reveal-text font-serif text-4xl sm:text-5xl md:text-6xl font-light text-foreground leading-tight mb-8">
              Né d'un constat,
              <br />
              <span className="text-muted-foreground">pas d'une galère</span>
            </h2>

            <div className="reveal-text space-y-6 text-lg text-muted-foreground leading-relaxed mb-10">
              <p>
                Quickfund n'est pas né d'une histoire personnelle dramatique. Pas de refus bancaire,
                pas de situation désespérée. Juste un <span className="text-foreground font-medium">constat lucide</span>.
              </p>
              <p>
                Les acteurs du crédit font les choses à moitié. Business déshumanisé,
                clients traités comme des numéros, promesses non tenues.
                <span className="text-foreground font-medium"> On pouvait faire mieux.</span>
              </p>
              <p>
                Depuis l'Estonie, avec un cadre réglementaire qui permet l'innovation,
                nous construisons le crédit tel qu'il devrait être :
                <span className="text-champagne font-medium"> rentable ET respectueux</span>.
              </p>
            </div>

            {/* Quote */}
            <blockquote
              ref={quoteRef}
              className="reveal-text relative pl-6 border-l-2 border-champagne/50 mb-10"
            >
              <p className="text-xl md:text-2xl font-serif italic text-foreground leading-relaxed">
                "On sera charitable quand on sera rentable. En attendant, on construit."
              </p>
            </blockquote>
          </div>
        </div>

        {/* Timeline / Vision */}
        <div ref={timelineRef} className="mt-24 md:mt-32">
          <h3 className="text-center font-serif text-3xl md:text-4xl text-foreground mb-16">
            Notre vision à long terme
          </h3>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-[1px] bg-foreground/10 md:-translate-x-1/2" />

              {/* Timeline items */}
              {[
                {
                  year: "Aujourd'hui",
                  title: "Construire les fondations",
                  description: "Structurer, optimiser, prouver le modèle en Estonie.",
                },
                {
                  year: "5 ans",
                  title: "Expansion européenne",
                  description: "40%+ hors Estonie, croissance organique établie.",
                },
                {
                  year: "10 ans",
                  title: "Leader du crédit transparent",
                  description: "Référence pour les exclus du système bancaire en Europe.",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className={`timeline-item relative flex items-start gap-8 mb-12 last:mb-0 ${
                    index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  {/* Dot */}
                  <div
                    className={`timeline-dot absolute left-4 md:left-1/2 w-3 h-3 rounded-full bg-champagne md:-translate-x-1/2 z-10 opacity-0`}
                    style={{ top: "6px" }}
                  />

                  {/* Line extension */}
                  <div
                    className="timeline-line absolute left-[18px] md:left-1/2 w-[1px] h-full bg-champagne/50 md:-translate-x-1/2 origin-top"
                    style={{ top: "12px", scaleY: 0 }}
                  />

                  {/* Content */}
                  <div
                    className={`timeline-content ml-12 md:ml-0 md:w-[calc(50%-2rem)] ${
                      index % 2 === 0 ? "md:text-right md:pr-12" : "md:text-left md:pl-12"
                    }`}
                  >
                    <span className="inline-block px-3 py-1 bg-champagne/10 text-champagne text-sm font-medium rounded-sm mb-2">
                      {item.year}
                    </span>
                    <h4 className="text-xl md:text-2xl font-medium text-foreground mb-2">
                      {item.title}
                    </h4>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>

                  {/* Spacer for alternating layout */}
                  <div className="hidden md:block md:w-[calc(50%-2rem)]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default WhyUsStory;
