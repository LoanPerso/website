"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);
  const isOnIconTarget = useRef(false);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const cursor = cursorRef.current;
    const follower = followerRef.current;
    if (!cursor || !follower) return;

    const moveCursor = (e: MouseEvent) => {
      gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.1 });
      // Only follow mouse if not on icon target
      if (!isOnIconTarget.current) {
        gsap.to(follower, { x: e.clientX, y: e.clientY, duration: 0.5 });
      }
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Check for icon target first - just fade out cursor
      const iconTarget = target.closest(".cursor-icon-target");
      if (iconTarget) {
        isOnIconTarget.current = true;
        gsap.to(cursor, { opacity: 0, scale: 0, duration: 0.3, ease: "power2.out" });
        gsap.to(follower, { opacity: 0, scale: 0, duration: 0.3, ease: "power2.out" });
        return;
      }

      // Check for links/buttons
      const link = target.closest("a, button, .magnetic");
      if (link) {
        gsap.to(cursor, { scale: 0.5, duration: 0.3 });
        gsap.to(follower, { scale: 3, opacity: 0.5, backgroundColor: "#C8A96A", duration: 0.3 });
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const relatedTarget = e.relatedTarget as HTMLElement;

      // Leaving icon target - fade cursor back in
      const iconTarget = target.closest(".cursor-icon-target");
      const stillOnIcon = relatedTarget?.closest(".cursor-icon-target");

      if (iconTarget && !stillOnIcon) {
        isOnIconTarget.current = false;
        gsap.to(cursor, { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" });
        gsap.to(follower, { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" });
        return;
      }

      // Leaving links/buttons
      const link = target.closest("a, button, .magnetic");
      const stillOnLink = relatedTarget?.closest("a, button, .magnetic");

      if (link && !stillOnLink && !isOnIconTarget.current) {
        gsap.to(cursor, { scale: 1, duration: 0.3 });
        gsap.to(follower, { scale: 1, opacity: 1, backgroundColor: "transparent", duration: 0.3 });
      }
    };

    window.addEventListener("mousemove", moveCursor);
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
    };
  }, []);

  return (
    <>
      <div ref={cursorRef} className="fixed top-0 left-0 w-2 h-2 bg-gold rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 mix-blend-difference" />
      <div ref={followerRef} className="fixed top-0 left-0 w-8 h-8 border border-gold rounded-full pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2" />
    </>
  );
}
