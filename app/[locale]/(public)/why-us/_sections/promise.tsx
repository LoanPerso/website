"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const weGuarantee = [
  {
    title: "Réponse en 24-48h",
    description: "Pas de semaines d'attente. On s'engage, on délivre.",
  },
  {
    title: "Explication systématique",
    description: "Accepté ou refusé, vous saurez toujours pourquoi.",
  },
  {
    title: "Argent instantané",
    description: "Dès l'acceptation, les fonds sont versés.",
  },
  {
    title: "Accompagnement réel",
    description: "Un suivi personnalisé, même après la décision.",
  },
  {
    title: "Zéro frais cachés",
    description: "Ce qui est annoncé est ce que vous payez. Point.",
  },
];

const weDoNotPromise = [
  {
    title: "L'acceptation garantie",
    description: "On évalue chaque dossier honnêtement. Parfois, la réponse est non.",
  },
  {
    title: "Des taux miraculeux",
    description: "Nos taux sont justes, pas irréalistes. Le risque a un prix.",
  },
  {
    title: "De faire du social",
    description: "On est un business, pas une ONG. Mais un business éthique.",
  },
];

export function WhyUsPromise() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const guaranteeRef = useRef<HTMLDivElement>(null);
  const honestRef = useRef<HTMLDivElement>(null);
  const sealRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

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

      // Guarantee items
      const guaranteeItems = guaranteeRef.current?.querySelectorAll(".guarantee-item");
      if (guaranteeItems) {
        guaranteeItems.forEach((item, index) => {
          const checkmark = item.querySelector(".checkmark");

          gsap.fromTo(
            item,
            { opacity: 0, x: -30 },
            {
              opacity: 1,
              x: 0,
              duration: 0.6,
              delay: index * 0.1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: guaranteeRef.current,
                start: "top 70%",
              },
            }
          );

          // Checkmark animation with GSAP
          ScrollTrigger.create({
            trigger: item,
            start: "top 75%",
            onEnter: () => {
              gsap.fromTo(
                checkmark,
                { strokeDashoffset: 20 },
                {
                  strokeDashoffset: 0,
                  duration: 0.5,
                  delay: index * 0.1 + 0.3,
                  ease: "power2.out",
                }
              );
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
          { opacity: 0, x: 30 },
          {
            opacity: 1,
            x: 0,
            duration: 0.6,
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
            { scale: 0.5, opacity: 0, rotation: -15 },
            {
              scale: 1,
              opacity: 1,
              rotation: 0,
              duration: 0.8,
              ease: "elastic.out(1, 0.5)",
            }
          );

          // Seal stamp effect
          const sealStamp = sealRef.current?.querySelector(".seal-stamp");
          gsap.fromTo(
            sealStamp,
            { scale: 1.2, opacity: 0.8 },
            {
              scale: 1,
              opacity: 1,
              duration: 0.2,
              delay: 0.6,
              ease: "power2.out",
            }
          );
        },
        once: true,
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-24 md:py-32 lg:py-40 overflow-hidden"
    >
      {/* Video background */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-20"
          poster="/videos/why-us/promise-poster.jpg"
        >
          <source src="/videos/why-us/promise-ambiance.mp4" type="video/mp4" />
          <source src="/videos/why-us/promise-ambiance.webm" type="video/webm" />
        </video>

        {/* Fallback gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-warm-beige via-background to-champagne/10" />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 z-[1] bg-background/80" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 md:px-12">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-16 md:mb-24">
          <span className="inline-block text-sm uppercase tracking-[0.3em] text-champagne mb-4">
            Notre engagement
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-foreground leading-tight">
            Ce qu'on promet,
            <br />
            <span className="text-muted-foreground">ce qu'on ne promet pas</span>
          </h2>
        </div>

        {/* Two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 max-w-6xl mx-auto">
          {/* We guarantee */}
          <div ref={guaranteeRef}>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="text-2xl md:text-3xl font-serif text-foreground">
                On garantit
              </h3>
            </div>

            <div className="space-y-4">
              {weGuarantee.map((item, index) => (
                <div
                  key={index}
                  className="guarantee-item group flex items-start gap-4 p-5 bg-green-500/5 border border-green-500/10 rounded-sm hover:bg-green-500/10 hover:border-green-500/20 transition-all duration-300"
                >
                  {/* Animated checkmark */}
                  <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
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
                  <div>
                    <h4 className="text-lg font-medium text-foreground mb-1 group-hover:text-green-700 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* We don't promise */}
          <div ref={honestRef}>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-full bg-foreground/5 border border-foreground/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="text-2xl md:text-3xl font-serif text-foreground">
                On ne promet pas
              </h3>
            </div>

            <div className="space-y-4">
              {weDoNotPromise.map((item, index) => (
                <div
                  key={index}
                  className="honest-item group flex items-start gap-4 p-5 bg-foreground/[0.02] border border-foreground/5 rounded-sm hover:bg-foreground/[0.04] transition-all duration-300"
                >
                  <div className="w-6 h-6 flex-shrink-0 mt-0.5 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/50" />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-foreground mb-1">
                      {item.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Honesty note */}
            <div className="mt-8 p-6 bg-champagne/5 border border-champagne/20 rounded-sm">
              <p className="text-muted-foreground italic">
                "La confiance se construit sur l'honnêteté, pas sur les belles promesses."
              </p>
            </div>
          </div>
        </div>

        {/* Seal / Signature */}
        <div className="mt-20 md:mt-28 flex justify-center">
          <div
            ref={sealRef}
            className="relative opacity-0"
          >
            <div className="seal-stamp w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-champagne/30 flex flex-col items-center justify-center bg-background shadow-xl">
              <span className="text-xs uppercase tracking-[0.2em] text-champagne mb-1">
                Engagement
              </span>
              <span className="font-serif text-2xl md:text-3xl text-foreground">
                QF
              </span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
                2024
              </span>
            </div>
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-full bg-champagne/20 blur-2xl -z-10 scale-150 opacity-50" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default WhyUsPromise;
