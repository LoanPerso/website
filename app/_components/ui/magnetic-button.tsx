"use client";

import { useRef, ReactNode, MouseEvent } from "react";
import gsap from "gsap";

export default function Magnetic({
  children,
  strength = 0.3,
}: {
  children: ReactNode;
  // Multiplier applied to pointer delta (0 = no movement, ~0.3 = subtle, >0.5 = strong).
  strength?: number;
}) {
  const magnetic = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = magnetic.current!.getBoundingClientRect();
    const x = clientX - (left + width / 2);
    const y = clientY - (top + height / 2);

    gsap.to(magnetic.current, {
      x: x * strength,
      y: y * strength,
      duration: 1,
      ease: "elastic.out(1, 0.3)",
    });
  };

  const handleMouseLeave = () => {
    gsap.to(magnetic.current, { x: 0, y: 0, duration: 1, ease: "elastic.out(1, 0.3)" });
  };

  return (
    <div
      ref={magnetic}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="magnetic inline-block cursor-pointer"
    >
      {children}
    </div>
  );
}
