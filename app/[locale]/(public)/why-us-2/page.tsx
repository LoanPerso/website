"use client";

import { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowRight, Shield, Zap, Globe, Quote, Target, Cpu, TrendingUp } from "lucide-react";
import Link from "next/link";
import CustomCursor from "@/_components/ui/custom-cursor";
import { cn } from "@/_lib/utils";
import { HorizontalSection, HorizontalPanel } from "@/_components/layout/horizontal-section";
import { Counter } from "@/_components/animations/counter";
import { ScrollReveal, Parallax } from "@/_components/animations/scroll-reveal";
import { SplitText } from "@/_components/animations/split-text";

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
    <main ref={container} className="bg-background text-foreground selection:bg-accent selection:text-white font-sans overflow-x-hidden">
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

      {/* --- BIG NUMBERS SECTION (Cinematic Impact) --- */}
      <section className="bg-black py-32 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
            <div className="text-center group">
              <ScrollReveal direction="up" delay={0.1}>
                <div className="text-gold/20 text-9xl font-bold absolute -top-10 left-1/2 -translate-x-1/2 select-none group-hover:text-gold/30 transition-colors duration-700">01</div>
                <div className="relative">
                  <div className="text-6xl md:text-8xl font-serif font-bold text-white mb-2">
                    <Counter end={99} suffix=".9%" />
                  </div>
                  <p className="text-zinc-400 uppercase tracking-widest text-sm font-medium">Uptime Garanti</p>
                </div>
              </ScrollReveal>
            </div>
            
            <div className="text-center group">
              <ScrollReveal direction="up" delay={0.2}>
                <div className="text-gold/20 text-9xl font-bold absolute -top-10 left-1/2 -translate-x-1/2 select-none group-hover:text-gold/30 transition-colors duration-700">02</div>
                <div className="relative">
                  <div className="text-6xl md:text-8xl font-serif font-bold text-white mb-2">
                    <Counter end={250} suffix="M+" />
                  </div>
                  <p className="text-zinc-400 uppercase tracking-widest text-sm font-medium">Transactions / Sec</p>
                </div>
              </ScrollReveal>
            </div>

            <div className="text-center group">
              <ScrollReveal direction="up" delay={0.3}>
                <div className="text-gold/20 text-9xl font-bold absolute -top-10 left-1/2 -translate-x-1/2 select-none group-hover:text-gold/30 transition-colors duration-700">03</div>
                <div className="relative">
                  <div className="text-6xl md:text-8xl font-serif font-bold text-white mb-2">
                    <Counter end={120} suffix="+" />
                  </div>
                  <p className="text-zinc-400 uppercase tracking-widest text-sm font-medium">Pays Connectés</p>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent"></div>
      </section>

      {/* --- HORIZONTAL STORYTELLING SECTION --- */}
      <HorizontalSection panels={3} className="bg-black">
        {/* Panel 1: Vision */}
        <HorizontalPanel className="bg-black text-white relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center max-w-6xl w-full">
            <div className="order-2 md:order-1">
              <span className="text-gold text-sm font-medium uppercase tracking-[0.4em] block mb-6">Notre Vision</span>
              <h2 className="text-4xl md:text-6xl font-serif font-bold mb-8 leading-tight">
                L'Art de la <br/><span className="italic text-gold">Disruption</span>
              </h2>
              <p className="text-lg md:text-xl text-zinc-400 font-light leading-relaxed mb-10 max-w-md">
                Nous ne construisons pas seulement des outils financiers. Nous sculptons l'infrastructure d'un monde sans frictions, où la technologie s'efface devant l'expérience.
              </p>
              <div className="flex items-center gap-4 group cursor-pointer">
                <div className="w-12 h-12 rounded-full border border-gold/30 flex items-center justify-center group-hover:bg-gold transition-all duration-500">
                  <ArrowRight className="w-5 h-5 group-hover:text-black transition-colors" />
                </div>
                <span className="text-sm font-bold tracking-widest uppercase group-hover:text-gold transition-colors">Explorer notre manifeste</span>
              </div>
            </div>
            <div className="order-1 md:order-2 relative aspect-square">
               <Parallax speed={-20} className="w-full h-full">
                  <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-700/50 shadow-2xl overflow-hidden">
                    <Cpu className="w-32 h-32 text-gold/20 animate-pulse" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_rgba(212,175,55,0.1),_transparent)]"></div>
                  </div>
               </Parallax>
            </div>
          </div>
        </HorizontalPanel>

        {/* Panel 2: Technology */}
        <HorizontalPanel className="bg-zinc-950 text-white relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center max-w-6xl w-full">
            <div className="relative aspect-square">
               <Parallax speed={20} className="w-full h-full">
                  <div className="w-full h-full bg-gradient-to-tr from-zinc-900 to-black rounded-2xl flex items-center justify-center border border-zinc-800 shadow-2xl overflow-hidden">
                    <Target className="w-32 h-32 text-gold/20" />
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                  </div>
               </Parallax>
            </div>
            <div>
              <span className="text-gold text-sm font-medium uppercase tracking-[0.4em] block mb-6">Technologie</span>
              <h2 className="text-4xl md:text-6xl font-serif font-bold mb-8 leading-tight">
                Ingénierie de <br/><span className="italic text-gold">Haut Niveau</span>
              </h2>
              <ul className="space-y-6">
                {[
                  { title: "Protocoles Quantiques", desc: "Sécurité de grade militaire pour chaque octet." },
                  { title: "Moteur Temps Réel", desc: "Latence inférieure à 1ms en conditions réelles." },
                  { title: "IA Prédictive", desc: "Anticipation des flux de marché en temps réel." }
                ].map((item, i) => (
                  <li key={i} className="flex gap-4 group">
                    <div className="mt-1.5 w-2 h-2 rounded-full bg-gold shrink-0 group-hover:scale-150 transition-transform"></div>
                    <div>
                      <h4 className="font-bold text-white group-hover:text-gold transition-colors">{item.title}</h4>
                      <p className="text-zinc-500 text-sm">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </HorizontalPanel>

        {/* Panel 3: Impact */}
        <HorizontalPanel className="bg-black text-white relative">
           <div className="text-center max-w-4xl mx-auto">
              <TrendingUp className="w-16 h-16 text-gold mx-auto mb-10" />
              <h2 className="text-5xl md:text-8xl font-serif font-bold mb-10 leading-tight">
                VOTRE <span className="text-gold italic">IMPACT</span> <br/>COMMENCE ICI
              </h2>
              <p className="text-xl md:text-2xl text-zinc-400 font-light max-w-2xl mx-auto leading-relaxed mb-12">
                Rejoignez les institutions qui façonnent l'économie de demain avec une longueur d'avance technologique sans précédent.
              </p>
              <Link href="/contact" className="inline-block border-b-2 border-gold pb-2 text-gold font-bold tracking-widest uppercase hover:text-white hover:border-white transition-all duration-300">
                Prendre rendez-vous
              </Link>
           </div>
        </HorizontalPanel>
      </HorizontalSection>

      {/* --- BIG QUOTE SECTION --- */}
      <section className="py-40 bg-white text-black px-6">
        <div className="max-w-5xl mx-auto text-center">
          <Quote className="w-16 h-16 text-zinc-200 mx-auto mb-12" />
          <ScrollReveal direction="up">
            <h2 className="text-3xl md:text-6xl font-serif font-medium leading-tight mb-16 italic text-black">
              "L'innovation n'est pas une destination, c'est une exigence constante envers soi-même. Chez Horizon, nous ne suivons pas les tendances, nous les créons."
            </h2>
            <div className="flex flex-col items-center">
              <div className="w-16 h-px bg-gold mb-6"></div>
              <p className="font-bold tracking-widest uppercase text-sm">Directeur de l'Innovation</p>
              <p className="text-zinc-500 text-xs mt-1">HORIZON SYSTEMS</p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* --- REFINED GRID FEATURES --- */}
      <section className="bg-zinc-50 py-32 px-6 md:px-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
            <div className="max-w-2xl">
              <ScrollReveal direction="left">
                <h2 className="text-4xl md:text-7xl font-serif font-bold text-black mb-8">
                  L'Excellence <span className="text-gold italic">dans les Détails</span>
                </h2>
                <p className="text-zinc-600 text-lg md:text-xl font-light leading-relaxed">
                  Chaque aspect de notre plateforme a été conçu avec une attention méticuleuse pour offrir une expérience sans compromis.
                </p>
              </ScrollReveal>
            </div>
            <div className="h-px w-full md:w-32 bg-zinc-300 mb-4 hidden md:block"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
            {/* Card 1 */}
            <ScrollReveal direction="up" delay={0.1} className="h-full">
              <div className="group p-12 bg-white hover:bg-black transition-colors duration-700 h-full flex flex-col border border-zinc-100 shadow-sm">
                <Shield className="w-10 h-10 text-gold mb-10 group-hover:scale-110 transition-transform duration-500" />
                <h3 className="text-2xl font-serif font-bold mb-6 group-hover:text-white transition-colors">Souveraineté Totale</h3>
                <p className="text-zinc-500 group-hover:text-zinc-400 leading-relaxed font-sans mb-10">
                  Gardez le contrôle total de vos actifs avec des protocoles de garde décentralisés et transparents.
                </p>
                <div className="mt-auto pt-6 border-t border-zinc-100 group-hover:border-zinc-800 transition-colors">
                  <span className="text-xs font-bold tracking-[0.2em] uppercase group-hover:text-gold transition-colors">En savoir plus</span>
                </div>
              </div>
            </ScrollReveal>

            {/* Card 2 */}
            <ScrollReveal direction="up" delay={0.2} className="h-full">
              <div className="group p-12 bg-white hover:bg-black transition-colors duration-700 h-full flex flex-col border border-zinc-100 shadow-sm">
                <Zap className="w-10 h-10 text-gold mb-10 group-hover:scale-110 transition-transform duration-500" />
                <h3 className="text-2xl font-serif font-bold mb-6 group-hover:text-white transition-colors">Évolutivité Infinie</h3>
                <p className="text-zinc-500 group-hover:text-zinc-400 leading-relaxed font-sans mb-10">
                  Une architecture capable de supporter des volumes institutionnels sans dégradation de performance.
                </p>
                <div className="mt-auto pt-6 border-t border-zinc-100 group-hover:border-zinc-800 transition-colors">
                  <span className="text-xs font-bold tracking-[0.2em] uppercase group-hover:text-gold transition-colors">En savoir plus</span>
                </div>
              </div>
            </ScrollReveal>

            {/* Card 3 */}
            <ScrollReveal direction="up" delay={0.3} className="h-full">
              <div className="group p-12 bg-white hover:bg-black transition-colors duration-700 h-full flex flex-col border border-zinc-100 shadow-sm">
                <Globe className="w-10 h-10 text-gold mb-10 group-hover:scale-110 transition-transform duration-500" />
                <h3 className="text-2xl font-serif font-bold mb-6 group-hover:text-white transition-colors">Écosystème Ouvert</h3>
                <p className="text-zinc-500 group-hover:text-zinc-400 leading-relaxed font-sans mb-10">
                  Intégration transparente avec vos systèmes existants via notre API de nouvelle génération.
                </p>
                <div className="mt-auto pt-6 border-t border-zinc-100 group-hover:border-zinc-800 transition-colors">
                  <span className="text-xs font-bold tracking-[0.2em] uppercase group-hover:text-gold transition-colors">En savoir plus</span>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* --- FOOTER CTA --- */}
      <section className="h-screen flex flex-col justify-center items-center bg-black text-white text-center px-4 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.05)_0%,_transparent_50%)] animate-pulse"></div>
        
        <div className="z-10 relative">
          <ScrollReveal direction="up">
            <span className="text-gold text-sm font-medium uppercase tracking-[0.5em] block mb-8">L'étape suivante</span>
            <h2 className="text-6xl md:text-9xl font-serif font-bold tracking-tight mb-16">
              LE FUTUR <br/><span className="italic">VOUS ATTEND</span>
            </h2>
            <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
              <Link 
                href="/signup" 
                className="group relative inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-black transition-all duration-300 bg-gold rounded-full hover:bg-white hover:scale-105"
              >
                <span className="font-sans tracking-wide">OUVRIR UN COMPTE</span>
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/demo" 
                className="group relative inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-white transition-all duration-300 border border-zinc-700 rounded-full hover:border-gold hover:bg-gold/5"
              >
                <span className="font-sans tracking-wide">DEMANDER UNE DÉMO</span>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

    </main>
  );
}
