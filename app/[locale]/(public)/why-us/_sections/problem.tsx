"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const painPoints = [
  {
    icon: "stamp",
    title: "Refusé sans explication",
    description: "Les banques vous disent non, mais jamais pourquoi. Vous restez dans le flou, sans savoir comment améliorer votre dossier.",
  },
  {
    icon: "clock",
    title: "3 semaines d'attente",
    description: "Des rendez-vous, de la paperasse, des allers-retours. Pendant que votre projet attend, l'opportunité s'envole.",
  },
  {
    icon: "user",
    title: "Traité comme un numéro",
    description: "Aucun accompagnement, aucune humanité. Juste un dossier parmi des milliers, traité par un algorithme froid.",
  },
  {
    icon: "door",
    title: "Profil atypique = porte fermée",
    description: "Freelance, étudiant, jeune actif ? Le système bancaire n'est pas fait pour vous. Bienvenue dans l'exclusion financière.",
  },
];

function StampIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="14" width="18" height="7" rx="1" />
      <path d="M8 14V8a4 4 0 0 1 8 0v6" />
      <path d="M12 4V2" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
      <path d="M2 12h4M18 12h4M12 2v4" strokeDasharray="2 2" />
    </svg>
  );
}

function DoorIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="4" y="2" width="16" height="20" rx="1" />
      <path d="M15 12h.01" />
      <path d="M4 2h16" />
    </svg>
  );
}

const iconComponents = {
  stamp: StampIcon,
  clock: ClockIcon,
  user: UserIcon,
  door: DoorIcon,
};

export function WhyUsProblem() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: titleRef.current,
            start: "top 80%",
          },
        }
      );

      // Cards stagger animation
      const cards = cardsRef.current?.querySelectorAll(".pain-card");
      if (cards) {
        gsap.fromTo(
          cards,
          {
            opacity: 0,
            y: 80,
            scale: 0.95,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: "power3.out",
            scrollTrigger: {
              trigger: cardsRef.current,
              start: "top 75%",
            },
          }
        );

        // Shake effect on cards when fully visible
        cards.forEach((card, index) => {
          ScrollTrigger.create({
            trigger: card,
            start: "top 60%",
            onEnter: () => {
              // Subtle shake using GSAP
              const iconContainer = card.querySelector(".icon-container");
              gsap.fromTo(
                iconContainer,
                { rotation: 0 },
                {
                  rotation: 0,
                  duration: 0.5,
                  delay: index * 0.1,
                  ease: "elastic.out(1, 0.3)",
                  keyframes: [
                    { rotation: -5, duration: 0.1 },
                    { rotation: 5, duration: 0.1 },
                    { rotation: -3, duration: 0.1 },
                    { rotation: 3, duration: 0.1 },
                    { rotation: 0, duration: 0.1 },
                  ],
                }
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
      className="relative min-h-screen py-24 md:py-32 overflow-hidden"
    >
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-30"
          poster="/videos/why-us/problem-poster.jpg"
        >
          <source src="/videos/why-us/problem-loop.mp4" type="video/mp4" />
          <source src="/videos/why-us/problem-loop.webm" type="video/webm" />
        </video>

        {/* Fallback cold gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-900" />
      </div>

      {/* Overlay with cold tint */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-background via-slate-950/95 to-background" />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 z-[2] opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 md:px-12">
        {/* Title */}
        <div ref={titleRef} className="text-center mb-16 md:mb-24">
          <span className="inline-block text-sm uppercase tracking-[0.3em] text-red-400/70 mb-4">
            Le constat
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-white leading-tight">
            Le système bancaire
            <br />
            <span className="text-slate-400">vous a oublié</span>
          </h2>
        </div>

        {/* Pain points grid */}
        <div
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto"
        >
          {painPoints.map((point, index) => {
            const IconComponent = iconComponents[point.icon as keyof typeof iconComponents];
            return (
              <div
                key={index}
                className="pain-card group relative p-8 md:p-10 rounded-sm border border-white/5 bg-white/[0.02] backdrop-blur-sm hover:bg-white/[0.04] hover:border-red-500/20 transition-all duration-500"
              >
                {/* Red accent line on hover */}
                <div className="absolute top-0 left-0 w-0 h-[2px] bg-red-500/50 group-hover:w-full transition-all duration-700" />

                {/* Icon */}
                <div className="icon-container mb-6">
                  <div className="w-14 h-14 rounded-sm bg-red-500/10 border border-red-500/20 flex items-center justify-center group-hover:bg-red-500/20 transition-colors duration-300">
                    <IconComponent className="w-7 h-7 text-red-400" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl md:text-2xl font-medium text-white mb-3 group-hover:text-red-100 transition-colors duration-300">
                  {point.title}
                </h3>
                <p className="text-base text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors duration-300">
                  {point.description}
                </p>

                {/* Corner decoration */}
                <div className="absolute bottom-4 right-4 w-8 h-8 border-b border-r border-white/5 group-hover:border-red-500/30 transition-colors duration-500" />
              </div>
            );
          })}
        </div>

        {/* Bottom statement */}
        <div className="mt-16 md:mt-24 text-center">
          <p className="text-lg md:text-xl text-slate-500 italic">
            "C'est comme ça, vous n'y pouvez rien."
          </p>
          <p className="mt-4 text-2xl md:text-3xl font-serif text-white">
            Vraiment ?
          </p>
        </div>
      </div>
    </section>
  );
}

export default WhyUsProblem;
