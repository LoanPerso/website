"use client";

import { useRef, useEffect, type ReactNode, Children } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/_lib/utils";

gsap.registerPlugin(ScrollTrigger);

interface HorizontalSectionProps {
  children: ReactNode;
  className?: string;
  panelClassName?: string;
  panels: number;
  height?: string;
}

export function HorizontalSection({
  children,
  className,
  panelClassName,
  panels,
  height = "100vh",
}: HorizontalSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mobileContainerRef = useRef<HTMLDivElement>(null);

  // Desktop: Horizontal scroll animation
  useEffect(() => {
    if (!containerRef.current || !wrapperRef.current) return;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;

      const scrollWidth = wrapper.scrollWidth;
      const containerWidth = containerRef.current?.clientWidth || 0;
      const distance = scrollWidth - containerWidth;

      gsap.to(wrapper, {
        x: -distance,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: () => `+=${distance}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
    });

    return () => mm.revert();
  }, [panels]);

  // Mobile: Simple fade-in animation on scroll
  useEffect(() => {
    if (!mobileContainerRef.current) return;

    const mm = gsap.matchMedia();

    mm.add("(max-width: 767px)", () => {
      const cards = mobileContainerRef.current?.querySelectorAll(".mobile-card");
      if (!cards || cards.length === 0) return;

      cards.forEach((card, index) => {
        if (index === 0) return; // First card already visible

        gsap.fromTo(
          card,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          }
        );
      });
    });

    return () => mm.revert();
  }, []);

  return (
    <>
      {/* Desktop Version: Horizontal Scroll */}
      <div
        ref={containerRef}
        className={cn("overflow-hidden hidden md:block", className)}
        style={{ height }}
      >
        <div
          ref={wrapperRef}
          className={cn("flex h-full will-change-transform", panelClassName)}
          style={{ width: `${panels * 100}vw` }}
        >
          {children}
        </div>
      </div>

      {/* Mobile Version: Simple vertical scroll */}
      <div
        ref={mobileContainerRef}
        className={cn("md:hidden", className)}
      >
        {Children.map(children, (child, index) => (
          <div key={index} className="mobile-card">
            {child}
          </div>
        ))}
      </div>
    </>
  );
}

interface HorizontalPanelProps {
  children: ReactNode;
  className?: string;
}

export function HorizontalPanel({ children, className }: HorizontalPanelProps) {
  return (
    <div
      className={cn(
        "flex-shrink-0 w-screen h-full flex items-center justify-center",
        "px-5 py-16 md:py-0 md:px-16",
        "min-h-[100dvh] md:min-h-0",
        className
      )}
    >
      {children}
    </div>
  );
}

export default HorizontalSection;
