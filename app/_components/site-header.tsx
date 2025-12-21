"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

import { marketingNav } from "@/_config/navigation";
import Magnetic from "@/_components/ui/magnetic-button";

export function SiteHeader() {
  const headerRef = useRef<HTMLElement>(null);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const header = headerRef.current;
      
      if (!header) return;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down
        gsap.to(header, { yPercent: -100, duration: 0.3, ease: "power2.out" });
      } else {
        // Scrolling up
        gsap.to(header, { yPercent: 0, duration: 0.3, ease: "power2.out" });
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <header ref={headerRef} className="fixed top-0 left-0 w-full z-50 mix-blend-difference text-white py-6 transition-colors duration-300">
      <div className="container mx-auto px-4 flex items-center justify-between">
        
        <Magnetic>
          <Link href="/" className="text-2xl font-serif font-bold tracking-tighter">
            WEBSITE
          </Link>
        </Magnetic>

        <nav className="hidden md:flex items-center gap-8">
          {marketingNav.map((item) => (
            <Magnetic key={item.href}>
              <Link href={item.href} className="text-sm uppercase tracking-widest hover:text-gold transition-colors">
                {item.label}
              </Link>
            </Magnetic>
          ))}
        </nav>

        <Magnetic>
          <Link href="/dashboard" className="hidden md:inline-flex px-6 py-3 border border-white/20 rounded-full text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-300">
            Espace Client
          </Link>
        </Magnetic>
      </div>
    </header>
  );
}