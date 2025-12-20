"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return; // Disable on touch

    const cursor = cursorRef.current;
    const follower = followerRef.current;
    
    const moveCursor = (e: MouseEvent) => {
      gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.1 });
      gsap.to(follower, { x: e.clientX, y: e.clientY, duration: 0.5 });
    };

    const handleHover = () => {
      gsap.to(cursor, { scale: 0.5, duration: 0.3 });
      gsap.to(follower, { scale: 3, opacity: 0.5, backgroundColor: "#C8A96A", duration: 0.3 });
    };

    const handleUnhover = () => {
      gsap.to(cursor, { scale: 1, duration: 0.3 });
      gsap.to(follower, { scale: 1, opacity: 1, backgroundColor: "transparent", duration: 0.3 });
    };

    window.addEventListener("mousemove", moveCursor);
    
    const links = document.querySelectorAll("a, button, .magnetic");
    links.forEach((link) => {
      link.addEventListener("mouseenter", handleHover);
      link.addEventListener("mouseleave", handleUnhover);
    });

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      links.forEach((link) => {
        link.removeEventListener("mouseenter", handleHover);
        link.removeEventListener("mouseleave", handleUnhover);
      });
    };
  }, []);

  return (
    <>
      <div ref={cursorRef} className="fixed top-0 left-0 w-2 h-2 bg-gold rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 mix-blend-difference" />
      <div ref={followerRef} className="fixed top-0 left-0 w-8 h-8 border border-gold rounded-full pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2 transition-colors duration-300" />
    </>
  );
}
