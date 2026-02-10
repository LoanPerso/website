"use client";

import { useRef, useEffect, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/_lib/utils";

gsap.registerPlugin(ScrollTrigger);

type RevealAnimation =
  | "fade"
  | "fade-up"
  | "fade-down"
  | "fade-left"
  | "fade-right"
  | "scale"
  | "scale-up"
  | "slide-up"
  | "slide-down"
  | "slide-left"
  | "slide-right"
  | "rotate"
  | "blur";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  // Back-compat sugar used across pages (e.g. direction="up").
  // Prefer `animation` for more control.
  direction?: "up" | "down" | "left" | "right";
  animation?: RevealAnimation;
  duration?: number;
  delay?: number;
  ease?: string;
  start?: string;
  end?: string;
  scrub?: boolean | number;
  once?: boolean;
  stagger?: number;
  markers?: boolean;
}

export function ScrollReveal({
  children,
  className,
  direction,
  animation,
  duration = 1,
  delay = 0,
  ease = "power3.out",
  start = "top 85%",
  end = "top 20%",
  scrub = false,
  once = true,
  stagger = 0,
  markers = false,
}: ScrollRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const element = containerRef.current;
    const resolvedAnimation =
      animation ?? directionToAnimation(direction) ?? ("fade-up" as const);
    const fromVars = getFromVars(resolvedAnimation);
    const toVars = getToVars(resolvedAnimation, duration, ease);

    // Set initial state
    gsap.set(element, fromVars);

    // Create scroll trigger animation
    const scrollConfig: ScrollTrigger.Vars = {
      trigger: element,
      start,
      end,
      toggleActions: once ? "play none none none" : "play reverse play reverse",
      markers,
    };

    if (scrub) {
      scrollConfig.scrub = typeof scrub === "number" ? scrub : 1;
    }

    const tween = gsap.to(element, {
      ...toVars,
      delay,
      scrollTrigger: scrollConfig,
    });

    return () => {
      tween.kill();
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === element) {
          st.kill();
        }
      });
    };
  }, [animation, direction, duration, delay, ease, start, end, scrub, once, stagger, markers]);

  return (
    <div ref={containerRef} className={cn(className)}>
      {children}
    </div>
  );
}

function directionToAnimation(
  direction: ScrollRevealProps["direction"],
): RevealAnimation | undefined {
  switch (direction) {
    case "up":
      return "fade-up";
    case "down":
      return "fade-down";
    case "left":
      return "fade-left";
    case "right":
      return "fade-right";
    default:
      return undefined;
  }
}

// Staggered children reveal
interface StaggerRevealProps {
  children: ReactNode[];
  className?: string;
  childClassName?: string;
  animation?: RevealAnimation;
  duration?: number;
  stagger?: number;
  delay?: number;
  ease?: string;
  start?: string;
  once?: boolean;
}

export function StaggerReveal({
  children,
  className,
  childClassName,
  animation = "fade-up",
  duration = 0.8,
  stagger = 0.1,
  delay = 0,
  ease = "power3.out",
  start = "top 85%",
  once = true,
}: StaggerRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (!containerRef.current || itemsRef.current.length === 0) return;

    const items = itemsRef.current;
    const fromVars = getFromVars(animation);
    const toVars = getToVars(animation, duration, ease);

    gsap.set(items, fromVars);

    const scrollConfig: ScrollTrigger.Vars = {
      trigger: containerRef.current,
      start,
      toggleActions: once ? "play none none none" : "play reverse play reverse",
    };

    const tween = gsap.to(items, {
      ...toVars,
      stagger,
      delay,
      scrollTrigger: scrollConfig,
    });

    return () => {
      tween.kill();
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === containerRef.current) {
          st.kill();
        }
      });
    };
  }, [children, animation, duration, stagger, delay, ease, start, once]);

  return (
    <div ref={containerRef} className={cn(className)}>
      {children.map((child, i) => (
        <div
          key={i}
          ref={(el) => {
            if (el) itemsRef.current[i] = el;
          }}
          className={cn(childClassName)}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

// Animation presets
function getFromVars(animation: RevealAnimation): gsap.TweenVars {
  switch (animation) {
    case "fade":
      return { opacity: 0 };
    case "fade-up":
      return { opacity: 0, y: 60 };
    case "fade-down":
      return { opacity: 0, y: -60 };
    case "fade-left":
      return { opacity: 0, x: 60 };
    case "fade-right":
      return { opacity: 0, x: -60 };
    case "scale":
      return { opacity: 0, scale: 0.9 };
    case "scale-up":
      return { opacity: 0, scale: 0.8, y: 40 };
    case "slide-up":
      return { y: "100%", opacity: 0 };
    case "slide-down":
      return { y: "-100%", opacity: 0 };
    case "slide-left":
      return { x: "100%", opacity: 0 };
    case "slide-right":
      return { x: "-100%", opacity: 0 };
    case "rotate":
      return { opacity: 0, rotation: 10, y: 40 };
    case "blur":
      return { opacity: 0, filter: "blur(10px)" };
    default:
      return { opacity: 0, y: 60 };
  }
}

function getToVars(animation: RevealAnimation, duration: number, ease: string): gsap.TweenVars {
  const base = { duration, ease };
  switch (animation) {
    case "fade":
      return { ...base, opacity: 1 };
    case "fade-up":
    case "fade-down":
      return { ...base, opacity: 1, y: 0 };
    case "fade-left":
    case "fade-right":
      return { ...base, opacity: 1, x: 0 };
    case "scale":
      return { ...base, opacity: 1, scale: 1 };
    case "scale-up":
      return { ...base, opacity: 1, scale: 1, y: 0 };
    case "slide-up":
    case "slide-down":
      return { ...base, y: "0%", opacity: 1 };
    case "slide-left":
    case "slide-right":
      return { ...base, x: "0%", opacity: 1 };
    case "rotate":
      return { ...base, opacity: 1, rotation: 0, y: 0 };
    case "blur":
      return { ...base, opacity: 1, filter: "blur(0px)" };
    default:
      return { ...base, opacity: 1, y: 0 };
  }
}

// Parallax wrapper
interface ParallaxProps {
  children: ReactNode;
  className?: string;
  speed?: number; // -1 to 1, negative = slower, positive = faster
  start?: string;
  end?: string;
}

export function Parallax({
  children,
  className,
  speed = 0.5,
  start = "top bottom",
  end = "bottom top",
}: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const yPercent = speed * 100;

    const tween = gsap.fromTo(
      ref.current,
      { yPercent: -yPercent },
      {
        yPercent: yPercent,
        ease: "none",
        scrollTrigger: {
          trigger: ref.current,
          start,
          end,
          scrub: true,
        },
      }
    );

    return () => {
      tween.kill();
    };
  }, [speed, start, end]);

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  );
}
