"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export default function Preloader() {
  const [loaded, setLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => setLoaded(true),
    });

    tl.to(progressRef.current, {
      scaleX: 1,
      duration: 1.5,
      ease: "power2.inOut",
    })
    .to(textRef.current, {
      y: -100,
      opacity: 0,
      duration: 0.8,
      ease: "power3.in",
    })
    .to(containerRef.current, {
      yPercent: -100,
      duration: 1,
      ease: "expo.inOut",
    }, "-=0.2");
    
    // Prevent scrolling while loading, but only on desktop if desired, 
    // or ensure it gets removed safely.
    document.body.style.overflow = "hidden";
    
    // Safety timeout
    const timeout = setTimeout(() => {
        document.body.style.overflow = "";
        setLoaded(true);
    }, 4000);

    return () => {
      document.body.style.overflow = "";
      clearTimeout(timeout);
    };
  }, []);

  if (loaded) return null;

  return (
    <div ref={containerRef} className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-deep-black text-white">
      <div className="overflow-hidden">
        <h1 ref={textRef} className="text-4xl md:text-6xl font-serif tracking-widest uppercase">
          Finance <span className="text-gold italic">Elevated</span>
        </h1>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10">
        <div ref={progressRef} className="h-full bg-gold w-full origin-left scale-x-0" />
      </div>
    </div>
  );
}
