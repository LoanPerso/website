"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

const services = [
  {
    title: "Gestion de Fortune",
    category: "Patrimoine",
    src: "https://images.unsplash.com/photo-1616047006789-b7af5afb8c20?q=80&w=2080&auto=format&fit=crop", // Luxury interior
    href: "/services/wealth"
  },
  {
    title: "Crédit Lombard",
    category: "Financement",
    src: "https://images.unsplash.com/photo-1565514020176-db7936a28186?q=80&w=2070&auto=format&fit=crop", // Gold/Watch detail
    href: "/services/lombard"
  },
  {
    title: "Art Advisory",
    category: "Investissement",
    src: "https://images.unsplash.com/photo-1564750974641-6d729c15e96f?q=80&w=1974&auto=format&fit=crop", // Art gallery
    href: "/services/art"
  },
  {
    title: "Conciergerie",
    category: "Lifestyle",
    src: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070&auto=format&fit=crop", // Luxury hotel/service
    href: "/services/concierge"
  }
];

export default function FeatureReveal() {
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorLabelRef = useRef<HTMLDivElement>(null);
  const cursorImgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only on desktop
    const isDesktop = window.matchMedia("(min-width: 768px)").matches;
    if (!isDesktop) return;

    const moveCursor = (e: MouseEvent) => {
      // Move image preview container
      gsap.to(cursorImgRef.current, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.45,
        ease: "power3.out",
      });
      
      // Move 'View' label
      gsap.to(cursorLabelRef.current, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.55, // Little delay for organic feel
        ease: "power3.out",
      });
    };

    window.addEventListener("mousemove", moveCursor);
    return () => window.removeEventListener("mousemove", moveCursor);
  }, []);

  const handleMouseEnter = (index: number, src: string) => {
    setActiveIndex(index);
    setActiveImage(src);
    
    // Scale up image wrapper
    gsap.to(cursorImgRef.current, { scale: 1, opacity: 1, duration: 0.4, ease: "power2.out" });
    // Show label
    gsap.to(cursorLabelRef.current, { scale: 1, opacity: 1, duration: 0.4, ease: "power2.out" });
  };

  const handleMouseLeave = () => {
    setActiveIndex(null);
    setActiveImage(null);
    
    // Scale down
    gsap.to(cursorImgRef.current, { scale: 0, opacity: 0, duration: 0.4, ease: "power2.out" });
    gsap.to(cursorLabelRef.current, { scale: 0, opacity: 0, duration: 0.4, ease: "power2.out" });
  };

  return (
    <section className="relative py-32 bg-background z-20 cursor-none" ref={containerRef}>
      <div className="container mx-auto px-4">
        <div className="mb-16 border-b border-border/40 pb-4 flex justify-between items-end">
           <h2 className="text-sm uppercase tracking-widest text-muted-foreground">Services Signature</h2>
           <span className="text-xs text-muted-foreground">[ 01 - 04 ]</span>
        </div>

        <div className="flex flex-col">
          {services.map((service, index) => (
            <Link 
              key={index} 
              href={service.href}
              className={`group relative flex items-center justify-between py-12 border-b border-border/20 transition-all duration-500 ${activeIndex !== null && activeIndex !== index ? "opacity-30 blur-[2px]" : "opacity-100"}`}
              onMouseEnter={() => handleMouseEnter(index, service.src)}
              onMouseLeave={handleMouseLeave}
            >
              <div className="flex items-baseline gap-8">
                 <span className="text-xs font-mono text-gold/80">0{index + 1}</span>
                 <h3 className="text-4xl md:text-7xl font-serif text-foreground group-hover:translate-x-4 transition-transform duration-500 ease-out">
                   {service.title}
                 </h3>
              </div>
              
              <div className="hidden md:flex items-center gap-4">
                 <span className="text-sm uppercase tracking-wider text-muted-foreground group-hover:text-gold transition-colors">{service.category}</span>
                 <ArrowUpRight className="w-6 h-6 text-foreground group-hover:rotate-45 transition-transform duration-500" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Floating Image Container (Fixed to viewport but moved by JS) */}
      <div 
        ref={cursorImgRef}
        className="fixed top-0 left-0 w-[400px] h-[500px] pointer-events-none overflow-hidden z-30 opacity-0 scale-0 -translate-x-1/2 -translate-y-1/2 hidden md:block"
      >
         {/* Inner container for image switching animation if needed, here just direct img */}
         {activeImage && (
           <img 
             src={activeImage} 
             alt="Service preview" 
             className="w-full h-full object-cover grayscale contrast-125"
           />
         )}
      </div>

      {/* Floating 'View' Label */}
      <div
        ref={cursorLabelRef}
        className="fixed top-0 left-0 w-20 h-20 bg-gold rounded-full flex items-center justify-center text-deep-black text-xs font-bold uppercase tracking-widest pointer-events-none z-40 opacity-0 scale-0 -translate-x-1/2 -translate-y-1/2 mix-blend-difference hidden md:flex"
      >
        View
      </div>

    </section>
  );
}
