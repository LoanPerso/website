"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { HorizontalSection, HorizontalPanel } from "@/_components/layout/horizontal-section";
import Magnetic from "@/_components/ui/magnetic-button";

gsap.registerPlugin(ScrollTrigger);

const products = [
  {
    number: "01",
    title: "Micro-crédit",
    range: "20€ - 500€",
    description: "Pour les petits besoins urgents. Réponse en moins de 24h, sans paperasse inutile.",
    features: ["Montants dès 20€", "Approbation rapide", "Sans justificatif complexe"],
    color: "bg-accent/10",
  },
  {
    number: "02",
    title: "Crédit Conso",
    range: "500€ - 5 000€",
    description: "Financez vos projets personnels avec transparence. On vous dit toujours pourquoi.",
    features: ["Taux compétitifs", "Échéances flexibles", "Remboursement anticipé gratuit"],
    color: "bg-deep-black text-white",
  },
  {
    number: "03",
    title: "Crédit Pro",
    range: "1 000€ - 10 000€",
    description: "Pour les freelances et TPEs. On comprend les revenus variables.",
    features: ["Profils atypiques acceptés", "Analyse personnalisée", "Coaching inclus"],
    color: "bg-accent/10",
  },
];

// Animated icons components
const StudentIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" className="origin-[12px_9px] group-hover:animate-[toss_0.6s_ease-out]" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <circle cx="12" cy="12" r="9" strokeWidth={1.5} />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M12 7v5l3 3"
      className="origin-[12px_12px] group-hover:animate-[spin_0.6s_ease-in-out]"
    />
  </svg>
);

const CarIcon = () => (
  <svg className="w-5 h-5 group-hover:animate-[slideRight_0.6s_ease-out]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 17a2 2 0 11-4 0 2 2 0 014 0zM18 17a2 2 0 11-4 0 2 2 0 014 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 11l2-6h10l2 6M3 11h16v5a1 1 0 01-1 1H4a1 1 0 01-1-1v-5z" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="w-5 h-5 group-hover:animate-[spin_0.6s_ease-in-out]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const ChartIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 20h4v-8H4v8z" className="origin-bottom group-hover:animate-[grow_0.6s_ease-out]" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20h4v-12h-4v12z" className="origin-bottom group-hover:animate-[grow_0.6s_ease-out_0.1s_both]" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 20h4V4h-4v16z" className="origin-bottom group-hover:animate-[grow_0.6s_ease-out_0.2s_both]" />
  </svg>
);

const otherProducts = [
  {
    title: "Prêt étudiant",
    tagline: "Financez vos études sans garant bancaire",
    icon: <StudentIcon />,
  },
  {
    title: "Avance sur salaire",
    tagline: "Votre salaire, quelques jours plus tôt",
    icon: <ClockIcon />,
  },
  {
    title: "Leasing",
    tagline: "Utilisez sans acheter",
    icon: <CarIcon />,
  },
  {
    title: "Rachat de crédits",
    tagline: "Simplifiez vos mensualités",
    icon: <RefreshIcon />,
  },
  {
    title: "Coaching financier",
    tagline: "Pilotez votre budget, pas l'inverse",
    icon: <ChartIcon />,
  },
];

export function HorizontalProducts() {
  const numbersRef = useRef<HTMLSpanElement[]>([]);
  const titlesRef = useRef<HTMLHeadingElement[]>([]);
  const mobileCardsRef = useRef<HTMLDivElement[]>([]);
  const introRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Desktop: Animate elements during horizontal scroll
      numbersRef.current.forEach((num) => {
        if (!num) return;
        gsap.fromTo(
          num,
          { opacity: 0.2, scale: 0.8 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.5,
            scrollTrigger: {
              trigger: num,
              start: "left 80%",
              end: "left 30%",
              scrub: 1,
              horizontal: true,
            },
          }
        );
      });

      // Mobile: Animate each card's content on scroll
      const mm = gsap.matchMedia();
      mm.add("(max-width: 767px)", () => {
        mobileCardsRef.current.forEach((card) => {
          if (!card) return;

          const number = card.querySelector(".mobile-number");
          const range = card.querySelector(".mobile-range");
          const title = card.querySelector(".mobile-title");
          const description = card.querySelector(".mobile-description");
          const features = card.querySelectorAll(".mobile-feature");

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: card,
              start: "top 50%",
              toggleActions: "play none none none",
            },
          });

          // Number drops in with scale - more dramatic
          if (number) {
            tl.fromTo(
              number,
              { opacity: 0, scale: 0.3, y: -60 },
              { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: "back.out(2)" },
              0
            );
          }

          // Range slides up - bigger movement
          if (range) {
            tl.fromTo(
              range,
              { opacity: 0, y: 40 },
              { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
              0.15
            );
          }

          // Title reveals with bigger movement
          if (title) {
            tl.fromTo(
              title,
              { opacity: 0, y: 80, skewY: 3 },
              { opacity: 1, y: 0, skewY: 0, duration: 0.9, ease: "power3.out" },
              0.25
            );
          }

          // Description fades in - bigger movement
          if (description) {
            tl.fromTo(
              description,
              { opacity: 0, y: 50 },
              { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" },
              0.45
            );
          }

          // Features stagger in - bigger movement
          if (features.length > 0) {
            tl.fromTo(
              features,
              { opacity: 0, x: -40 },
              { opacity: 1, x: 0, duration: 0.5, stagger: 0.12, ease: "power2.out" },
              0.55
            );
          }
        });

        // Intro animation
        if (introRef.current) {
          const introTitle = introRef.current.querySelector(".intro-title");
          const introSubtitle = introRef.current.querySelector(".intro-subtitle");
          const introScroll = introRef.current.querySelector(".intro-scroll");

          const introTl = gsap.timeline({
            scrollTrigger: {
              trigger: introRef.current,
              start: "top 50%",
              toggleActions: "play none none none",
            },
          });

          if (introSubtitle) {
            introTl.fromTo(
              introSubtitle,
              { opacity: 0, y: 40 },
              { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" },
              0
            );
          }
          if (introTitle) {
            introTl.fromTo(
              introTitle,
              { opacity: 0, y: 100 },
              { opacity: 1, y: 0, duration: 1, ease: "power3.out" },
              0.15
            );
          }
          if (introScroll) {
            introTl.fromTo(
              introScroll,
              { opacity: 0, y: 20 },
              { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
              0.5
            );
          }
        }

        // CTA animation
        if (ctaRef.current) {
          const ctaTitle = ctaRef.current.querySelector(".cta-title");
          const ctaItems = ctaRef.current.querySelectorAll(".cta-item");
          const ctaButton = ctaRef.current.querySelector(".cta-button");

          const ctaTl = gsap.timeline({
            scrollTrigger: {
              trigger: ctaRef.current,
              start: "top 50%",
              toggleActions: "play none none none",
            },
          });

          if (ctaTitle) {
            ctaTl.fromTo(
              ctaTitle,
              { opacity: 0, y: 60 },
              { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
              0
            );
          }
          if (ctaItems.length > 0) {
            ctaTl.fromTo(
              ctaItems,
              { opacity: 0, y: 40 },
              { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" },
              0.25
            );
          }
          if (ctaButton) {
            ctaTl.fromTo(
              ctaButton,
              { opacity: 0, scale: 0.7, y: 30 },
              { opacity: 1, scale: 1, y: 0, duration: 0.7, ease: "back.out(2)" },
              0.6
            );
          }
        }
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="relative z-[70]">
      {/* Horizontal scroll section - header integrated as first panel */}
      <HorizontalSection panels={products.length + 2} className="bg-background">
        {/* Intro Panel */}
        <HorizontalPanel className="bg-background">
          <div ref={introRef} className="text-center px-4">
            <p className="intro-subtitle text-sm md:text-sm uppercase tracking-[0.3em] text-muted-foreground mb-6">
              Nos Solutions
            </p>
            <h2 className="intro-title font-serif text-5xl md:text-7xl lg:text-8xl mb-8 leading-tight">
              Un crédit pour
              <br />
              <span className="text-accent">chaque besoin</span>
            </h2>
            {/* Desktop: horizontal arrow, Mobile: vertical arrow */}
            <div className="intro-scroll flex items-center justify-center gap-3 text-muted-foreground">
              <span className="text-sm uppercase tracking-wider">Scroll</span>
              {/* Horizontal arrow for desktop */}
              <svg className="w-6 h-6 animate-pulse hidden md:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
              {/* Vertical arrow for mobile */}
              <svg className="w-7 h-7 animate-bounce md:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </HorizontalPanel>

        {products.map((product, i) => (
          <HorizontalPanel key={i} className={product.color}>
            {/* Desktop layout */}
            <div className="hidden md:grid max-w-4xl w-full grid-cols-2 gap-12 items-center">
              <div className="relative">
                <span
                  ref={(el) => {
                    if (el) numbersRef.current[i] = el;
                  }}
                  className="block font-serif text-[16rem] leading-none text-dark-gold/30"
                >
                  {product.number}
                </span>
              </div>
              <div>
                <p className="text-dark-gold text-sm uppercase tracking-wider mb-2">
                  {product.range}
                </p>
                <h3
                  ref={(el) => {
                    if (el) titlesRef.current[i] = el;
                  }}
                  className="font-serif text-5xl lg:text-6xl mb-6"
                >
                  {product.title}
                </h3>
                <p className="text-lg text-muted-foreground mb-8 max-w-md">
                  {product.description}
                </p>
                <ul className="space-y-3 mb-8">
                  {product.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-dark-gold flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Mobile layout - centered, much bigger */}
            <div
              ref={(el) => {
                if (el) mobileCardsRef.current[i] = el;
              }}
              className="md:hidden w-full text-center"
            >
              <span className="mobile-number inline-block font-serif text-8xl text-dark-gold/60 mb-4">
                {product.number}
              </span>
              <p className="mobile-range text-dark-gold text-base uppercase tracking-widest mb-4">
                {product.range}
              </p>
              <h3 className="mobile-title font-serif text-5xl leading-tight mb-6">
                {product.title}
              </h3>
              <p className="mobile-description text-lg text-muted-foreground mb-10 max-w-sm mx-auto leading-relaxed">
                {product.description}
              </p>
              <ul className="space-y-5 text-left max-w-xs mx-auto">
                {product.features.map((feature, j) => (
                  <li key={j} className="mobile-feature flex items-center gap-4 text-lg">
                    <span className="w-2.5 h-2.5 rounded-full bg-dark-gold flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </HorizontalPanel>
        ))}

        {/* CTA Panel with other products */}
        <HorizontalPanel className="bg-deep-black">
          <div className="text-white max-w-4xl w-full">
            {/* Desktop layout */}
            <div className="hidden md:grid grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-accent text-sm uppercase tracking-wider mb-4">
                  Et bien plus encore
                </p>
                <h3 className="font-serif text-5xl lg:text-6xl mb-6">
                  Découvrez tous
                  <br />
                  nos produits
                </h3>
                <Magnetic>
                  <button className="px-8 py-4 border border-white/20 rounded-full text-white hover:bg-white hover:text-deep-black transition-colors duration-300">
                    Voir tout →
                  </button>
                </Magnetic>
              </div>
              <div className="space-y-3">
                {otherProducts.map((product, i) => (
                  <div
                    key={i}
                    className="group cursor-icon-target flex items-center gap-4 p-4 border border-white/10 rounded-lg hover:border-accent/30 transition-colors duration-500 cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent shrink-0">
                      {product.icon}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-medium text-white text-base">
                        {product.title}
                      </h4>
                      <p className="text-sm text-white/50 truncate">
                        {product.tagline}
                      </p>
                    </div>
                    <svg
                      className="w-5 h-5 text-white/20 shrink-0 ml-auto"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile layout */}
            <div ref={ctaRef} className="md:hidden text-center">
              <div className="cta-title">
                <p className="text-accent text-base uppercase tracking-widest mb-4">
                  Et bien plus encore
                </p>
                <h3 className="font-serif text-4xl mb-10 leading-tight">
                  Découvrez tous<br />nos produits
                </h3>
              </div>
              <div className="space-y-4 mb-10">
                {otherProducts.map((product, i) => (
                  <div
                    key={i}
                    className="cta-item flex items-center gap-4 p-5 border border-white/10 rounded-2xl active:border-accent/50 transition-colors cursor-pointer"
                  >
                    <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center text-accent shrink-0">
                      {product.icon}
                    </div>
                    <div className="min-w-0 text-left flex-1">
                      <h4 className="font-medium text-white text-lg">
                        {product.title}
                      </h4>
                      <p className="text-base text-white/50">
                        {product.tagline}
                      </p>
                    </div>
                    <svg
                      className="w-6 h-6 text-white/30 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                ))}
              </div>
              <button className="cta-button w-full max-w-xs px-8 py-5 bg-white text-deep-black rounded-full text-lg font-medium active:scale-95 transition-transform">
                Voir tout →
              </button>
            </div>
          </div>
        </HorizontalPanel>
      </HorizontalSection>
    </div>
  );
}

export default HorizontalProducts;
