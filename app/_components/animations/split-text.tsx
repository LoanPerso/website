"use client";

import { useRef, useEffect, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/_lib/utils";

gsap.registerPlugin(ScrollTrigger);

type SplitType = "chars" | "words" | "lines";
type AnimationType = "fade-up" | "fade-in" | "slide-up" | "slide-left" | "scale";

interface SplitTextProps {
  children: string;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";
  className?: string;
  splitType?: SplitType;
  animation?: AnimationType;
  duration?: number;
  stagger?: number;
  delay?: number;
  ease?: string;
  trigger?: "load" | "scroll" | "none";
  scrub?: boolean | number;
  start?: string;
  end?: string;
  once?: boolean;
  onComplete?: () => void;
}

export function SplitText({
  children,
  as: Component = "div",
  className,
  splitType = "chars",
  animation = "fade-up",
  duration = 0.8,
  stagger = 0.02,
  delay = 0,
  ease = "power4.out",
  trigger = "scroll",
  scrub = false,
  start = "top 85%",
  end = "top 20%",
  once = true,
  onComplete,
}: SplitTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const elementsRef = useRef<HTMLSpanElement[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const elements = elementsRef.current;
    if (elements.length === 0) return;

    // Initial state based on animation type
    const fromVars = getFromVars(animation);
    const toVars = getToVars(animation, duration, ease);

    gsap.set(elements, fromVars);

    if (trigger === "none") {
      return;
    }

    if (trigger === "load") {
      gsap.to(elements, {
        ...toVars,
        stagger,
        delay,
        onComplete,
      });
    } else {
      // Scroll trigger
      const scrollConfig: ScrollTrigger.Vars = {
        trigger: containerRef.current,
        start,
        end,
        toggleActions: once ? "play none none none" : "play reverse play reverse",
      };

      if (scrub) {
        scrollConfig.scrub = typeof scrub === "number" ? scrub : 1;
      }

      gsap.to(elements, {
        ...toVars,
        stagger,
        delay,
        scrollTrigger: scrollConfig,
        onComplete,
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === containerRef.current) {
          st.kill();
        }
      });
    };
  }, [children, animation, duration, stagger, delay, ease, trigger, scrub, start, end, once, onComplete]);

  // Split text into elements
  const splitContent = (): ReactNode[] => {
    elementsRef.current = [];

    if (splitType === "chars") {
      return children.split("").map((char, i) => (
        <span
          key={i}
          ref={(el) => {
            if (el) elementsRef.current.push(el);
          }}
          className="inline-block"
          style={{ whiteSpace: char === " " ? "pre" : "normal" }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ));
    }

    if (splitType === "words") {
      return children.split(" ").map((word, i, arr) => (
        <span key={i} className="inline-block">
          <span
            ref={(el) => {
              if (el) elementsRef.current.push(el);
            }}
            className="inline-block"
          >
            {word}
          </span>
          {i < arr.length - 1 && <span>&nbsp;</span>}
        </span>
      ));
    }

    // Lines - split by \n or treat whole text as one line
    const lines = children.includes("\n") ? children.split("\n") : [children];
    return lines.map((line, i) => (
      <span key={i} className="block overflow-hidden">
        <span
          ref={(el) => {
            if (el) elementsRef.current.push(el);
          }}
          className="inline-block"
        >
          {line}
        </span>
      </span>
    ));
  };

  return (
    <Component ref={containerRef} className={cn("overflow-hidden", className)}>
      {splitContent()}
    </Component>
  );
}

// Animation presets
function getFromVars(animation: AnimationType): gsap.TweenVars {
  switch (animation) {
    case "fade-up":
      return { opacity: 0, y: 50 };
    case "fade-in":
      return { opacity: 0 };
    case "slide-up":
      return { y: "100%" };
    case "slide-left":
      return { x: 50, opacity: 0 };
    case "scale":
      return { opacity: 0, scale: 0.8 };
    default:
      return { opacity: 0, y: 50 };
  }
}

function getToVars(animation: AnimationType, duration: number, ease: string): gsap.TweenVars {
  const base = { duration, ease };
  switch (animation) {
    case "fade-up":
      return { ...base, opacity: 1, y: 0 };
    case "fade-in":
      return { ...base, opacity: 1 };
    case "slide-up":
      return { ...base, y: "0%" };
    case "slide-left":
      return { ...base, x: 0, opacity: 1 };
    case "scale":
      return { ...base, opacity: 1, scale: 1 };
    default:
      return { ...base, opacity: 1, y: 0 };
  }
}

// Pre-configured variants for common use cases
export function HeroTitle({ children, className, delay = 0 }: { children: string; className?: string; delay?: number }) {
  return (
    <SplitText
      as="h1"
      className={cn("font-serif text-6xl md:text-8xl lg:text-9xl font-medium tracking-tight", className)}
      splitType="chars"
      animation="slide-up"
      duration={1.2}
      stagger={0.03}
      delay={delay}
      trigger="load"
      ease="power4.out"
    >
      {children}
    </SplitText>
  );
}

export function RevealHeading({ children, className, as = "h2" }: { children: string; className?: string; as?: "h1" | "h2" | "h3" }) {
  return (
    <SplitText
      as={as}
      className={cn("font-serif text-4xl md:text-6xl lg:text-7xl font-medium", className)}
      splitType="lines"
      animation="slide-up"
      duration={1}
      stagger={0.15}
      trigger="scroll"
      ease="power3.out"
    >
      {children}
    </SplitText>
  );
}

export function FadeWords({ children, className }: { children: string; className?: string }) {
  return (
    <SplitText
      as="p"
      className={cn("text-lg md:text-xl text-muted-foreground", className)}
      splitType="words"
      animation="fade-up"
      duration={0.6}
      stagger={0.04}
      trigger="scroll"
      ease="power2.out"
    >
      {children}
    </SplitText>
  );
}
