"use client";

import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/_lib/utils";

gsap.registerPlugin(ScrollTrigger);

interface CounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  delay?: number;
  className?: string;
  trigger?: "scroll" | "load";
  decimals?: number;
}

export function Counter({
  value,
  suffix = "",
  prefix = "",
  duration = 2,
  delay = 0,
  className,
  trigger = "scroll",
  decimals = 0,
}: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (!ref.current || hasAnimated) return;

    const element = ref.current;
    const counter = { value: 0 };

    const animate = () => {
      gsap.to(counter, {
        value,
        duration,
        delay,
        ease: "power2.out",
        onUpdate: () => {
          if (element) {
            const displayValue =
              decimals > 0
                ? counter.value.toFixed(decimals)
                : Math.floor(counter.value);
            element.textContent = `${prefix}${displayValue}${suffix}`;
          }
        },
        onComplete: () => setHasAnimated(true),
      });
    };

    if (trigger === "load") {
      animate();
    } else {
      ScrollTrigger.create({
        trigger: element,
        start: "top 85%",
        onEnter: animate,
        once: true,
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === element) st.kill();
      });
    };
  }, [value, duration, delay, suffix, prefix, trigger, decimals, hasAnimated]);

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {prefix}0{suffix}
    </span>
  );
}

export default Counter;
