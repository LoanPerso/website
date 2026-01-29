"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslations } from "next-intl";

gsap.registerPlugin(ScrollTrigger);

// Icons
function StampIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
      <rect x="3" y="14" width="18" height="7" rx="1" />
      <path d="M8 14V8a4 4 0 0 1 8 0v6" />
      <path d="M12 4V2" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
      <path d="M2 12h4M18 12h4M12 2v4" strokeDasharray="2 2" />
    </svg>
  );
}

function DoorIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
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
  const bgRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const grainRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("why-us.problem");

  const painPoints = [
    { icon: "stamp", key: "rejected" },
    { icon: "clock", key: "waiting" },
    { icon: "user", key: "number" },
    { icon: "door", key: "atypical" },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Start with grid and grain hidden
      gsap.set([gridRef.current, grainRef.current], { opacity: 0 });

      // Background lightens as you scroll through section
      gsap.to(bgRef.current, {
        opacity: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "20% top",
          end: "60% top",
          scrub: 0.5,
        },
      });

      // Grid and grain fade in
      gsap.to(gridRef.current, {
        opacity: 0.05,
        ease: "power2.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "30% top",
          end: "70% top",
          scrub: 0.5,
        },
      });

      gsap.to(grainRef.current, {
        opacity: 0.03,
        ease: "power2.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "30% top",
          end: "70% top",
          scrub: 0.5,
        },
      });

      // Title animation - starts hidden below and fades in moving up
      gsap.set(titleRef.current, { opacity: 0, y: 60 });

      // Animate title when section is well into viewport
      gsap.to(titleRef.current, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 25%",
          toggleActions: "play none none none",
        },
      });

      // Cards stagger animation
      const cards = cardsRef.current?.querySelectorAll(".pain-card");
      if (cards) {
        gsap.fromTo(
          cards,
          {
            opacity: 0,
            y: 60,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: cardsRef.current,
              start: "top 80%",
            },
          }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen py-24 md:py-32 overflow-hidden"
      style={{ backgroundColor: "#0B0B0C" }} // Same black as hero transition
    >
      {/* Background that fades in - creates the lightening effect */}
      <div ref={bgRef} className="absolute inset-0 z-0 opacity-0">
        {/* Slightly lighter gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0B0C] via-zinc-900/50 to-[#0B0B0C]" />
      </div>

      {/* Grid Pattern - starts hidden */}
      <div
        ref={gridRef}
        className="absolute inset-0 z-[1]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Grain - starts hidden */}
      <div ref={grainRef} className="absolute inset-0 z-[1] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />


      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 md:px-12">
        {/* Title */}
        <div ref={titleRef} className="text-center mb-16 md:mb-24 opacity-0">
          <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full border border-[#C8A96A]/30 bg-[#C8A96A]/5 mb-6">
            <span className="text-xs font-medium uppercase tracking-widest text-[#C8A96A]">
              {t("eyebrow")}
            </span>
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-white leading-[1.1]">
            {t("title")}
            <br />
            <span className="italic text-[#C8A96A]">{t("titleAccent")}</span>
          </h2>
        </div>

        {/* Pain points grid */}
        <div
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-6xl mx-auto"
        >
          {painPoints.map((point, index) => {
            const IconComponent = iconComponents[point.icon as keyof typeof iconComponents];
            return (
              <div
                key={index}
                className="pain-card group relative p-8 md:p-12 rounded-lg border border-white/[0.03] bg-white/[0.01] overflow-hidden hover:bg-white/[0.03] transition-all duration-500"
              >
                {/* Hover Glow */}
                <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-red-500/10 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                {/* Icon */}
                <div className="relative z-10 mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 ease-out">
                    <IconComponent className="w-8 h-8 text-zinc-400 group-hover:text-red-400 transition-colors duration-300" />
                  </div>
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <h3 className="text-2xl md:text-3xl font-serif text-white mb-4 group-hover:translate-x-1 transition-transform duration-300">
                    {t(`painPoints.${point.key}.title`)}
                  </h3>
                  <p className="text-base md:text-lg text-zinc-500 leading-relaxed max-w-md group-hover:text-zinc-400 transition-colors duration-300">
                    {t(`painPoints.${point.key}.description`)}
                  </p>
                </div>
                
                {/* Bottom line */}
                <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gradient-to-r from-red-500/50 to-transparent group-hover:w-full transition-all duration-1000 ease-in-out" />
              </div>
            );
          })}
        </div>

        {/* Bottom statement */}
        <div className="mt-24 md:mt-32 text-center">
          <p className="text-xl text-zinc-600 italic font-light">
            {t("bottomQuote")}
          </p>
          <div className="mt-8 flex justify-center">
            <div className="w-px h-24 bg-gradient-to-b from-zinc-800 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default WhyUsProblem;