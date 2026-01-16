"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function WhyUsStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const quoteRef = useRef<HTMLBlockquoteElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Parallax on image container
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

      // Content reveal
      const textElements = contentRef.current?.querySelectorAll(".reveal-text");
      if (textElements) {
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
      gsap.fromTo(
        quoteRef.current,
        { opacity: 0, scale: 0.98, borderLeftColor: "transparent" },
        {
          opacity: 1,
          scale: 1,
          borderLeftColor: "hsl(var(--accent))", // Champagne
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: quoteRef.current,
            start: "top 80%",
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
            start: "top 80%",
            onEnter: () => {
              // Dot pulse
              gsap.fromTo(
                dot,
                { scale: 0, opacity: 0 },
                {
                  scale: 1,
                  opacity: 1,
                  duration: 0.5,
                  ease: "back.out(1.7)",
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
                { opacity: 0, x: 20 },
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
      {/* Background Texture */}
      <div className="absolute inset-0 opacity-[0.4] pointer-events-none mix-blend-multiply">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-foreground/5"/>
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        </svg>
      </div>

      <div className="relative z-10 container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* Left: Visual Representation (Abstract Map/Building) */}
          <div ref={imageContainerRef} className="relative order-2 lg:order-1">
            <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-foreground/5">
               {/* Abstract Geometric Composition */}
               <div className="absolute inset-0 bg-gradient-to-tr from-background to-foreground/5" />
               
               {/* Stylized Map Elements (CSS) */}
               <div className="absolute top-[20%] left-[10%] w-[60%] h-[1px] bg-champagne/20 rotate-12" />
               <div className="absolute top-[30%] left-[20%] w-[50%] h-[1px] bg-champagne/20 -rotate-6" />
               <div className="absolute bottom-[20%] right-[10%] w-[1px] h-[40%] bg-champagne/20" />
               
               {/* "Estonia" Highlight */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-champagne/10 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full border border-champagne/20 flex items-center justify-center">
                      <div className="w-2 h-2 bg-champagne rounded-full animate-pulse" />
                  </div>
               </div>

               {/* Overlay Gradient */}
               <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

               {/* Badge */}
               <div className="absolute bottom-8 left-8 flex items-center gap-3 px-5 py-3 bg-white/80 backdrop-blur-md rounded-full shadow-soft border border-white/40">
                <div className="w-2 h-2 rounded-full bg-success" />
                <span className="text-sm text-foreground font-medium tracking-wide">Tallinn, Estonie</span>
              </div>
            </div>

            {/* Decorative Frame Elements */}
            <div className="absolute -top-6 -left-6 w-32 h-32 border-l border-t border-foreground/10" />
            <div className="absolute -bottom-6 -right-6 w-32 h-32 border-r border-b border-foreground/10" />
          </div>

          {/* Right: Content */}
          <div ref={contentRef} className="order-1 lg:order-2">
            <span className="reveal-text inline-block text-xs uppercase tracking-[0.3em] text-champagne font-medium mb-6">
              Notre histoire
            </span>

            <h2 className="reveal-text font-serif text-4xl sm:text-5xl md:text-6xl font-light text-foreground leading-[1.1] mb-10">
              Né d'un constat,
              <br />
              <span className="text-muted-foreground/60">pas d'une galère</span>
            </h2>

            <div className="reveal-text space-y-8 text-lg text-muted-foreground leading-relaxed mb-12">
              <p>
                Quickfund n'est pas né d'une histoire personnelle dramatique. Pas de refus bancaire,
                pas de situation désespérée. Juste un <span className="text-foreground font-medium border-b border-champagne/30 pb-0.5">constat lucide</span>.
              </p>
              <p>
                Les acteurs du crédit font les choses à moitié. Business déshumanisé,
                clients traités comme des numéros, promesses non tenues.
                <span className="text-foreground font-medium"> On pouvait faire mieux.</span>
              </p>
              <p>
                Depuis l'Estonie, pionnière du numérique,
                nous construisons le crédit tel qu'il devrait être :
                <span className="text-champagne font-medium"> rentable ET respectueux</span>.
              </p>
            </div>

            {/* Quote */}
            <blockquote
              ref={quoteRef}
              className="reveal-text relative pl-8 border-l-4 border-champagne/50 mb-12"
            >
              <p className="text-xl md:text-2xl font-serif italic text-foreground leading-relaxed">
                "On sera charitable quand on sera rentable. En attendant, on construit."
              </p>
              <footer className="mt-4 text-sm text-muted-foreground uppercase tracking-widest font-medium">
                — Le Fondateur
              </footer>
            </blockquote>
          </div>
        </div>

        {/* Timeline / Vision */}
        <div ref={timelineRef} className="mt-32 md:mt-48 max-w-3xl mx-auto">
          <div className="text-center mb-16">
             <h3 className="font-serif text-3xl md:text-4xl text-foreground">
                Notre vision
             </h3>
             <div className="w-12 h-1 bg-champagne mx-auto mt-6" />
          </div>
          

          <div className="relative pl-8 md:pl-0">
            {/* Vertical line */}
            <div className="absolute left-[11px] md:left-1/2 top-0 bottom-0 w-[1px] bg-foreground/10 md:-translate-x-1/2" />

            {/* Timeline items */}
            {[
              {
                year: "Aujourd'hui",
                title: "Les fondations",
                description: "Structurer, optimiser, prouver le modèle en Estonie.",
              },
              {
                year: "5 ans",
                title: "Expansion européenne",
                description: "40%+ hors Estonie, croissance organique établie.",
              },
              {
                year: "10 ans",
                title: "La référence",
                description: "Leader du crédit transparent pour les exclus du système.",
              },
            ].map((item, index) => (
              <div
                key={index}
                className={`timeline-item relative flex flex-col md:flex-row gap-8 mb-16 last:mb-0 ${
                  index % 2 !== 0 ? "md:flex-row-reverse" : ""
                }`}
              >
                {/* Dot */}
                <div
                  className="timeline-dot absolute left-[5px] md:left-1/2 w-[13px] h-[13px] rounded-full border-2 border-background bg-champagne md:-translate-x-1/2 z-10"
                  style={{ top: "6px" }}
                />

                {/* Line extension */}
                <div
                  className="timeline-line absolute left-[11px] md:left-1/2 w-[1px] h-full bg-champagne md:-translate-x-1/2 origin-top opacity-50"
                  style={{ top: "18px", scaleY: 0 }}
                />

                {/* Content */}
                <div
                  className={`timeline-content md:w-1/2 ${
                    index % 2 !== 0 ? "md:text-left md:pl-16" : "md:text-right md:pr-16"
                  } pl-8`}
                >
                  <span className="inline-block px-3 py-1 bg-champagne/10 text-champagne text-xs font-bold uppercase tracking-wider rounded-full mb-3">
                    {item.year}
                  </span>
                  <h4 className="text-xl font-medium text-foreground mb-2">
                    {item.title}
                  </h4>
                  <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
                
                 {/* Empty half for layout balance */}
                 <div className="hidden md:block md:w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default WhyUsStory;