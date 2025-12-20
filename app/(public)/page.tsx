"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Clock, TrendingUp, CheckCircle2 } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ThreeScene from "@/_components/three-scene";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function PublicHome() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Hero Animations
    const tl = gsap.timeline();
    
    tl.from(".hero-text-reveal", {
      y: 100,
      opacity: 0,
      duration: 1.5,
      stagger: 0.2,
      ease: "power4.out",
    })
    .from(".hero-cta", {
      y: 20,
      opacity: 0,
      duration: 1,
      ease: "power2.out"
    }, "-=1");

    // Scroll Animations
    const sections = gsap.utils.toArray<HTMLElement>(".fade-section");
    sections.forEach((section) => {
      gsap.from(section, {
        opacity: 0,
        y: 50,
        duration: 1,
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });
    });

    // Parallax Cards
    gsap.utils.toArray<HTMLElement>(".parallax-card").forEach((card, i) => {
      gsap.from(card, {
        y: 50,
        opacity: 0,
        duration: 1,
        delay: i * 0.1,
        scrollTrigger: {
          trigger: card,
          start: "top 85%",
        },
      });
    });

  }, { scope: container });

  return (
    <div ref={container} className="flex flex-col w-full overflow-hidden bg-background">
      
      {/* HERO SECTION - Cinematic */}
      <section className="relative h-screen flex items-center justify-center bg-deep-black text-white overflow-hidden">
        <ThreeScene />
        
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/20 z-0 pointer-events-none" />
        
        <div className="relative z-10 container mx-auto px-4 text-center space-y-8 max-w-5xl">
          <div className="hero-text-reveal overflow-hidden">
            <span className="inline-block text-gold text-xs md:text-sm tracking-[0.3em] uppercase font-medium border border-gold/30 px-4 py-2 rounded-full backdrop-blur-sm">
              L'excellence financière
            </span>
          </div>
          
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-serif tracking-tighter leading-[0.9] text-balance">
            <div className="overflow-hidden hero-text-reveal">
              <span className="block">L'art de financer</span>
            </div>
            <div className="overflow-hidden hero-text-reveal">
              <span className="block italic text-white/80">votre avenir.</span>
            </div>
          </h1>
          
          <div className="overflow-hidden hero-text-reveal">
            <p className="text-lg md:text-xl text-neutral-400 max-w-xl mx-auto font-sans leading-relaxed">
              Une approche confidentielle et sur-mesure du crédit pour les particuliers exigeants et les professionnels ambitieux.
            </p>
          </div>
          
          <div className="hero-cta pt-8">
            <Link
              href="/pricing"
              className="group relative inline-flex items-center justify-center px-10 py-5 text-sm tracking-widest uppercase bg-white text-deep-black overflow-hidden transition-all duration-300 hover:text-white"
            >
              <span className="absolute inset-0 w-full h-full bg-gold scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 ease-out z-0"></span>
              <span className="relative z-10 font-medium">Simuler mon projet</span>
            </Link>
          </div>
        </div>
      </section>

      {/* TRUST INDICATORS - Marquee style */}
      <section className="py-12 bg-background border-b border-border/40 fade-section">
        <div className="container mx-auto px-4">
          <p className="text-center text-xs uppercase tracking-widest text-muted-foreground mb-8">Partenaires de confiance</p>
          <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-60 grayscale hover:grayscale-0 transition-all duration-700">
            {["Banque de France", "ACPR", "FBF", "Orias"].map((partner, i) => (
              <div key={i} className="text-2xl font-serif italic text-foreground/80 flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 stroke-1 text-gold" /> {partner}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OFFERS SECTION */}
      <section className="py-32 bg-background relative">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-secondary/20 -z-10" />
        <div className="container mx-auto px-4">
          <div className="mb-24 flex flex-col md:flex-row justify-between items-end gap-8 fade-section">
            <div className="space-y-4 max-w-2xl">
              <h2 className="text-5xl md:text-7xl font-serif text-foreground tracking-tight">Solutions <br /><span className="italic text-gold">exclusives</span></h2>
            </div>
            <p className="text-muted-foreground text-lg max-w-sm text-right md:text-left border-l border-gold/50 pl-6">
              Des financements adaptés à chaque étape de votre patrimoine.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Privilège Personnel",
                desc: "Pour vos projets de vie, voyages, ou acquisitions d'exception.",
                icon: Clock,
              },
              {
                title: "Immobilier Prestige",
                desc: "Acquisition de résidence principale, secondaire ou investissement locatif.",
                icon: ShieldCheck,
              },
              {
                title: "Trésorerie Pro",
                desc: "Liquidités pour développer votre activité ou saisir une opportunité.",
                icon: TrendingUp,
              },
            ].map((offer, i) => (
              <div
                key={i}
                className="parallax-card group p-10 border border-border bg-white hover:border-gold/50 transition-all duration-700 hover:shadow-2xl hover:shadow-gold/10 flex flex-col justify-between min-h-[400px] relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity duration-500 scale-150 group-hover:scale-125 transform origin-top-right">
                   <offer.icon className="w-32 h-32 text-gold" />
                </div>
                
                <div className="relative z-10">
                  <offer.icon className="w-10 h-10 text-gold mb-8 stroke-1" />
                  <h3 className="text-3xl font-serif mb-6 text-foreground leading-none">{offer.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-lg">{offer.desc}</p>
                </div>
                
                <div className="relative z-10 mt-12 pt-8 border-t border-border/30">
                  <span className="inline-flex items-center gap-4 text-sm uppercase tracking-wider text-foreground group-hover:text-gold transition-all duration-300 group-hover:translate-x-2">
                    Découvrir <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS - Minimalist Steps */}
      <section className="py-32 bg-deep-black text-white relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
             <div className="fade-section">
                <h2 className="text-5xl md:text-7xl font-serif mb-16 leading-none">Un parcours <br /><span className="text-gold italic">d'exception</span></h2>
                <div className="space-y-12 border-l border-white/10 pl-8 md:pl-12">
                  {[
                    { step: "01", title: "Demande simplifiée", desc: "5 minutes pour définir votre besoin en ligne." },
                    { step: "02", title: "Analyse experte", desc: "Réponse de principe immédiate, validation sous 24h." },
                    { step: "03", title: "Déblocage des fonds", desc: "Virement express dès signature électronique." },
                  ].map((s, i) => (
                    <div key={i} className="group relative">
                      <div className="absolute -left-[3.2rem] md:-left-[4.2rem] top-0 w-4 h-4 rounded-full bg-deep-black border border-gold group-hover:bg-gold transition-colors duration-500" />
                      <div className="text-xs font-sans text-gold tracking-widest mb-2">ÉTAPE {s.step}</div>
                      <h3 className="text-3xl font-serif mb-2 group-hover:text-gold transition-colors duration-300">{s.title}</h3>
                      <p className="text-neutral-500 text-lg">{s.desc}</p>
                    </div>
                  ))}
                </div>
             </div>
             
             {/* Visual Abstraction */}
             <div className="relative h-[600px] bg-neutral-900 overflow-hidden fade-section rounded-sm border border-white/10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gold/20 via-transparent to-transparent opacity-50 animate-pulse" style={{ animationDuration: "4s" }} />
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="text-center p-12 backdrop-blur-md bg-white/5 border border-white/10 max-w-sm">
                      <p className="font-serif text-3xl italic text-white/90 leading-tight">"La simplicité est la sophistication suprême."</p>
                      <p className="text-gold text-xs tracking-[0.2em] mt-6 uppercase">Leonardo da Vinci</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-40 bg-secondary relative overflow-hidden text-center">
        <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-multiply pointer-events-none"></div>
        <div className="container mx-auto px-4 relative z-10 fade-section">
          <h2 className="text-6xl md:text-8xl font-serif mb-8 text-foreground tracking-tighter">Prêt à <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold to-dark-gold">concrétiser ?</span></h2>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
            Nos conseillers sont à votre disposition pour une étude personnalisée de votre dossier, sans engagement.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
               href="/pricing"
               className="px-10 py-5 bg-deep-black text-white text-sm tracking-widest uppercase hover:bg-gold hover:text-deep-black transition-all duration-500 shadow-xl hover:shadow-2xl hover:-translate-y-1"
            >
              Commencer maintenant
            </Link>
            <Link
               href="/contact"
               className="px-10 py-5 bg-transparent border border-foreground/20 text-foreground text-sm tracking-widest uppercase hover:bg-white hover:border-transparent transition-all duration-500"
            >
              Contacter un expert
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
