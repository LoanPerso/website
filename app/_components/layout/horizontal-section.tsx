"use client";

import { useRef, useEffect, type ReactNode } from "react";
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

  useEffect(() => {
    if (!containerRef.current || !wrapperRef.current) return;

    // Only enable on desktop
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

  return (
    <div
      ref={containerRef}
      className={cn("overflow-hidden", className)}
      style={{ height }}
    >
      <div
        ref={wrapperRef}
        className={cn(
          "flex h-full will-change-transform",
          panelClassName
        )}
        style={{ width: `${panels * 100}vw` }}
      >
        {children}
      </div>
    </div>
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
        "flex-shrink-0 w-screen h-full flex items-center justify-center px-8 md:px-16",
        className
      )}
    >
      {children}
    </div>
  );
}

export default HorizontalSection;
