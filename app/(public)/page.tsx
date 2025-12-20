"use client";

import { useRef, useLayoutEffect } from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Clock, TrendingUp } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import ThreeScene from "@/_components/three-scene";
import CustomCursor from "@/_components/ui/custom-cursor";
import Preloader from "@/_components/preloader";
import Magnetic from "@/_components/ui/magnetic-button";
import FeatureReveal from "@/_components/feature-reveal";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function PublicHome() {
  const container = useRef<HTMLDivElement>(null);
  const horizontalSection = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Hero Animations
    const tl = gsap.timeline({ delay: 2.2 }); // Wait for preloader
    
    tl.from(".hero-line", {
      y: 150,
      opacity: 0,
      duration: 1.5,
      stagger: 0.15,
      ease: "power4.out",
    })
    .from(".hero-sub", {
      opacity: 0,
      y: 20,
      duration: 1,
      ease: "power2.out"
    }, "-=1");

    // Horizontal Scroll - Desktop Only
    const horizon = horizontalSection.current;
    
    let mm = gsap.matchMedia();
    
    mm.add("(min-width: 768px)", () => {
      if (horizon) {
        const sections = gsap.utils.toArray<HTMLElement>(".horizontal-item");
        
        gsap.to(sections, {
          xPercent: -100 * (sections.length - 1),
          ease: "none",
          scrollTrigger: {
            trigger: horizon,
            pin: true,
            scrub: 1,
            snap: 1 / (sections.length - 1),
            end: () => "+=" + horizon.offsetWidth,
          },
        });
      }
    });

    // Parallax Images
    gsap.utils.toArray<HTMLElement>(".parallax-img-container").forEach((container) => {
      const img = container.querySelector("img");
      if (img) {
        gsap.fromTo(img, 
          { yPercent: -20 },
          {
            yPercent: 20,
            ease: "none",
            scrollTrigger: {
              trigger: container,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            }
          }
        );
      }
    });

  }, { scope: container });

  return (
    <div ref={container} className="bg-background text-foreground w-full">
      <CustomCursor />
      <Preloader />

      {/* HERO */}
      <section className="relative h-screen flex flex-col justify-center items-center bg-deep-black text-white overflow-hidden">
        <ThreeScene />
        
        <div className="container relative z-10 px-4 text-center">
           <h1 className="text-[12vw] leading-[0.85] font-serif tracking-tighter mix-blend-difference">
             <div className="overflow-hidden"><span className="hero-line block">CAPITAL</span></div>
             <div className="overflow-hidden"><span className="hero-line block italic text-gold">& TIME</span></div>
           </h1>
           
           <div className="hero-sub mt-8 max-w-xl mx-auto text-center">
             <p className="text-xl md:text-2xl text-neutral-400 font-light">
               L'art de la finance de précision pour les visionnaires.
             </p>
             <div className="mt-8 flex justify-center gap-4">
                <Magnetic>
                   <Link href="/pricing" className="px-8 py-4 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-gold transition-colors">
                     Start Process
                   </Link>
                </Magnetic>
             </div>
           </div>
        </div>
      </section>

      {/* HORIZONTAL SCROLL - THE APPROACH */}
      <section ref={horizontalSection} className="relative md:h-screen md:overflow-hidden bg-background">
        <div className="flex flex-col md:flex-row h-auto md:h-full w-full md:w-[300vw]"> {/* 3 sections width on desktop */}
          
          {/* Panel 1 */}
          <div className="horizontal-item w-full md:w-screen h-auto md:h-full flex items-center justify-center p-8 md:p-24 border-b md:border-b-0 md:border-r border-border/30">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center w-full max-w-7xl">
                <div>
                   <span className="text-9xl font-serif text-border/40 absolute -translate-y-1/2 -translate-x-12 z-0">01</span>
                   <h2 className="text-5xl md:text-7xl font-serif relative z-10 mb-8">Analyse <br /><span className="italic text-gold">Profonde</span></h2>
                   <p className="text-xl text-muted-foreground max-w-md">Nous ne regardons pas seulement les chiffres. Nous comprenons votre vision, votre patrimoine et votre trajectoire future.</p>
                </div>
                <div className="parallax-img-container aspect-[4/5] overflow-hidden relative">
                   <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop" alt="Architecture" className="w-full h-[140%] object-cover absolute top-0" />
                </div>
             </div>
          </div>

          {/* Panel 2 */}
          <div className="horizontal-item w-full md:w-screen h-auto md:h-full flex items-center justify-center p-8 md:p-24 border-b md:border-b-0 md:border-r border-border/30 bg-secondary/20">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center w-full max-w-7xl">
                <div className="order-2 md:order-1 parallax-img-container aspect-[4/5] overflow-hidden relative">
                   <img src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=2070&auto=format&fit=crop" alt="Meeting" className="w-full h-[140%] object-cover absolute top-0" />
                </div>
                <div className="order-1 md:order-2">
                   <span className="text-9xl font-serif text-border/40 absolute -translate-y-1/2 -translate-x-12 z-0">02</span>
                   <h2 className="text-5xl md:text-7xl font-serif relative z-10 mb-8">Stratégie <br /><span className="italic text-gold">Sur-mesure</span></h2>
                   <p className="text-xl text-muted-foreground max-w-md">Chaque dossier est unique. Nos architectes financiers dessinent la solution optimale pour maximiser votre levier.</p>
                </div>
             </div>
          </div>

          {/* Panel 3 */}
          <div className="horizontal-item w-full md:w-screen h-auto md:h-full flex items-center justify-center p-8 md:p-24">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center w-full max-w-7xl">
                <div>
                   <span className="text-9xl font-serif text-border/40 absolute -translate-y-1/2 -translate-x-12 z-0">03</span>
                   <h2 className="text-5xl md:text-7xl font-serif relative z-10 mb-8">Exécution <br /><span className="italic text-gold">Rapide</span></h2>
                   <p className="text-xl text-muted-foreground max-w-md">Le temps est votre actif le plus précieux. Notre technologie propriétaire accélère chaque étape de validation.</p>
                </div>
                <div className="parallax-img-container aspect-[4/5] overflow-hidden relative">
                   <img src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=2070&auto=format&fit=crop" alt="Success" className="w-full h-[140%] object-cover absolute top-0" />
                </div>
             </div>
          </div>
        
        </div>
      </section>

      {/* FEATURE REVEAL LIST - INTERACTIVE */}
      <FeatureReveal />

      {/* OFFERS GRID - Minimalist */}
      <section className="py-32 bg-deep-black text-white">
        <div className="container mx-auto px-4">
          <div className="mb-24 text-center">
            <h2 className="text-4xl md:text-6xl font-serif mb-6">Expertise Secteurs</h2>
            <div className="w-24 h-1 bg-gold mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/10 border border-white/10">
             {[
               { title: "Immobilier", icon: ShieldCheck, desc: "Acquisition, investissement, rénovation de prestige." },
               { title: "Véhicules", icon: TrendingUp, desc: "Collection, sport, leasing haute performance." },
               { title: "Art & Vin", icon: Clock, desc: "Financement d'actifs tangibles et passion." }
             ].map((item, i) => (
               <div key={i} className="group bg-deep-black p-12 hover:bg-neutral-900 transition-colors duration-500 flex flex-col items-center text-center">
                  <item.icon className="w-12 h-12 text-gold mb-8 opacity-50 group-hover:opacity-100 transition-opacity" />
                  <h3 className="text-2xl font-serif mb-4">{item.title}</h3>
                  <p className="text-neutral-500 leading-relaxed mb-8">{item.desc}</p>
                  <Magnetic>
                    <span className="text-xs uppercase tracking-widest text-gold border-b border-gold/30 pb-1">En savoir plus</span>
                  </Magnetic>
               </div>
             ))}
          </div>
        </div>
      </section>

    </div>
  );
}