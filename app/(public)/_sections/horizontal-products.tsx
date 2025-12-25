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

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate elements as they come into view during horizontal scroll
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
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="relative z-[70]">
      {/* Horizontal scroll section - header integrated as first panel */}
      <HorizontalSection panels={products.length + 2} className="bg-background">
        {/* Intro Panel */}
        <HorizontalPanel className="bg-background">
          <div className="text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-6">
              Nos Solutions
            </p>
            <h2 className="font-serif text-5xl md:text-7xl lg:text-8xl mb-8">
              Un crédit pour
              <br />
              <span className="text-accent">chaque besoin</span>
            </h2>
            <div className="flex items-center justify-center gap-3 text-muted-foreground">
              <span className="text-sm uppercase tracking-wider">Scroll</span>
              <svg className="w-6 h-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </div>
        </HorizontalPanel>

        {products.map((product, i) => (
          <HorizontalPanel key={i} className={product.color}>
            <div className="max-w-4xl w-full grid md:grid-cols-2 gap-12 items-center">
              {/* Left: Number & Title */}
              <div>
                <span
                  ref={(el) => {
                    if (el) numbersRef.current[i] = el;
                  }}
                  className="block font-serif text-[12rem] md:text-[16rem] leading-none opacity-20"
                >
                  {product.number}
                </span>
              </div>

              {/* Right: Content */}
              <div>
                <p className="text-accent text-sm uppercase tracking-wider mb-2">
                  {product.range}
                </p>
                <h3
                  ref={(el) => {
                    if (el) titlesRef.current[i] = el;
                  }}
                  className="font-serif text-4xl md:text-5xl lg:text-6xl mb-6"
                >
                  {product.title}
                </h3>
                <p className="text-lg text-muted-foreground mb-8 max-w-md">
                  {product.description}
                </p>
                <ul className="space-y-3 mb-8">
                  {product.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </HorizontalPanel>
        ))}

        {/* CTA Panel with other products */}
        <HorizontalPanel className="bg-deep-black">
          <div className="text-white max-w-4xl w-full">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Left: Title */}
              <div className="text-center md:text-left">
                <p className="text-accent text-sm uppercase tracking-wider mb-4">
                  Et bien plus encore
                </p>
                <h3 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-6">
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

              {/* Right: Other products list */}
              <div className="space-y-3">
                {otherProducts.map((product, i) => (
                  <div
                    key={i}
                    className="group cursor-icon-target flex items-center gap-4 p-4 border border-white/10 rounded-lg hover:border-accent/30 transition-colors duration-500 cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent shrink-0">
                      {product.icon}
                    </div>
                    <div>
                      <h4 className="font-medium text-white">
                        {product.title}
                      </h4>
                      <p className="text-sm text-white/50">
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
          </div>
        </HorizontalPanel>
      </HorizontalSection>
    </div>
  );
}

export default HorizontalProducts;
