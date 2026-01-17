"use client";

import { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowRight, Shield, Zap, Globe } from "lucide-react";
import Link from "next/link";
import CustomCursor from "@/_components/ui/custom-cursor";
import { cn } from "@/_lib/utils";

// Enregistrement du plugin GSAP
gsap.registerPlugin(ScrollTrigger);

export default function WhyUs2Page() {
  const container = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [isReady, setIsReady] = useState(false);

  // Gestion du chargement de la vidéo pour éviter les bugs de durée NaN
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      if (video.readyState >= 1) {
        setVideoDuration(video.duration);
        setIsReady(true);
      } else {
        video.onloadedmetadata = () => {
          setVideoDuration(video.duration);
          setIsReady(true);
        };
      }
    }
  }, []);

  useGSAP(
    () => {
      if (!isReady || !videoRef.current || !textContainerRef.current) return;

      const video = videoRef.current;
      const texts = gsap.utils.toArray<HTMLElement>(".scroll-text");

      // 1. PINNING DE LA SECTION VIDÉO
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: "#video-section",
          start: "top top",
          end: "+=250%", // Raccourci pour plus de dynamisme (était 400%)
          scrub: 1,
          pin: true,
          anticipatePin: 1,
        },
      });

      // 2. ANIMATION DE LA VIDÉO (Scrubbing)
      timeline.to(
        video,
        {
          currentTime: videoDuration || 1,
          ease: "none",
        },
        0
      );

      // 3. ANIMATION DES TEXTES - TIMING MANUEL (STACCATO -> FINAL)
      // On définit manuellement les créneaux pour un rythme progressif
      // Les 3 premiers s'enchaînent vite, le dernier se pose.
      
      const timings = [
        { start: 0.0, end: 0.20 }, // PRECISION
        { start: 0.20, end: 0.40 }, // VITESSE
        { start: 0.40, end: 0.60 }, // SECURITE
        { start: 0.60, end: 1.0 }  // AVENIR (Reste jusqu'à la fin)
      ];

      texts.forEach((text, i) => {
        const timing = timings[i];
        const isLast = i === texts.length - 1;
        
        // Apparition (rapide au début du créneau)
        timeline.fromTo(
          text,
          { opacity: 0, y: 40, scale: 0.9 },
          { 
            opacity: 1, 
            y: 0, 
            scale: 1, 
            duration: 0.1, // Transition très rapide
            ease: "power3.out" 
          },
          timing.start
        );

        // Disparition
        if (!isLast) {
          // Les premiers disparaissent à la fin de leur créneau
          timeline.to(
            text,
            { 
              opacity: 0, 
              y: -40, 
              scale: 1.1, 
              duration: 0.1, 
              ease: "power3.in" 
            },
            timing.end - 0.05 // Un poil avant la fin absolue du slot pour éviter le chevauchement
          );
        } else {
          // Le dernier ("AVENIR") reste et grossit légèrement jusqu'à la fin absolue
          timeline.to(
            text,
            { 
              scale: 1.1, 
              opacity: 1, // Reste visible
              duration: timing.end - timing.start, 
              ease: "none" 
            },
            timing.start
          );
          
          // Fade out final optionnel si on veut qu'il disparaisse juste avant de scroller vers la suite
          // timeline.to(text, { opacity: 0, duration: 0.1 }, 0.95);
        }
      });
    },
    { scope: container, dependencies: [isReady, videoDuration] }
  );

  return (
    <main ref={container} className="bg-background text-foreground selection:bg-accent selection:text-white font-sans">
      <CustomCursor />
      
      {/* --- HERO SECTION --- */}
      <section className="h-screen flex flex-col justify-center items-center relative overflow-hidden bg-cinematic text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800/30 via-black/80 to-black z-0"></div>
        <div className="z-10 text-center px-4">
          <h1 className="text-6xl md:text-9xl font-bold font-serif tracking-tight mb-6 text-white">
            WHY <span className="text-gold italic">US?</span>
          </h1>
          <p className="text-xl md:text-2xl text-zinc-300 max-w-2xl mx-auto font-light font-sans leading-relaxed">
            Découvrez pourquoi les leaders mondiaux choisissent l'excellence.
            <br />
            <span className="text-sm uppercase tracking-[0.3em] mt-8 inline-block text-gold/80 font-medium">
              Scrollez pour explorer
            </span>
          </p>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <ArrowRight className="rotate-90 text-gold w-8 h-8" />
        </div>
      </section>

      {/* --- SCROLLYTELLING VIDEO SECTION --- */}
      <section id="video-section" className="h-screen w-full relative overflow-hidden bg-black">
        {/* VIDEO BACKGROUND */}
        <video
          ref={videoRef}
          src="/videos/hero-coin.mp4"
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-50"
          style={{ objectPosition: "center" }}
        />
        
        {/* OVERLAY DARKNESS */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 z-10" />

        {/* TEXTES FLOTTANTS */}
        <div ref={textContainerRef} className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          
          <div className="scroll-text absolute text-center px-6">
            <h2 className="text-5xl md:text-8xl font-serif font-bold text-white mb-4 tracking-tight">
              PRÉCISION
            </h2>
            <p className="text-xl md:text-3xl text-zinc-200 font-light max-w-3xl font-sans">
              Chaque transaction est calculée au micron près. <br/>
              <span className="text-gold">Zéro marge d'erreur.</span>
            </p>
          </div>

          <div className="scroll-text absolute text-center px-6 opacity-0">
            <h2 className="text-5xl md:text-8xl font-serif font-bold text-white mb-4 tracking-tight">
              VITESSE
            </h2>
            <p className="text-xl md:text-3xl text-zinc-200 font-light max-w-3xl font-sans">
              Plus rapide que la lumière. <br/>
              <span className="text-gold">Exécution instantanée.</span>
            </p>
          </div>

          <div className="scroll-text absolute text-center px-6 opacity-0">
            <h2 className="text-5xl md:text-8xl font-serif font-bold text-white mb-4 tracking-tight">
              SÉCURITÉ
            </h2>
            <p className="text-xl md:text-3xl text-zinc-200 font-light max-w-3xl font-sans">
              Une forteresse numérique imprenable. <br/>
              <span className="text-gold">Totalement inviolable.</span>
            </p>
          </div>

           <div className="scroll-text absolute text-center px-6 opacity-0">
            <h2 className="text-5xl md:text-8xl font-serif font-bold text-white mb-4 tracking-tight">
              AVENIR
            </h2>
            <p className="text-xl md:text-3xl text-zinc-200 font-light max-w-3xl font-sans">
              Rejoignez le mouvement. <br/>
              <span className="text-gold">Définissez les standards de demain.</span>
            </p>
          </div>

        </div>
      </section>

      {/* --- GRID FEATURES SECTION --- */}
      <section className="min-h-screen bg-background py-24 px-6 md:px-12 relative z-30">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20">
            <h2 className="text-4xl md:text-6xl font-serif font-bold mb-6 text-foreground">
              L'Excellence <span className="text-accent italic">Redéfinie</span>
            </h2>
            <div className="h-1 w-24 bg-accent"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="group p-8 border border-border bg-white hover:border-accent/50 transition-colors duration-500 rounded-sm shadow-sm hover:shadow-soft">
              <div className="w-12 h-12 bg-secondary/30 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6 text-foreground" />
              </div>
              <h3 className="text-2xl font-serif font-bold mb-4 text-foreground">Architecture Robuste</h3>
              <p className="text-muted-foreground leading-relaxed font-sans">
                Construit sur des fondations solides, notre système garantit une disponibilité de 99.99% même lors des pics de charge les plus intenses.
              </p>
            </div>

            {/* Card 2 */}
            <div className="group p-8 border border-border bg-white hover:border-accent/50 transition-colors duration-500 rounded-sm shadow-sm hover:shadow-soft">
              <div className="w-12 h-12 bg-secondary/30 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-foreground" />
              </div>
              <h3 className="text-2xl font-serif font-bold mb-4 text-foreground">Performance Éclair</h3>
              <p className="text-muted-foreground leading-relaxed font-sans">
                Une latence réduite au minimum absolu. Profitez d'une réactivité qui donne l'impression d'anticiper vos moindres désirs.
              </p>
            </div>

            {/* Card 3 */}
            <div className="group p-8 border border-border bg-white hover:border-accent/50 transition-colors duration-500 rounded-sm shadow-sm hover:shadow-soft">
              <div className="w-12 h-12 bg-secondary/30 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Globe className="w-6 h-6 text-foreground" />
              </div>
              <h3 className="text-2xl font-serif font-bold mb-4 text-foreground">Portée Globale</h3>
              <p className="text-muted-foreground leading-relaxed font-sans">
                Connectez-vous au monde entier sans frontières. Notre infrastructure distribuée assure une présence locale partout.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER CTA --- */}
      <section className="h-[50vh] flex flex-col justify-center items-center bg-cinematic text-white text-center px-4 relative overflow-hidden">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <h2 className="text-5xl md:text-8xl font-serif font-bold tracking-tight mb-8 z-10">
          PRÊT ?
        </h2>
        <Link 
          href="/signup" 
          className="group relative z-10 inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-cinematic transition-all duration-300 bg-accent rounded-sm hover:bg-white hover:scale-105"
        >
          <span className="font-sans tracking-wide text-deep-black">COMMENCER L'EXPÉRIENCE</span>
          <ArrowRight className="ml-2 w-5 h-5 text-deep-black group-hover:translate-x-1 transition-transform" />
        </Link>
      </section>

    </main>
  );
}
