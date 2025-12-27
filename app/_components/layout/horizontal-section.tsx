"use client";

import { useRef, useEffect, useState, type ReactNode, Children } from "react";
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
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile on mount
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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

  // Mobile: Stack Cards animation
  useEffect(() => {
    if (!mobileContainerRef.current) return;

    const mm = gsap.matchMedia();

    mm.add("(max-width: 767px)", () => {
      const cards = mobileContainerRef.current?.querySelectorAll(".stack-card");
      if (!cards || cards.length === 0) return;

      cards.forEach((card, index) => {
        // Skip the last card (no exit animation needed)
        if (index === cards.length - 1) return;

        gsap.to(card, {
          scale: 0.85,
          opacity: 0,
          y: -50,
          scrollTrigger: {
            trigger: card,
            start: "top 15%",
            end: "bottom 15%",
            scrub: 0.5,
            // Each card stays pinned until it animates out
          },
        });
      });

      // Entrance animations for each card
      cards.forEach((card, index) => {
        if (index === 0) return; // First card is already visible

        gsap.fromTo(
          card,
          { y: 60, opacity: 0.3 },
          {
            y: 0,
            opacity: 1,
            scrollTrigger: {
              trigger: card,
              start: "top 90%",
              end: "top 60%",
              scrub: 0.5,
            },
          }
        );
      });
    });

    return () => mm.revert();
  }, [isMobile]);

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

      {/* Mobile Version: Stack Cards */}
      <div
        ref={mobileContainerRef}
        className={cn("md:hidden", className)}
      >
        {Children.map(children, (child, index) => (
          <div
            key={index}
            className="stack-card sticky top-0 min-h-screen flex items-center justify-center will-change-transform"
            style={{ zIndex: panels - index }}
          >
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
        "flex-shrink-0 w-screen h-full md:h-full flex items-center justify-center px-6 py-12 md:py-0 md:px-16",
        className
      )}
    >
      {children}
    </div>
  );
}

export default HorizontalSection;
