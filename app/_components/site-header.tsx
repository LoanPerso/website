"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useTranslations } from "next-intl";

import { Link } from "@/_i18n/navigation";
import { marketingNav } from "@/_config/navigation";
import Magnetic from "@/_components/ui/magnetic-button";
import { LanguageSwitcher } from "@/_components/language-switcher";

export function SiteHeader() {
  const t = useTranslations("common");
  const headerRef = useRef<HTMLElement>(null);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuItemsRef = useRef<HTMLDivElement>(null);

  // Hide/show header on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (isMenuOpen) return; // Don't hide when menu is open

      const currentScrollY = window.scrollY;
      const header = headerRef.current;

      if (!header) return;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        gsap.to(header, { yPercent: -100, duration: 0.3, ease: "power2.out" });
      } else {
        gsap.to(header, { yPercent: 0, duration: 0.3, ease: "power2.out" });
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, isMenuOpen]);

  // Animate menu open/close
  useEffect(() => {
    if (!menuRef.current || !menuItemsRef.current) return;

    const menuItems = menuItemsRef.current.children;

    if (isMenuOpen) {
      // Prevent body scroll
      document.body.style.overflow = "hidden";

      // Animate menu in
      gsap.to(menuRef.current, {
        clipPath: "circle(150% at calc(100% - 40px) 40px)",
        duration: 0.6,
        ease: "power3.inOut",
      });

      // Animate menu items
      gsap.fromTo(
        menuItems,
        { opacity: 0, y: 40, filter: "blur(10px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.5,
          stagger: 0.08,
          delay: 0.2,
          ease: "power3.out",
        }
      );
    } else {
      // Allow body scroll
      document.body.style.overflow = "";

      // Animate menu out
      gsap.to(menuRef.current, {
        clipPath: "circle(0% at calc(100% - 40px) 40px)",
        duration: 0.5,
        ease: "power3.inOut",
      });

      // Reset menu items
      gsap.to(menuItems, {
        opacity: 0,
        y: 20,
        duration: 0.2,
        ease: "power2.in",
      });
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <>
      <header
        ref={headerRef}
        className="fixed top-0 left-0 w-full z-50 mix-blend-difference text-white py-6 transition-colors duration-300"
      >
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Magnetic>
            <Link href="/" className="text-2xl font-serif font-bold tracking-tighter">
              <span className="font-medium">Quick</span>fund
            </Link>
          </Magnetic>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {marketingNav.map((item) => (
              <Magnetic key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm uppercase tracking-widest hover:text-gold transition-colors"
                >
                  {t(item.labelKey)}
                </Link>
              </Magnetic>
            ))}
          </nav>

          {/* Desktop CTA + Language */}
          <div className="hidden md:flex items-center gap-4">
            <Magnetic>
              <Link
                href="/login"
                className="px-6 py-3 border border-white/20 rounded-full text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-300"
              >
                {t("nav.clientArea")}
              </Link>
            </Magnetic>
            <LanguageSwitcher variant="desktop" />
          </div>

          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            className="md:hidden relative w-10 h-10 flex items-center justify-center z-[60]"
            aria-label="Toggle menu"
          >
            <div className="relative w-6 h-4 flex flex-col justify-between">
              <span
                className={`block h-[2px] bg-current transition-all duration-300 origin-center ${
                  isMenuOpen ? "rotate-45 translate-y-[7px]" : ""
                }`}
              />
              <span
                className={`block h-[2px] bg-current transition-all duration-300 ${
                  isMenuOpen ? "opacity-0 scale-0" : ""
                }`}
              />
              <span
                className={`block h-[2px] bg-current transition-all duration-300 origin-center ${
                  isMenuOpen ? "-rotate-45 -translate-y-[7px]" : ""
                }`}
              />
            </div>
          </button>
        </div>
      </header>

      {/* Mobile menu overlay */}
      <div
        ref={menuRef}
        className="fixed inset-0 z-40 bg-foreground md:hidden"
        style={{ clipPath: "circle(0% at calc(100% - 40px) 40px)" }}
      >
        <div className="h-full flex flex-col justify-center items-center px-8">
          <nav ref={menuItemsRef} className="flex flex-col items-center gap-8">
            {marketingNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="text-background text-3xl font-serif font-light tracking-tight hover:text-accent transition-colors"
              >
                {t(item.labelKey)}
              </Link>
            ))}
            <div className="mt-8 pt-8 border-t border-background/10 w-full flex flex-col items-center gap-6">
              <LanguageSwitcher variant="mobile" />
              <Link
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                className="px-8 py-4 bg-background text-foreground font-medium text-sm uppercase tracking-widest hover:bg-accent transition-colors"
              >
                {t("nav.clientArea")}
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
