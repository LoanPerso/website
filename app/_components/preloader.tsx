"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export default function Preloader() {
  const [isComplete, setIsComplete] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const overlayTopRef = useRef<HTMLDivElement>(null);
  const overlayBottomRef = useRef<HTMLDivElement>(null);
  const charsRef = useRef<HTMLSpanElement[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          document.body.style.overflow = "";
          setIsComplete(true);
        },
      });

      // Prevent scroll during preloader
      document.body.style.overflow = "hidden";

      // Counter animation (0 → 100)
      const counter = { value: 0 };
      tl.to(counter, {
        value: 100,
        duration: 2,
        ease: "power2.inOut",
        onUpdate: () => {
          if (counterRef.current) {
            counterRef.current.textContent = Math.floor(counter.value).toString();
          }
        },
      });

      // Progress line
      tl.to(
        lineRef.current,
        {
          scaleX: 1,
          duration: 2,
          ease: "power2.inOut",
        },
        0
      );

      // Logo chars stagger reveal
      tl.fromTo(
        charsRef.current,
        {
          y: 100,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.05,
          ease: "power4.out",
        },
        0.3
      );

      // Pause at full load
      tl.to({}, { duration: 0.3 });

      // Exit animation - split curtain
      tl.to(counterRef.current, {
        opacity: 0,
        y: -20,
        duration: 0.4,
        ease: "power2.in",
      });

      tl.to(
        charsRef.current,
        {
          y: -80,
          opacity: 0,
          duration: 0.5,
          stagger: 0.02,
          ease: "power3.in",
        },
        "-=0.2"
      );

      tl.to(lineRef.current, {
        opacity: 0,
        duration: 0.3,
      }, "-=0.3");

      // Curtain split exit
      tl.to(
        overlayTopRef.current,
        {
          yPercent: -100,
          duration: 1,
          ease: "expo.inOut",
        },
        "-=0.1"
      );

      tl.to(
        overlayBottomRef.current,
        {
          yPercent: 100,
          duration: 1,
          ease: "expo.inOut",
        },
        "<"
      );
    });

    // Safety timeout
    const timeout = setTimeout(() => {
      document.body.style.overflow = "";
      setIsComplete(true);
    }, 5000);

    return () => {
      ctx.revert();
      document.body.style.overflow = "";
      clearTimeout(timeout);
    };
  }, []);

  if (isComplete) return null;

  // Split "QUICKFUND" into chars
  const brandName = "QUICKFUND";
  const chars = brandName.split("");

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] pointer-events-none"
    >
      {/* Top curtain */}
      <div
        ref={overlayTopRef}
        className="absolute inset-x-0 top-0 h-1/2 bg-deep-black flex items-end justify-center pb-0"
      />

      {/* Bottom curtain */}
      <div
        ref={overlayBottomRef}
        className="absolute inset-x-0 bottom-0 h-1/2 bg-deep-black flex items-start justify-center pt-0"
      />

      {/* Content layer */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-deep-black">
        {/* Counter */}
        <div className="absolute top-8 right-8 md:top-12 md:right-12">
          <span
            ref={counterRef}
            className="text-6xl md:text-8xl font-serif text-white/20 tabular-nums"
          >
            0
          </span>
        </div>

        {/* Logo / Brand */}
        <div ref={logoRef} className="overflow-hidden">
          <div className="flex">
            {chars.map((char, i) => (
              <span
                key={i}
                ref={(el) => {
                  if (el) charsRef.current[i] = el;
                }}
                className="text-5xl md:text-7xl lg:text-8xl font-serif text-white tracking-[0.2em] inline-block"
              >
                {char}
              </span>
            ))}
          </div>
        </div>

        {/* Tagline */}
        <p className="mt-4 text-sm md:text-base text-white/40 tracking-[0.3em] uppercase">
          Crédit Transparent
        </p>

        {/* Progress line */}
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-48 md:w-64">
          <div className="h-[1px] w-full bg-white/10">
            <div
              ref={lineRef}
              className="h-full w-full bg-accent origin-left scale-x-0"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
