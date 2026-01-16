"use client";

import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function WhyUsHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const eyebrowRef = useRef<HTMLSpanElement>(null);
  const titleLine1Ref = useRef<HTMLSpanElement>(null);
  const titleLine2Ref = useRef<HTMLSpanElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const blackOverlayRef = useRef<HTMLDivElement>(null);
  const transitionTextRef = useRef<HTMLDivElement>(null);
  const problemTitleRef = useRef<HTMLDivElement>(null);
  const [videoReady, setVideoReady] = useState(false);

  // Preload video and ensure first frame is visible
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = async () => {
      video.currentTime = 0;
      // Play then immediately pause to force first frame render
      try {
        await video.play();
        video.pause();
        video.currentTime = 0;
      } catch {
        // Autoplay blocked, but that's fine - we just need the frame
      }
      setVideoReady(true);
    };

    // Force load
    video.load();

    if (video.readyState >= 3) {
      handleCanPlay();
    } else {
      video.addEventListener("canplay", handleCanPlay, { once: true });
    }

    return () => {
      video.removeEventListener("canplay", handleCanPlay);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const section = sectionRef.current;
    const container = containerRef.current;
    if (!video || !section || !container || !videoReady) return;

    const ctx = gsap.context(() => {
      // Set initial states
      gsap.set([eyebrowRef.current, titleLine1Ref.current, titleLine2Ref.current, taglineRef.current, subtitleRef.current], {
        opacity: 0,
        y: 40,
      });
      gsap.set(overlayRef.current, { opacity: 0 });
      gsap.set(blackOverlayRef.current, { opacity: 0 });
      gsap.set(transitionTextRef.current, { opacity: 0, y: 30, scale: 1 });
      gsap.set(problemTitleRef.current, { opacity: 0, y: 50 });

      // Pin container for entire section
      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        pin: container,
        pinSpacing: false,
      });

      // Video playback: 0% to 60% of scroll
      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "60% top",
        scrub: 0.5,
        onUpdate: (self) => {
          if (video.duration) {
            video.currentTime = self.progress * video.duration;
          }
        },
      });

      // Text appears: 0% to 40%
      const textTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "40% top",
          scrub: 0.3,
        },
      });

      textTimeline.to(overlayRef.current, { opacity: 1, duration: 0.2 }, 0);
      textTimeline.to(eyebrowRef.current, { opacity: 1, y: 0, duration: 0.15 }, 0.1);
      textTimeline.to(titleLine1Ref.current, { opacity: 1, y: 0, duration: 0.2 }, 0.2);
      textTimeline.to(titleLine2Ref.current, { opacity: 1, y: 0, duration: 0.2 }, 0.35);
      textTimeline.to(taglineRef.current, { opacity: 1, y: 0, duration: 0.15 }, 0.5);
      textTimeline.to(subtitleRef.current, { opacity: 1, y: 0, duration: 0.15 }, 0.65);

      // Black overlay fades in OVER everything: 50% to 65%
      gsap.to(blackOverlayRef.current, {
        opacity: 1,
        ease: "power2.inOut",
        scrollTrigger: {
          trigger: section,
          start: "50% top",
          end: "65% top",
          scrub: 0.5,
        },
      });

      // Single timeline for all transition animations
      // Starts at 65% when black overlay is fully opaque
      const transitionTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "65% top",
          end: "100% top",
          scrub: 1,
        },
      });

      // "Mais d'abord" appears
      transitionTl.to(transitionTextRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.12,
      });

      // Stay visible briefly
      transitionTl.to(transitionTextRef.current, {
        opacity: 1,
        duration: 0.06,
      });

      // "Mais d'abord" disappears quickly (shrinks and goes up)
      transitionTl.to(transitionTextRef.current, {
        opacity: 0,
        y: -150,
        scale: 0.8,
        duration: 0.12,
        ease: "power2.in",
      });

      // Problem title appears
      transitionTl.to(problemTitleRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.15,
      });

      // Stay visible for a long time (stable at center)
      transitionTl.to(problemTitleRef.current, {
        opacity: 1,
        duration: 0.55,
      });
    });

    return () => ctx.revert();
  }, [videoReady]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full"
      style={{ height: "500vh" }}
    >
      <div ref={containerRef} className="h-[100dvh] w-full overflow-hidden">
        {/* Video background */}
        <video
          ref={videoRef}
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ backgroundColor: "#0B0B0C" }}
        >
          <source src="/videos/hero-coin.mp4" type="video/mp4" />
        </video>

        {/* Gradient overlay for text readability */}
        <div
          ref={overlayRef}
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(to right, rgba(11,11,12,0.7) 0%, rgba(11,11,12,0.3) 50%, transparent 100%)",
          }}
        />

        {/* Black overlay - fades in OVER everything */}
        <div
          ref={blackOverlayRef}
          className="absolute inset-0 z-30 pointer-events-none bg-[#0B0B0C]"
        />

        {/* Hero text content */}
        <div className="relative z-10 h-full flex items-center">
          <div className="px-8 sm:px-12 lg:px-20 xl:px-28 max-w-xl lg:max-w-2xl">
            <span
              ref={eyebrowRef}
              className="inline-flex items-center gap-3 text-xs sm:text-sm uppercase tracking-[0.25em] font-medium mb-6 text-[#C8A96A]"
            >
              <span className="w-8 h-[1px] bg-[#C8A96A]" />
              Financement Premium
            </span>

            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-white leading-[0.95] tracking-tight mb-6">
              <span ref={titleLine1Ref} className="block">
                L'or se réinvente.
              </span>
              <span ref={titleLine2Ref} className="block mt-2">
                <span className="text-[#C8A96A] italic">Votre crédit</span> aussi.
              </span>
            </h1>

            <p
              ref={taglineRef}
              className="font-serif text-lg sm:text-xl md:text-2xl text-white/70 mb-6"
            >
              La noblesse du métal. La vitesse du digital.
            </p>

            <p
              ref={subtitleRef}
              className="text-sm sm:text-base text-white/60 max-w-md leading-relaxed"
            >
              De 500€ à 75 000€, obtenez une réponse de principe en 24h — sans engagement, 100% en ligne.
            </p>
          </div>
        </div>

        {/* Transition text - appears on black (above overlay) */}
        <div
          ref={transitionTextRef}
          className="absolute inset-0 z-40 flex items-center justify-center"
        >
          <div className="text-center px-8">
            <p className="text-[#C8A96A] text-sm uppercase tracking-[0.3em] mb-4">
              Mais d'abord
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white font-light">
              Parlons de <span className="italic text-[#C8A96A]">ce qui ne va pas</span>
            </h2>
          </div>
        </div>

        {/* Problem section title - appears after transition text disappears */}
        <div
          ref={problemTitleRef}
          className="absolute inset-0 z-40 flex items-center justify-center"
        >
          <div className="text-center px-8">
            <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full border border-[#C8A96A]/30 bg-[#C8A96A]/5 mb-6">
              <span className="text-xs font-medium uppercase tracking-widest text-[#C8A96A]">
                Le constat
              </span>
            </div>
            <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-white leading-[1.1]">
              Le système bancaire
              <br />
              <span className="italic text-[#C8A96A]">vous a oublié</span>
            </h2>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40 z-10">
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <div className="w-[1px] h-8 bg-gradient-to-b from-white/40 to-transparent" />
        </div>
      </div>
    </section>
  );
}

export default WhyUsHero;